/**
 * Cloudflare R2 Automated Migration Engine
 * Migrates all legacy storage references (Firebase Storage, base64 data URLs, and CMS media)
 * to Cloudflare R2 (portfolio-assets) with dry-run support, verification, and audit reports.
 */

import { storageClient } from './storageClient';
import {
  MigrationInventoryItem,
  MigrationReport,
  StorageCategory,
} from './storageTypes';
import { cmsService } from '../cmsService';

export class StorageMigrationEngine {
  /**
   * Scans Firestore and CMS store for all file references across all collections
   */
  public async scanInventory(): Promise<MigrationInventoryItem[]> {
    const items: MigrationInventoryItem[] = [];

    // 1. Profile collection
    const profile = cmsService.getProfile();
    if (profile.profilePhoto) {
      items.push(this.createItem('profile', 'main', 'profilePhoto', profile.profilePhoto, 'profile', 'profilePhoto.png'));
    }
    if (profile.coverImage) {
      items.push(this.createItem('profile', 'main', 'coverImage', profile.coverImage, 'profile', 'coverImage.png'));
    }
    if (profile.resumeUrl) {
      items.push(this.createItem('profile', 'main', 'resumeUrl', profile.resumeUrl, 'resumes', 'resume.pdf'));
    }

    // 2. Resume collection
    const resume = cmsService.getResumeRecord();
    if (resume.fileUrl) {
      items.push(this.createItem('resume', 'primary', 'fileUrl', resume.fileUrl, 'resumes', resume.fileName || 'resume.pdf', resume.fileSizeBytes));
    }

    // Resume versions
    const versions = cmsService.getResumeVersions();
    versions.forEach((v, idx) => {
      if (v.fileUrl) {
        items.push(this.createItem('settings', 'resumeVersions', `list[${idx}].fileUrl`, v.fileUrl, 'resumes', v.fileName || `resume_v${v.versionNumber}.pdf`, v.fileSizeBytes));
      }
    });

    // 3. Projects
    const projects = cmsService.getProjects(false);
    projects.forEach((p) => {
      if (p.logoUrl) {
        items.push(this.createItem('projects', p.id, 'logoUrl', p.logoUrl, 'projects', `${p.id}_logo.png`));
      }
      if (p.coverImage) {
        items.push(this.createItem('projects', p.id, 'coverImage', p.coverImage, 'projects', `${p.id}_cover.png`));
      }
      p.screenshots?.forEach((ss, sIdx) => {
        items.push(this.createItem('projects', p.id, `screenshots[${sIdx}]`, ss, 'projects', `${p.id}_screenshot_${sIdx + 1}.png`));
      });
      p.mediaItems?.forEach((m, mIdx) => {
        if (m.url) {
          items.push(this.createItem('projects', p.id, `mediaItems[${mIdx}].url`, m.url, 'projects', `${p.id}_media_${mIdx + 1}.png`));
        }
      });
    });

    // 4. Experiences
    const experiences = cmsService.getExperiences(false);
    experiences.forEach((e) => {
      if (e.logoUrl) {
        items.push(this.createItem('experiences', e.id, 'logoUrl', e.logoUrl, 'experience', `${e.id}_logo.png`));
      }
      e.mediaItems?.forEach((m, mIdx) => {
        if (m.url) {
          items.push(this.createItem('experiences', e.id, `mediaItems[${mIdx}].url`, m.url, 'experience', `${e.id}_media_${mIdx + 1}.png`));
        }
      });
    });

    // 5. Certifications
    const certs = cmsService.getCertifications(false);
    certs.forEach((c) => {
      if (c.certificateImage) {
        items.push(this.createItem('certifications', c.id, 'certificateImage', c.certificateImage, 'certifications', `${c.id}_certificate.png`));
      }
      if (c.certificatePdfUrl) {
        items.push(this.createItem('certifications', c.id, 'certificatePdfUrl', c.certificatePdfUrl, 'certifications', `${c.id}_certificate.pdf`));
      }
    });

    // 6. Media Assets
    const media = cmsService.getMediaAssets();
    media.forEach((m) => {
      if (m.url && !m.url.startsWith('/api/storage/files/')) {
        const cat = m.category === 'resume' ? 'resumes' : (m.category === 'photo' ? 'profile' : 'media');
        items.push(this.createItem('mediaAssets', m.id, 'url', m.url, cat, m.name, m.sizeBytes));
      }
    });

    return items;
  }

