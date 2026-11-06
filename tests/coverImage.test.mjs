import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { DEFAULT_PROFILE } from '../src/data/seedData.ts';

describe('Profile Presentation Reversion & Safe Legacy Compatibility Suite', () => {
  test('1. DEFAULT_PROFILE preserves legacy coverImage for data safety and profilePhoto', () => {
    assert.ok(DEFAULT_PROFILE.profilePhoto, 'profilePhoto must be defined');
    assert.ok(DEFAULT_PROFILE.coverImage !== undefined, 'coverImage must remain in schema for backward compatibility');
  });

  test('2. EditorialAbout renders only the main portrait photo in HoloCard without cover banner', () => {
    const src = fs.readFileSync(path.resolve('src/components/editorial/EditorialAbout.tsx'), 'utf-8');
    assert.ok(src.includes('imageSrc={profile.profilePhoto}'), 'EditorialAbout must pass profile.profilePhoto as primary portrait');
    assert.ok(!src.includes('coverImageSrc='), 'EditorialAbout must not pass coverImageSrc');
    assert.ok(!src.includes('showCoverBanner='), 'EditorialAbout must not pass showCoverBanner');
  });

  test('3. HoloCard is restored to single prominent portrait presentation', () => {
    const src = fs.readFileSync(path.resolve('src/components/reactbits/HoloCard.tsx'), 'utf-8');
    assert.ok(!src.includes('coverImageSrc?:'), 'HoloCard props must not declare coverImageSrc');
    assert.ok(!src.includes('holo-card-cover-banner'), 'HoloCard must not render cover banner DOM');
    assert.ok(!src.includes('profile-cover-image'), 'HoloCard must not render cover image element');
    assert.ok(src.includes("aspectRatio: '4 / 5'"), 'Primary portrait must maintain full prominent 4:5 aspect ratio');
    assert.ok(src.includes("objectFit: 'cover'"), 'HoloCard must use object-fit: cover');
  });

  test('4. IntroductionEditor removes cover image controls while retaining profile photo editor', () => {
    const src = fs.readFileSync(path.resolve('src/components/admin/editors/IntroductionEditor.tsx'), 'utf-8');
    assert.ok(!src.includes('Background / Cover Image'), 'IntroductionEditor must not display Background / Cover Image');
    assert.ok(!src.includes('Change Cover'), 'IntroductionEditor must not display Change Cover button');
    assert.ok(!src.includes('isUploadingCover'), 'IntroductionEditor must not have isUploadingCover state');
    assert.ok(src.includes('Profile Photograph'), 'IntroductionEditor must keep Profile Photograph field');
    assert.ok(src.includes('Change Photo'), 'IntroductionEditor must keep Change Photo button');
    assert.ok(src.includes('ImageUploadWithCrop'), 'IntroductionEditor must keep ImageUploadWithCrop');
  });

  test('5. CMS draft vs published isolation protects public website', () => {
    const cms = fs.readFileSync(path.resolve('src/services/cmsService.ts'), 'utf-8');
    assert.ok(cms.includes('getProfile(preferDraft = false)'), 'getProfile defaults to published profile');
    assert.ok(cms.includes('publishProfile(profile: ProfileData)'), 'cmsService provides publishProfile');
    assert.ok(cms.includes('saveProfileDraft(draft: ProfileData)'), 'cmsService provides saveProfileDraft');
    assert.ok(cms.includes('store.profile = payload'), 'publishProfile updates root profile');
    assert.ok(cms.includes('store.profileDraft = draftPayload'), 'saveProfileDraft isolates changes to draft');
  });
});
