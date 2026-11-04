/**
 * Cloudflare R2 Central Storage Architecture Types
 * Ayush Prakash Personal Portfolio
 */

export type StorageProvider = 'cloudflare-r2' | 'firebase-storage' | 'local-fallback';

export type FileVisibility = 'public' | 'private';

export type StorageCategory =
  | 'resumes'
  | 'profile'
  | 'projects'
  | 'experience'
  | 'certifications'
  | 'documents'
  | 'branding'
  | 'media';

export interface StoredFileMetadata {
  fileId: string;
  storageProvider: StorageProvider;
  objectKey: string;
  publicUrl: string | null;
  secureUrl: string;
  originalName: string;
  displayName?: string;
  mimeType: string;
  sizeBytes: number;
  visibility: FileVisibility;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  category: StorageCategory;
  version?: number;
  checksum?: string;
  status?: 'active' | 'archived' | 'pending_verification';
  migrationStatus?:
    | 'pending'
    | 'processing'
    | 'uploaded'
    | 'verified'
    | 'reference-updated'
    | 'failed'
    | 'fallback';
}

export interface FileUploadOptions {
  category: StorageCategory;
  visibility?: FileVisibility;
  customFileName?: string;
  onProgress?: (percent: number) => void;
  replaceKey?: string;
}

export interface StorageStatus {
  provider: 'cloudflare-r2';
  bucket: string;
  connected: boolean;
  fileCount: number;
  totalSizeBytes: number;
  categories: Record<string, number>;
  lastChecked: string;
  message?: string;
}

export interface MigrationInventoryItem {
  id: string;
  collection: string;
  docId: string;
  fieldPath: string;
  sourceUrl: string;
  sourceType: 'base64' | 'firebase' | 'relative' | 'external';
  targetCategory: StorageCategory;
  originalName: string;
  mimeType: string;
  sizeBytes?: number;
  status:
    | 'pending'
    | 'processing'
    | 'uploaded'
    | 'verified'
    | 'reference-updated'
    | 'failed'
    | 'skipped';
  r2ObjectKey?: string;
  r2Url?: string;
  error?: string;
}

export interface MigrationReport {
  totalSourceFiles: number;
  successfullyMigrated: number;
  successfullyVerified: number;
  referenceUpdatesCompleted: number;
  failed: number;
  skipped: number;
  remainingFirebaseReferences: number;
  timestamp: string;
  items: MigrationInventoryItem[];
}