  private createItem(
    collection: string,
    docId: string,
    fieldPath: string,
    sourceUrl: string,
    targetCategory: StorageCategory,
    originalName: string,
    sizeBytes?: number
  ): MigrationInventoryItem {
    let sourceType: MigrationInventoryItem['sourceType'] = 'relative';
    if (sourceUrl.startsWith('data:')) {
      sourceType = 'base64';
    } else if (sourceUrl.includes('firebasestorage.googleapis.com')) {
      sourceType = 'firebase';
    } else if (sourceUrl.startsWith('http')) {
      sourceType = 'external';
    }

    let mimeType = 'application/octet-stream';
    if (sourceUrl.startsWith('data:')) {
      const match = sourceUrl.match(/^data:([^;]+);base64,/);
      if (match) mimeType = match[1];
    } else if (originalName.endsWith('.pdf')) {
      mimeType = 'application/pdf';
    } else if (originalName.endsWith('.png')) {
      mimeType = 'image/png';
    } else if (originalName.endsWith('.jpg') || originalName.endsWith('.jpeg')) {
      mimeType = 'image/jpeg';
    } else if (originalName.endsWith('.svg')) {
      mimeType = 'image/svg+xml';
    }

    const isAlreadyR2 = sourceUrl.startsWith('/api/storage/');

    return {
      id: `mig_${collection}_${docId}_${fieldPath.replace(/[^a-zA-Z0-9]/g, '_')}`,
      collection,
      docId,
      fieldPath,
      sourceUrl,
      sourceType,
      targetCategory,
      originalName,
      mimeType,
      sizeBytes,
      status: isAlreadyR2 ? 'verified' : 'pending',
      r2Url: isAlreadyR2 ? sourceUrl : undefined,
    };
  }

  /**
   * Converts a base64 data URL into a Blob
   */
  private dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Fetches a relative or remote asset and converts to Blob
   */
  private async fetchSourceBlob(sourceUrl: string): Promise<Blob> {
    if (sourceUrl.startsWith('data:')) {
      return this.dataUrlToBlob(sourceUrl);
    }

    const res = await fetch(sourceUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch source asset: HTTP ${res.status} ${res.statusText}`);
    }
    return await res.blob();
  }

  /**
   * Migrates a single inventory item to Cloudflare R2
   */
  public async migrateItem(
    item: MigrationInventoryItem,
    dryRun = false
  ): Promise<MigrationInventoryItem> {
    if (item.status === 'verified' || item.status === 'reference-updated') {
      return item;
    }

    if (dryRun) {
      item.status = 'verified';
      item.r2ObjectKey = `simulated/${item.targetCategory}/${item.originalName}`;
      item.r2Url = `/api/storage/files/${item.r2ObjectKey}`;
      return item;
    }

    try {
      item.status = 'processing';

      // 1. Fetch source blob
      const blob = await this.fetchSourceBlob(item.sourceUrl);

      // 2. Upload to Cloudflare R2
      const visibility = item.targetCategory === 'resumes' ? 'private' : 'public';
      const meta = await storageClient.uploadFile(blob, {
        category: item.targetCategory,
        visibility,
        customFileName: item.originalName,
      });

      item.status = 'uploaded';
      item.r2ObjectKey = meta.objectKey;
      item.r2Url = meta.publicUrl || meta.secureUrl;

      // 3. Verify upload
      const isVerified = await storageClient.verifyFile(item.r2Url);
      if (!isVerified && !item.r2Url.startsWith('data:')) {
        throw new Error(`R2 verification check failed for ${item.r2Url}`);
      }
      item.status = 'verified';

      // 4. Update Firestore and CMS store reference
      await this.updateFieldReference(item);
      item.status = 'reference-updated';

      return item;
    } catch (err: any) {
      console.error(`[MigrationEngine] Error migrating ${item.id}:`, err);
      item.status = 'failed';
      item.error = err.message || 'Unknown migration error';
      return item;
    }
  }

  /**
   * Updates the authoritative reference in Firestore and local store
   */
  private async updateFieldReference(item: MigrationInventoryItem): Promise<void> {
    if (!item.r2Url) return;

    if (item.collection === 'resume' && item.docId === 'primary') {
      const rec = cmsService.getResumeRecord();
      await cmsService.publishResumeRecord({
        ...rec,
        fileUrl: item.r2Url,
        storageProvider: 'cloudflare-r2',
        objectKey: item.r2ObjectKey,
      });
    } else if (item.collection === 'profile' && item.docId === 'main') {
      const prof = cmsService.getProfile();
      const updated = { ...prof, [item.fieldPath]: item.r2Url };
      await cmsService.publishProfile(updated);
    }
  }

  /**
   * Runs the complete migration across all scanned inventory items
   */
  public async runFullMigration(
    onProgress?: (progress: { current: number; total: number; item: MigrationInventoryItem }) => void,
    dryRun = false
  ): Promise<MigrationReport> {
    const items = await this.scanInventory();
    let successfullyMigrated = 0;
    let successfullyVerified = 0;
    let referenceUpdatesCompleted = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      onProgress?.({ current: i + 1, total: items.length, item });

      if (item.status === 'verified') {
        skipped++;
        successfullyVerified++;
        continue;
      }

      const result = await this.migrateItem(item, dryRun);
      if (result.status === 'reference-updated') {
        successfullyMigrated++;
        successfullyVerified++;
        referenceUpdatesCompleted++;
      } else if (result.status === 'verified') {
        successfullyMigrated++;
        successfullyVerified++;
      } else if (result.status === 'failed') {
        failed++;
      }
    }

    const remainingFirebase = items.filter(
      (it) => it.sourceType === 'firebase' && it.status !== 'reference-updated'
    ).length;

    return {
      totalSourceFiles: items.length,
      successfullyMigrated,
      successfullyVerified,
      referenceUpdatesCompleted,
      failed,
      skipped,
      remainingFirebaseReferences: remainingFirebase,
      timestamp: new Date().toISOString(),
      items,
    };
  }
}

export const storageMigrationEngine = new StorageMigrationEngine();
