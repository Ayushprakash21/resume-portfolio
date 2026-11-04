/**
 * Safe Firestore Document Serialization Utility
 * Ayush Prakash Personal Portfolio
 *
 * Recursively strips undefined object properties while strictly preserving:
 * - Intentional null, false, 0, and empty strings
 * - Array element integrity and ordering
 * - JavaScript Date objects and Firestore Timestamps
 * - Firestore FieldValues (serverTimestamp, deleteField, etc.)
 *
 * NOTE: Never uses JSON.parse(JSON.stringify()) which breaks Dates, Timestamps, and special objects.
 */

export function isPlainObject(val: unknown): val is Record<string, any> {
  if (val === null || typeof val !== 'object') return false;
  const proto = Object.getPrototypeOf(val);
  return proto === Object.prototype || proto === null;
}

export function isFirestoreSpecial(val: unknown): boolean {
  if (val === null || typeof val !== 'object') return false;
  // Date instance
  if (val instanceof Date) return true;
  // Firestore Timestamp (has toMillis or toDate)
  if (typeof (val as any).toMillis === 'function' || typeof (val as any).toDate === 'function') return true;
  // Firestore FieldValue / Sentinel
  if (typeof (val as any).isEqual === 'function' || (val as any)._methodName) return true;
  return false;
}

/**
 * Safely sanitizes any payload destined for Firestore setDoc / updateDoc.
 * Removes undefined fields from objects, cleans arrays, and preserves valid Firestore primitives.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === undefined) {
    return null as any;
  }

  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Preserve Dates and Firestore Timestamps/FieldValues untouched
  if (isFirestoreSpecial(data)) {
    return data;
  }

  // Handle Arrays
  if (Array.isArray(data)) {
    const cleanedArr: any[] = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (item !== undefined) {
        cleanedArr.push(sanitizeForFirestore(item));
      }
    }
    return cleanedArr as any;
  }

  // Handle Plain Objects
  if (isPlainObject(data)) {
    const cleanedObj: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        cleanedObj[key] = sanitizeForFirestore(val);
      }
    }
    return cleanedObj as any;
  }

  // Retain other custom instances (e.g. Set, Map or class instances if any)
  return data;
}

/**
 * Validates that an object contains no undefined values at any nesting depth.
 * Returns { valid: true } or { valid: false, path: string }.
 */
export function validateFirestorePayload(
  data: any,
  currentPath = ''
): { valid: boolean; path?: string } {
  if (data === undefined) {
    return { valid: false, path: currentPath || 'root' };
  }

  if (data === null || typeof data !== 'object' || isFirestoreSpecial(data)) {
    return { valid: true };
  }

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      const res = validateFirestorePayload(data[i], `${currentPath}[${i}]`);
      if (!res.valid) return res;
    }
    return { valid: true };
  }

  if (isPlainObject(data)) {
    for (const [key, val] of Object.entries(data)) {
      const path = currentPath ? `${currentPath}.${key}` : key;
      if (val === undefined) {
        return { valid: false, path };
      }
      const res = validateFirestorePayload(val, path);
      if (!res.valid) return res;
    }
    return { valid: true };
  }

  return { valid: true };
}
