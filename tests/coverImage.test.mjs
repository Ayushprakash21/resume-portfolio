import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_PROFILE } from '../src/data/seedData.ts';

describe('Public Introduction Cover Image & HoloCard Integration Suite', () => {
  test('1. DEFAULT_PROFILE has defined coverImage and profilePhoto', () => {
    assert.ok(DEFAULT_PROFILE.coverImage, 'coverImage must be defined');
    assert.ok(DEFAULT_PROFILE.profilePhoto, 'profilePhoto must be defined');
    assert.notEqual(DEFAULT_PROFILE.coverImage.trim(), '', 'coverImage must not be empty');
  });

  test('2. EditorialAbout passes profile.coverImage dynamically to HoloCard', () => {
    const src = fs.readFileSync(path.resolve('src/components/editorial/EditorialAbout.tsx'), 'utf-8');
    assert.ok(src.includes('coverImageSrc={profile.coverImage}'), 'EditorialAbout must pass profile.coverImage');
    assert.ok(src.includes('showCoverBanner={true}'), 'EditorialAbout must enable cover banner');
    assert.ok(src.includes('imageSrc={profile.profilePhoto}'), 'EditorialAbout must pass profile.profilePhoto as separate image');
  });

  test('3. HoloCard supports coverImageSrc, landscape banner, and portrait image', () => {
    const src = fs.readFileSync(path.resolve('src/components/reactbits/HoloCard.tsx'), 'utf-8');
    assert.ok(src.includes('coverImageSrc?: string'), 'HoloCard props must declare coverImageSrc');
    assert.ok(src.includes('showCoverBanner?: boolean'), 'HoloCard props must declare showCoverBanner');
    assert.ok(src.includes('effectiveCoverSrc'), 'HoloCard must compute effectiveCoverSrc');
    assert.ok(src.includes('data-testid="profile-cover-image"'), 'HoloCard must render profile-cover-image');
    assert.ok(src.includes('data-testid="profile-cover-fallback"'), 'HoloCard must render elegant fallback when cover missing/broken');
    assert.ok(src.includes('data-testid="profile-portrait-image"'), 'HoloCard must render portrait photo as separate image');
    assert.ok(src.includes("objectFit: 'cover'"), 'HoloCard must use object-fit: cover');
  });

  test('4. CMS draft vs published isolation protects public website', () => {
    const cms = fs.readFileSync(path.resolve('src/services/cmsService.ts'), 'utf-8');
    assert.ok(cms.includes('getProfile(preferDraft = false)'), 'getProfile defaults to published profile');
    assert.ok(cms.includes('publishProfile(profile: ProfileData)'), 'cmsService provides publishProfile');
    assert.ok(cms.includes('saveProfileDraft(draft: ProfileData)'), 'cmsService provides saveProfileDraft');
    assert.ok(cms.includes('store.profile = payload'), 'publishProfile updates root profile');
    assert.ok(cms.includes('store.profileDraft = draftPayload'), 'saveProfileDraft isolates changes to draft');
  });
});
