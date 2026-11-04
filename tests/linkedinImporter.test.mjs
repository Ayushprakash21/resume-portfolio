import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';

// RFC 4180 CSV parser logic matching src/services/linkedinParserService.ts
function parseCSV(csvText) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let insideQuote = false;

  const len = csvText.length;
  for (let i = 0; i < len; i++) {
    const char = csvText[i];
    const nextChar = i + 1 < len ? csvText[i + 1] : '';

    if (insideQuote) {
      if (char === '"') {
        if (nextChar === '"') {
          currentCell += '"';
          i++;
        } else {
          insideQuote = false;
        }
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        insideQuote = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\r') {
        if (nextChar === '\n') i++;
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else if (char === '\n') {
        currentRow.push(currentCell.trim());
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  const results = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] !== undefined ? row[index] : '';
    });
    results.push(obj);
  }

  return results;
}

function normalizeHeaderKey(key) {
  return key.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getColumnValue(row, possibleKeys) {
  const normalizedRow = {};
  for (const [k, v] of Object.entries(row)) {
    normalizedRow[normalizeHeaderKey(k)] = v;
  }
  for (const pk of possibleKeys) {
    const norm = normalizeHeaderKey(pk);
    if (normalizedRow[norm] !== undefined && normalizedRow[norm] !== '') {
      return normalizedRow[norm];
    }
  }
  return undefined;
}

function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function validateZipArchiveSecurity(fileSizeBytes, filenames) {
  const MAX_COMPRESSED_SIZE_BYTES = 50 * 1024 * 1024;
  const MAX_ARCHIVE_ENTRIES = 150;

  if (fileSizeBytes > MAX_COMPRESSED_SIZE_BYTES) {
    throw new Error(`Archive size exceeds limit of 50MB.`);
  }

  if (filenames.length > MAX_ARCHIVE_ENTRIES) {
    throw new Error(`Security Exception: ZIP contains excessive entries (${filenames.length} > ${MAX_ARCHIVE_ENTRIES}).`);
  }

  for (const relativePath of filenames) {
    if (
      relativePath.includes('..') ||
      relativePath.startsWith('/') ||
      relativePath.startsWith('\\') ||
      /^[a-zA-Z]:/.test(relativePath)
    ) {
      throw new Error(`Security Exception: Invalid archive path detected: "${relativePath}". Path traversal rejected.`);
    }
  }
  return true;
}

describe('P1 LinkedIn Data Export Importer Service', () => {
  it('parses RFC 4180 CSV with quotes, commas, and multiline cells', () => {
    const csvData =
`"Company Name","Title","Description","Location","Started On","Finished On"
"Google","Senior Operations Lead","Led supply chain automation, cross-functional teams, and logistics.
Expanded throughput by 35%.","Mountain View, CA","Mar 2022","Present"
"Acme, Inc.","Product Analyst","Built financial models, dashboards, and automated reporting.","San Francisco","Jan 2020","Feb 2022"`;

    const records = parseCSV(csvData);
    assert.equal(records.length, 2);

    assert.equal(records[0]['Company Name'], 'Google');
    assert.equal(records[0]['Title'], 'Senior Operations Lead');
    assert.ok(records[0]['Description'].includes('Expanded throughput by 35%.'));
    assert.equal(records[0]['Location'], 'Mountain View, CA');
    assert.equal(records[0]['Started On'], 'Mar 2022');
    assert.equal(records[0]['Finished On'], 'Present');

    assert.equal(records[1]['Company Name'], 'Acme, Inc.');
    assert.equal(records[1]['Title'], 'Product Analyst');
  });

  it('handles variable header aliases across different LinkedIn export formats', () => {
    const row1 = { 'Company': 'Tesla', 'Role': 'Operations Specialist', 'Start Date': '2021-01' };
    const row2 = { 'Company Name': 'Tesla', 'Title': 'Operations Specialist', 'Started On': '2021-01' };
    const row3 = { 'Employer': 'Tesla', 'Job Title': 'Operations Specialist', 'From': '2021-01' };

    const company1 = getColumnValue(row1, ['companyname', 'company', 'employer']);
    const company2 = getColumnValue(row2, ['companyname', 'company', 'employer']);
    const company3 = getColumnValue(row3, ['companyname', 'company', 'employer']);

    assert.equal(company1, 'Tesla');
    assert.equal(company2, 'Tesla');
    assert.equal(company3, 'Tesla');

    const title1 = getColumnValue(row1, ['title', 'jobtitle', 'role']);
    const title2 = getColumnValue(row2, ['title', 'jobtitle', 'role']);
    const title3 = getColumnValue(row3, ['title', 'jobtitle', 'role']);

    assert.equal(title1, 'Operations Specialist');
    assert.equal(title2, 'Operations Specialist');
    assert.equal(title3, 'Operations Specialist');
  });

  it('detects duplicate CMS experience records and marks suggested action "skip"', () => {
    const existingExperiences = [
      { id: 'exp-1', employer: 'Google LLC', jobTitle: 'Operations Lead' },
      { id: 'exp-2', employer: 'Amazon', jobTitle: 'Area Manager' },
    ];

    const importedPositions = [
      { company: 'Google, LLC', title: 'Operations Lead' }, // Exact match
      { company: 'Google, LLC', title: 'Director' }, // Partial employer match -> update
      { company: 'Microsoft', title: 'Cloud Solutions Architect' }, // New record -> create
    ];

    const results = importedPositions.map((pos) => {
      const normCompany = normalizeString(pos.company);
      const normTitle = normalizeString(pos.title);

      const exact = existingExperiences.find(
        (e) => normalizeString(e.employer) === normCompany && normalizeString(e.jobTitle) === normTitle
      );
      const partial = !exact ? existingExperiences.find((e) => normalizeString(e.employer) === normCompany) : null;

      return {
        ...pos,
        suggestedAction: exact ? 'skip' : partial ? 'update' : 'create',
        matchedId: exact ? exact.id : partial ? partial.id : null,
      };
    });

    assert.equal(results[0].suggestedAction, 'skip');
    assert.equal(results[0].matchedId, 'exp-1');

    assert.equal(results[1].suggestedAction, 'update');
    assert.equal(results[1].matchedId, 'exp-1');

    assert.equal(results[2].suggestedAction, 'create');
    assert.equal(results[2].matchedId, null);
  });

  it('rejects path traversal attempts in ZIP archives', () => {
    const maliciousPaths = [
      '../../../etc/passwd',
      '..\\windows\\system32\\cmd.exe',
      '/var/www/html/index.php',
      'C:\\Users\\Ayush\\secret.txt',
    ];

    for (const badPath of maliciousPaths) {
      assert.throws(() => {
        validateZipArchiveSecurity(1000, [badPath]);
      }, /Path traversal rejected/);
    }
  });

  it('rejects decompression bombs: excessive file count or oversized compressed archive', () => {
    // Exceeds 50MB
    assert.throws(() => {
      validateZipArchiveSecurity(51 * 1024 * 1024, ['Positions.csv']);
    }, /exceeds limit of 50MB/);

    // Exceeds 150 entries
    const tooManyFiles = Array.from({ length: 151 }, (_, i) => `file_${i}.csv`);
    assert.throws(() => {
      validateZipArchiveSecurity(1000, tooManyFiles);
    }, /excessive entries/);
  });

  it('successfully creates and unpacks a simulated LinkedIn export ZIP with JSZip', async () => {
    const zip = new JSZip();
    zip.file('Positions.csv', `"Company Name","Title"\n"Meta","Product Manager"`);
    zip.file('Education.csv', `"School Name","Degree Name"\n"Stanford University","M.S. Operations Research"`);
    zip.file('Skills.csv', `"Name"\n"Supply Chain Optimization"\n"Enterprise Architecture"`);

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
    assert.ok(zipBuffer.length > 0);

    const loadedZip = await JSZip.loadAsync(zipBuffer);
    const filenames = Object.keys(loadedZip.files);

    assert.equal(validateZipArchiveSecurity(zipBuffer.length, filenames), true);
    assert.equal(filenames.length, 3);

    const posContent = await loadedZip.files['Positions.csv'].async('string');
    const parsedPositions = parseCSV(posContent);
    assert.equal(parsedPositions.length, 1);
    assert.equal(parsedPositions[0]['Company Name'], 'Meta');
    assert.equal(parsedPositions[0]['Title'], 'Product Manager');
  });
});
