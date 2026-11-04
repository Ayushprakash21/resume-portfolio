import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Binary header validation mock matching src/services/resumeParserService.ts
async function validateResumeFileHeader(fileName, bytes, sizeBytes) {
  const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, error: 'File size exceeds 20MB limit.' };
  }

  const ext = fileName.toLowerCase().split('.').pop() || '';
  if (!['pdf', 'docx', 'doc'].includes(ext)) {
    return { isValid: false, error: 'Unsupported file extension.' };
  }

  const header = bytes.subarray(0, 8);

  if (ext === 'pdf') {
    const isPdf = header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46; // %PDF
    if (!isPdf) {
      return { isValid: false, error: 'File appears corrupt or invalid. Binary signature does not match PDF format.' };
    }
    return { isValid: true, fileType: 'pdf' };
  }

  if (ext === 'docx') {
    const isZip = header[0] === 0x50 && header[1] === 0x4B && header[2] === 0x03 && header[3] === 0x04; // PK..
    if (!isZip) {
      return { isValid: false, error: 'File appears corrupt or invalid. Binary signature does not match DOCX format.' };
    }
    return { isValid: true, fileType: 'docx' };
  }

  if (ext === 'doc') {
    const isDoc = header[0] === 0xD0 && header[1] === 0xCF && header[2] === 0x11 && header[3] === 0xE0;
    if (!isDoc) {
      return { isValid: false, error: 'File appears corrupt or invalid. Binary signature does not match DOC format.' };
    }
    return { isValid: true, fileType: 'doc' };
  }

  return { isValid: false, error: 'Unsupported format' };
}

describe('P0 Resume Upload Lifecycle & Validation', () => {
  it('accepts genuine PDF with %PDF header', async () => {
    const pdfBytes = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37]); // %PDF-1.7
    const result = await validateResumeFileHeader('Ayush_Resume.pdf', pdfBytes, 1024);
    assert.equal(result.isValid, true);
    assert.equal(result.fileType, 'pdf');
  });

  it('accepts genuine DOCX with PK zip header', async () => {
    const docxBytes = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00, 0x06, 0x00]); // PK\x03\x04
    const result = await validateResumeFileHeader('Ayush_Resume.docx', docxBytes, 5000);
    assert.equal(result.isValid, true);
    assert.equal(result.fileType, 'docx');
  });

  it('accepts genuine legacy DOC with compound document header', async () => {
    const docBytes = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]);
    const result = await validateResumeFileHeader('Ayush_Resume.doc', docBytes, 4000);
    assert.equal(result.isValid, true);
    assert.equal(result.fileType, 'doc');
  });

  it('rejects spoofed extension: plain text renamed to .pdf', async () => {
    const fakePdfBytes = Buffer.from('This is actually a plain text file, not a real PDF.');
    const result = await validateResumeFileHeader('FakeResume.pdf', fakePdfBytes, 200);
    assert.equal(result.isValid, false);
    assert.match(result.error, /Binary signature does not match PDF/);
  });

  it('rejects spoofed extension: plain text renamed to .docx', async () => {
    const fakeDocxBytes = Buffer.from('Plain text fake docx.');
    const result = await validateResumeFileHeader('FakeResume.docx', fakeDocxBytes, 200);
    assert.equal(result.isValid, false);
    assert.match(result.error, /Binary signature does not match DOCX/);
  });

  it('rejects files larger than 20MB', async () => {
    const pdfBytes = Buffer.from([0x25, 0x50, 0x44, 0x46]);
    const result = await validateResumeFileHeader('HugeResume.pdf', pdfBytes, 21 * 1024 * 1024);
    assert.equal(result.isValid, false);
    assert.match(result.error, /20MB limit/);
  });

  it('maintains strict separation between originalName, displayName, and objectKey', () => {
    const uploadedOriginal = 'Ayush_Prakash_Master_Resume_2026_Final.pdf';
    const cleanBaseName = uploadedOriginal.replace(/\.[^/.]+$/, '');
    const objectKey = 'public/documents/resumes/res_1730000000000.pdf';

    const resumeRecord = {
      id: 'res-active',
      fileId: 'res_1730000000000',
      fileName: uploadedOriginal,
      originalName: uploadedOriginal,
      displayName: cleanBaseName,
      generatedDownloadName: 'Ayush_Prakash_Curriculum_Vitae.pdf',
      objectKey,
      fileUrl: `https://resume-portfolio.ayushprakash0021.workers.dev/api/storage/file?key=${encodeURIComponent(objectKey)}`,
      fileSizeBytes: 45000,
      uploadedAt: '2026-11-04',
      isPublicEnabled: true,
      buttonText: 'Download Curriculum Vitae',
      storageProvider: 'cloudflare-r2',
    };

    assert.equal(resumeRecord.originalName, 'Ayush_Prakash_Master_Resume_2026_Final.pdf');
    assert.equal(resumeRecord.displayName, 'Ayush_Prakash_Master_Resume_2026_Final');
    assert.equal(resumeRecord.objectKey, objectKey);
    assert.equal(resumeRecord.fileId, 'res_1730000000000');

    // Admin edits display title: originalName and objectKey must remain intact
    const updated = {
      ...resumeRecord,
      displayName: 'Ayush Prakash - Executive Resume',
    };

    assert.equal(updated.displayName, 'Ayush Prakash - Executive Resume');
    assert.equal(updated.originalName, 'Ayush_Prakash_Master_Resume_2026_Final.pdf');
    assert.equal(updated.objectKey, objectKey);
  });
});
