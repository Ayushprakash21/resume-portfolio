import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeForFirestore,
  validateFirestorePayload,
} from '../src/utils/firestoreSerializer.ts';

test('Firestore Serializer Suite', async (t) => {
  await t.test('1. Strips top-level undefined but preserves null, 0, false, and empty string', () => {
    const input = {
      name: 'Ayush Prakash',
      missingField: undefined,
      nullField: null,
      zeroField: 0,
      falseField: false,
      emptyString: '',
    };

    const cleaned = sanitizeForFirestore(input);
    assert.strictEqual('missingField' in cleaned, false, 'undefined property must be removed');
    assert.strictEqual(cleaned.name, 'Ayush Prakash');
    assert.strictEqual(cleaned.nullField, null, 'null must be preserved');
    assert.strictEqual(cleaned.zeroField, 0, 'zero must be preserved');
    assert.strictEqual(cleaned.falseField, false, 'false must be preserved');
    assert.strictEqual(cleaned.emptyString, '', 'empty string must be preserved');

    const validation = validateFirestorePayload(cleaned);
    assert.strictEqual(validation.valid, true, 'Cleaned payload must be valid for Firestore');
  });

  await t.test('2. Recursively strips deeply nested undefined properties', () => {
    const input = {
      profile: {
        headline: 'AI & Operations',
        draft: undefined,
        location: {
          city: 'Bengaluru',
          zip: undefined,
          isRemote: true,
        },
      },
    };

    const cleaned = sanitizeForFirestore(input);
    assert.strictEqual('draft' in cleaned.profile, false, 'nested undefined draft must be removed');
    assert.strictEqual('zip' in cleaned.profile.location, false, 'deeply nested undefined zip must be removed');
    assert.strictEqual(cleaned.profile.location.city, 'Bengaluru');
    assert.strictEqual(cleaned.profile.location.isRemote, true);

    const validation = validateFirestorePayload(cleaned);
    assert.strictEqual(validation.valid, true);
  });

  await t.test('3. Handles arrays properly without corrupting ordering', () => {
    const input = {
      skills: ['React', undefined, 'TypeScript', { name: 'Python', level: undefined }],
      numbers: [0, 1, 2],
    };

    const cleaned = sanitizeForFirestore(input);
    assert.strictEqual(cleaned.skills.length, 3, 'undefined array items must be removed');
    assert.strictEqual(cleaned.skills[0], 'React');
    assert.strictEqual(cleaned.skills[1], 'TypeScript');
    assert.strictEqual(cleaned.skills[2].name, 'Python');
    assert.strictEqual('level' in cleaned.skills[2], false);
    assert.deepStrictEqual(cleaned.numbers, [0, 1, 2]);

    const validation = validateFirestorePayload(cleaned);
    assert.strictEqual(validation.valid, true);
  });

  await t.test('4. Preserves Date instances and mock Firestore Timestamp', () => {
    const now = new Date();
    const mockTimestamp = {
      seconds: 1700000000,
      nanoseconds: 0,
      toMillis: () => 1700000000000,
      toDate: () => new Date(1700000000000),
    };

    const input = {
      createdAt: now,
      updatedAt: mockTimestamp,
      otherField: undefined,
    };

    const cleaned = sanitizeForFirestore(input);
    assert.strictEqual(cleaned.createdAt instanceof Date, true, 'Date instance must be preserved');
    assert.strictEqual(cleaned.createdAt.getTime(), now.getTime());
    assert.strictEqual(cleaned.updatedAt, mockTimestamp, 'Firestore Timestamp object must be preserved untouched');
    assert.strictEqual('otherField' in cleaned, false);

    const validation = validateFirestorePayload(cleaned);
    assert.strictEqual(validation.valid, true);
  });

  await t.test('5. Detects undefined fields correctly in validateFirestorePayload', () => {
    const invalidPayload = {
      user: {
        draft: undefined,
      },
    };
    const res = validateFirestorePayload(invalidPayload);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.path, 'user.draft');
  });
});
