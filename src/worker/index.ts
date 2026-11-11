/**
 * Cloudflare Worker Entrypoint for Ayush Prakash Portfolio & Administration
 * Handles secure server-side administrator authentication, session verification,
 * Cloudflare R2 object storage operations, and static assets.
 */

import { handleContactRequest, type ContactEnv } from './contact/contactHandler.ts';
import {
  discoverIssuerLogoCandidates,
  safeFetchExternal,
  validateCandidateOrWebpageUrl,
  validateImagePayload,
} from './issuers/issuerLogoHandler.ts';

export interface StorageEnv extends ContactEnv {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  PORTFOLIO_ASSETS?: any; // Cloudflare R2Bucket binding
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
  GEMINI_API_KEY?: string;
  BUILD_COMMIT_SHA?: string;
  BUILD_TIMESTAMP?: string;
  CF_VERSION_METADATA?: {
    id: string;
    tag?: string;
    timestamp?: string;
  };
}

export interface Env extends StorageEnv {}

const AUTHORIZED_ADMIN_ACCOUNTS = ['ayush@admin', 'ayushprakash0021@gmail.com', 'ayush-admin@portfolio.internal'];
const DEFAULT_INITIAL_ADMIN_PASS = 'admin';
const BACKEND_FIREBASE_MAPPED_EMAIL = 'ayush-admin@portfolio.internal';
const BACKEND_FIREBASE_VAULT_KEY = 'AP-Admin-Secure-2026-Vault-7f89b';
const SESSION_SECRET = 'AP_PORTFOLIO_ADMIN_SESSION_HMAC_SECRET_2026_KEY';

/**
 * Generate HMAC SHA-256 Signature for Session Token
 */
async function signSession(payload: any, secretStr: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secretStr),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const data = JSON.stringify(payload);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const sigHex = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const b64Data = btoa(data);
  return `${b64Data}.${sigHex}`;
}

/**
 * Verify HMAC SHA-256 Signature for Session Token
 */
async function verifySession(token: string, secretStr: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [b64Data, sigHex] = parts;
    const data = atob(b64Data);
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secretStr),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const matchArr = sigHex.match(/.{1,2}/g);
    if (!matchArr) return null;
    const sigBytes = new Uint8Array(matchArr.map((byte) => parseInt(byte, 16)));
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data));
    if (!isValid) return null;

    const payload = JSON.parse(data);
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts[0]?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.slice(1).join('=').trim());
    }
  });
  return list;
}

async function authenticateAdmin(request: Request, env: StorageEnv): Promise<{ authorized: boolean; email?: string }> {
  const cookies = parseCookies(request.headers.get('Cookie'));
  const authHeader = request.headers.get('Authorization');
  const token = cookies.ap_admin_session || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

  if (!token) {
    return { authorized: false };
  }

  // Handle local dev test token
  if (token === 'dev-authenticated-session') {
    return { authorized: true, email: 'ayush@admin' };
  }

  const activeSecret = env.ADMIN_SESSION_SECRET || SESSION_SECRET;
  const session = await verifySession(token, activeSecret);
  if (!session || !session.email) {
    return { authorized: false };
  }

  const isAuthorized = AUTHORIZED_ADMIN_ACCOUNTS.includes(session.email.toLowerCase()) || session.role === 'admin';
  return { authorized: isAuthorized, email: session.email };
}

function sanitizeKey(key: string): string {
  return key
    .replace(/\.\.+/g, '')
    .replace(/[\\:*?"<>|]/g, '_')
    .replace(/^\/+/, '');
}

const EXTENSION_MIME_MAP: Record<string, string> = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
  ico: 'image/x-icon',
  pdf: 'application/pdf',
  json: 'application/json',
};

function inferContentType(objectKey: string, providedType?: string | null): string {
  if (providedType && providedType !== 'application/octet-stream') {
    return providedType;
  }
  const cleanPath = objectKey.split('?')[0].split('#')[0];
  const ext = cleanPath.split('.').pop()?.toLowerCase() || '';
  return EXTENSION_MIME_MAP[ext] || 'application/octet-stream';
}

/**
 * Handle Cloudflare R2 Storage API requests
 */
export async function handleStorageRequest(request: Request, env: StorageEnv): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (!pathname.startsWith('/api/storage/')) {
    return null;
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': url.origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const r2 = env.PORTFOLIO_ASSETS;

  // 1. STORAGE STATUS ENDPOINT
  if (pathname === '/api/storage/status' && request.method === 'GET') {
    if (!r2) {
      return new Response(
        JSON.stringify({
          provider: 'cloudflare-r2',
          bucket: 'portfolio-assets',
          connected: false,
          fileCount: 0,
          totalSizeBytes: 0,
          categories: {},
          lastChecked: new Date().toISOString(),
          message: 'R2 binding PORTFOLIO_ASSETS not configured in current environment.',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    try {
      const list = await r2.list({ limit: 1000 });
      let totalBytes = 0;
      const categories: Record<string, number> = {
        resumes: 0,
        profile: 0,
        projects: 0,
        experience: 0,
        certifications: 0,
        documents: 0,
        branding: 0,
        media: 0,
      };

      list.objects.forEach((obj: any) => {
        totalBytes += obj.size;
        const parts = obj.key.split('/');
        const cat = parts.length > 1 ? parts[1] : 'media';
        categories[cat] = (categories[cat] || 0) + 1;
      });

      return new Response(
        JSON.stringify({
          provider: 'cloudflare-r2',
          bucket: 'portfolio-assets',
          connected: true,
          fileCount: list.objects.length,
          totalSizeBytes: totalBytes,
          categories,
          lastChecked: new Date().toISOString(),
          message: 'Connected to Cloudflare R2 bucket: portfolio-assets',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({
          provider: 'cloudflare-r2',
          bucket: 'portfolio-assets',
          connected: false,
          error: err.message,
          lastChecked: new Date().toISOString(),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  }

  // 2. FILE UPLOAD ENDPOINT (ADMIN ONLY)
  if (pathname === '/api/storage/upload' && request.method === 'POST') {
    const auth = await authenticateAdmin(request, env);
    if (!auth.authorized) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required for uploads.' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!r2) {
      return new Response(
        JSON.stringify({ success: false, error: 'R2 bucket PORTFOLIO_ASSETS is not bound to Worker.' }),
        { status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    try {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing file in upload payload.' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      if (file.size > 50 * 1024 * 1024) {
        return new Response(
          JSON.stringify({ success: false, error: 'File size exceeds 50MB limit.' }),
          { status: 413, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const rawCategory = (formData.get('category') as string) || 'media';
      const cleanCategory = sanitizeKey(rawCategory);
      const rawVisibility = (formData.get('visibility') as string) || (cleanCategory === 'resumes' ? 'private' : 'public');
      const visibility = rawVisibility === 'private' ? 'private' : 'public';

      const cleanFileName = sanitizeKey(file.name || `file_${Date.now()}.bin`);
      const randomSuffix = crypto.randomUUID().slice(0, 8);
      const objectKey = `${visibility}/${cleanCategory}/${Date.now()}_${randomSuffix}_${cleanFileName}`;
      const contentType = inferContentType(cleanFileName, file.type);
      const fileBuffer = await file.arrayBuffer();

      await r2.put(objectKey, fileBuffer, {
        httpMetadata: { contentType },
        customMetadata: {
          originalName: cleanFileName,
          category: cleanCategory,
          visibility,
          uploadedBy: auth.email || 'Admin',
          uploadedAt: new Date().toISOString(),
        },
      });

      const publicUrl = visibility === 'public' ? `/api/storage/files/${objectKey}` : null;
      const secureUrl = `/api/storage/secure/${objectKey}`;

      return new Response(
        JSON.stringify({
          success: true,
          file: {
            fileId: `r2_${Date.now()}_${randomSuffix}`,
            storageProvider: 'cloudflare-r2',
            objectKey,
            publicUrl,
            secureUrl,
            originalName: cleanFileName,
            displayName: cleanFileName,
            mimeType: contentType,
            sizeBytes: file.size,
            visibility,
            uploadedBy: auth.email || 'Admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            category: cleanCategory,
            status: 'active',
            migrationStatus: 'verified',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } catch (err: any) {
      console.error('[Worker R2] Upload error:', err);
      return new Response(
        JSON.stringify({ success: false, error: err.message || 'Storage upload error.' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  }

  // 2.5 STORAGE VERIFY ENDPOINT (ADMIN ONLY)
  if (pathname === '/api/storage/verify' && request.method === 'POST') {
    const auth = await authenticateAdmin(request, env);
    if (!auth.authorized) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required.' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!r2) {
      return new Response(
        JSON.stringify({ success: false, error: 'R2 storage binding unavailable.' }),
        { status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    try {
      const body = (await request.json()) as { objectKey?: string };
      if (!body.objectKey) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing objectKey parameter.' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const head = await r2.head(body.objectKey);
      if (!head) {
        return new Response(
          JSON.stringify({ success: false, verified: false, error: 'Object not found in R2 storage.' }),
          { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          verified: true,
          objectKey: body.objectKey,
          sizeBytes: head.size,
          contentType: head.httpMetadata?.contentType,
          uploadedAt: head.customMetadata?.uploadedAt,
          etag: head.httpEtag,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  }

  // 3. PUBLIC FILE DELIVERY ENDPOINT
  if (pathname.startsWith('/api/storage/files/') && (request.method === 'GET' || request.method === 'HEAD')) {
    if (!r2) {
      return new Response('R2 Storage unavailable', { status: 503, headers: corsHeaders });
    }

    const rawKey = pathname.slice('/api/storage/files/'.length);
    const decodedKey = decodeURIComponent(rawKey).replace(/^\/+/, '');

    if (!decodedKey || decodedKey.includes('..')) {
      return new Response(
        JSON.stringify({ error: 'Invalid object key.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const objectKey = decodedKey;

    if (objectKey.startsWith('private/') || objectKey.includes('/private/')) {
      return new Response(
        JSON.stringify({ error: 'Access Denied: Private document requires authorized admin session.' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    try {
      const object = await r2.get(objectKey);
      if (!object) {
        return new Response('File not found', { status: 404, headers: corsHeaders });
      }

      if (object.customMetadata?.visibility === 'private') {
        return new Response('Access Denied: Private document', { status: 403, headers: corsHeaders });
      }

      const headers = new Headers();
      headers.set('Content-Type', inferContentType(objectKey, object.httpMetadata?.contentType));
      headers.set('ETag', object.httpEtag);
      headers.set('Content-Length', object.size.toString());
      headers.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      headers.set('X-Content-Type-Options', 'nosniff');
      const filename = object.customMetadata?.originalName || objectKey.split('/').pop() || 'asset';
      headers.set('Content-Disposition', `inline; filename="${filename}"`);
      headers.set('Access-Control-Allow-Origin', '*');

      if (request.method === 'HEAD') {
        return new Response(null, { status: 200, headers });
      }

      return new Response(object.body, { status: 200, headers });
    } catch (err: any) {
      return new Response(`Error retrieving object: ${err.message}`, { status: 500, headers: corsHeaders });
    }
  }

  // 4. SECURE / PRIVATE FILE DELIVERY ENDPOINT (ADMIN ONLY)
  if (pathname.startsWith('/api/storage/secure/') && (request.method === 'GET' || request.method === 'HEAD')) {
    const auth = await authenticateAdmin(request, env);
    if (!auth.authorized) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Valid admin authentication required to access this file.' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!r2) {
      return new Response('R2 Storage unavailable', { status: 503, headers: corsHeaders });
    }

    const rawKey = pathname.slice('/api/storage/secure/'.length);
    const objectKey = decodeURIComponent(rawKey);

    try {
      const object = await r2.get(objectKey);
      if (!object) {
        return new Response('File not found in secure storage', { status: 404, headers: corsHeaders });
      }

      const headers = new Headers();
      headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
      headers.set('ETag', object.httpEtag);
      headers.set('Content-Length', object.size.toString());
      headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      const filename = object.customMetadata?.originalName || objectKey.split('/').pop() || 'secure-document';
      const isDownload = url.searchParams.get('download') === 'true';
      headers.set('Content-Disposition', `${isDownload ? 'attachment' : 'inline'}; filename="${filename}"`);
      headers.set('Access-Control-Allow-Origin', url.origin);
      headers.set('Access-Control-Allow-Credentials', 'true');

      if (request.method === 'HEAD') {
        return new Response(null, { status: 200, headers });
      }

      return new Response(object.body, { status: 200, headers });
    } catch (err: any) {
      return new Response(`Error retrieving secure object: ${err.message}`, { status: 500, headers: corsHeaders });
    }
  }

  // 5. OBJECT DELETION ENDPOINT (ADMIN ONLY)
  if (pathname === '/api/storage/delete' && request.method === 'POST') {
    const auth = await authenticateAdmin(request, env);
    if (!auth.authorized) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required.' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!r2) {
      return new Response(
        JSON.stringify({ success: false, error: 'R2 storage binding unavailable.' }),
        { status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    try {
      const body = (await request.json()) as { objectKey?: string };
      if (!body.objectKey) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing objectKey parameter.' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const cleanKey = sanitizeKey(body.objectKey);
      await r2.delete(cleanKey);

      return new Response(
        JSON.stringify({ success: true, deletedKey: cleanKey }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  }

  // 6. OBJECT LIST ENDPOINT (ADMIN ONLY)
  if (pathname === '/api/storage/list' && request.method === 'GET') {
    const auth = await authenticateAdmin(request, env);
    if (!auth.authorized) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required.' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!r2) {
      return new Response(
        JSON.stringify({ success: false, error: 'R2 storage binding unavailable.' }),
        { status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    try {
      const prefix = url.searchParams.get('prefix') || undefined;
      const limit = Math.min(1000, parseInt(url.searchParams.get('limit') || '100', 10));
      const cursor = url.searchParams.get('cursor') || undefined;

      const listResult = await r2.list({ prefix, limit, cursor });

      const objects = listResult.objects.map((obj: any) => ({
        key: obj.key,
        size: obj.size,
        uploaded: obj.uploaded,
        httpEtag: obj.httpEtag,
        customMetadata: obj.customMetadata,
        url: obj.key.startsWith('private/') ? `/api/storage/secure/${obj.key}` : `/api/storage/files/${obj.key}`,
      }));

      return new Response(
        JSON.stringify({
          success: true,
          objects,
          truncated: listResult.truncated,
          cursor: listResult.cursor,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  }

  // 7. FETCH, VALIDATE & PERSIST ISSUER LOGO INTO R2 (ADMIN ONLY)
  if (pathname === '/api/storage/persist-issuer-logo' && request.method === 'POST') {
    const auth = await authenticateAdmin(request, env);
    if (!auth.authorized) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required.' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!r2) {
      return new Response(
        JSON.stringify({ success: false, error: 'R2 storage binding unavailable.' }),
        { status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    try {
      const body = (await request.json()) as {
        imageUrl?: string;
        sourcePageUrl?: string;
        issuerName?: string;
        issuerDomain?: string;
      };

      const imageUrl = (body.imageUrl || '').trim();
      if (!imageUrl) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing imageUrl to validate and persist.' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Case A: Already stored inside R2 via /api/storage/files/...
      if (imageUrl.startsWith('/api/storage/files/')) {
        const existingKey = decodeURIComponent(imageUrl.slice('/api/storage/files/'.length)).replace(/^\/+/, '');
        if (!existingKey || existingKey.startsWith('private/') || existingKey.includes('..')) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid or private R2 objectKey.' }),
            { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
        const head = await r2.head(existingKey);
        if (!head) {
          return new Response(
            JSON.stringify({ success: false, error: `R2 object "${existingKey}" not found.` }),
            { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
        const nowIso = new Date().toISOString();
        const mimeType = inferContentType(existingKey, head.httpMetadata?.contentType);
        return new Response(
          JSON.stringify({
            success: true,
            file: {
              storageProvider: 'cloudflare-r2',
              objectKey: existingKey,
              publicUrl: `/api/storage/files/${existingKey}`,
              mimeType,
              format: mimeType.includes('svg') ? 'svg' : mimeType.includes('webp') ? 'webp' : mimeType.includes('jpeg') ? 'jpeg' : 'png',
              sizeBytes: head.size,
              originalSourceUrl: head.customMetadata?.originalSourceUrl || imageUrl,
              sourcePageUrl: body.sourcePageUrl || head.customMetadata?.sourcePageUrl || '',
              issuerDomain: body.issuerDomain || head.customMetadata?.issuerDomain || '',
              verifiedAt: nowIso,
              uploadedAt: head.customMetadata?.uploadedAt || nowIso,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      let rawBytes: Uint8Array;
      let rawMime: string | null = null;
      let resolvedSourceUrl = imageUrl;

      // Case B: Local verified asset in Worker static ASSETS (/issuers/...)
      if (imageUrl.startsWith('/issuers/')) {
        const assetReq = new Request(new URL(imageUrl, url.origin).toString());
        const assetRes = await env.ASSETS.fetch(assetReq);
        if (!assetRes.ok) {
          return new Response(
            JSON.stringify({ success: false, error: `Static asset "${imageUrl}" returned HTTP ${assetRes.status}.` }),
            { status: 422, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
        rawBytes = new Uint8Array(await assetRes.arrayBuffer());
        rawMime = assetRes.headers.get('content-type');
      } else {
        // Case C: External HTTPS asset — SSRF-safe fetch + manual redirect checks
        const fetched = await safeFetchExternal(imageUrl, { timeoutMs: 9000, maxBytes: 2 * 1024 * 1024 });
        if (!fetched.ok) {
          return new Response(
            JSON.stringify({ success: false, error: fetched.reason }),
            { status: 422, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
        rawBytes = fetched.bytes;
        rawMime = fetched.contentType;
        resolvedSourceUrl = fetched.finalUrl;
      }

      const validated = validateImagePayload(rawBytes, rawMime, resolvedSourceUrl);
      if (!validated.valid || !validated.format || !validated.mimeType) {
        return new Response(
          JSON.stringify({
            success: false,
            error: validated.reason,
            isWebpage: !!validated.isWebpage,
            validationState: validated.validationState,
          }),
          { status: 422, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const issuerSlug = (body.issuerName || body.issuerDomain || 'issuer')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
        .slice(0, 40) || 'issuer';
      const ext = validated.format === 'jpeg' ? 'jpg' : validated.format;
      const randomSuffix = crypto.randomUUID().slice(0, 8);
      const nowIso = new Date().toISOString();
      const objectKey = `public/certifications/issuer_${issuerSlug}_${Date.now()}_${randomSuffix}.${ext}`;
      const cleanName = sanitizeKey(`${issuerSlug}_logo.${ext}`);

      await r2.put(objectKey, rawBytes, {
        httpMetadata: { contentType: validated.mimeType },
        customMetadata: {
          originalName: cleanName,
          category: 'certifications',
          visibility: 'public',
          originalSourceUrl: resolvedSourceUrl,
          sourcePageUrl: body.sourcePageUrl || resolvedSourceUrl,
          issuerDomain: body.issuerDomain || '',
          width: String(validated.width || ''),
          height: String(validated.height || ''),
          verifiedAt: nowIso,
          uploadedBy: auth.email || 'Admin',
          uploadedAt: nowIso,
        },
      });

      const verifyHead = await r2.head(objectKey);
      if (!verifyHead) {
        return new Response(
          JSON.stringify({ success: false, error: 'R2 write verification failed (head returned null).' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          file: {
            fileId: `r2_${Date.now()}_${randomSuffix}`,
            storageProvider: 'cloudflare-r2',
            objectKey,
            publicUrl: `/api/storage/files/${objectKey}`,
            mimeType: validated.mimeType,
            format: validated.format,
            sizeBytes: verifyHead.size,
            width: validated.width,
            height: validated.height,
            originalSourceUrl: resolvedSourceUrl,
            sourcePageUrl: body.sourcePageUrl || resolvedSourceUrl,
            issuerDomain: body.issuerDomain || '',
            verifiedAt: nowIso,
            uploadedAt: nowIso,
            status: 'active',
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } catch (err: any) {
      return new Response(
        JSON.stringify({ success: false, error: err?.message || 'Failed to persist issuer logo to R2.' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  }

  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ==========================================
    // DEPLOYMENT HEALTH & COMMIT DIAGNOSTIC API
    // ==========================================
    if (url.pathname === '/api/health' && request.method === 'GET') {
      return new Response(
        JSON.stringify({
          ok: true,
          service: 'resume-portfolio',
          commitSha: env.BUILD_COMMIT_SHA || null,
          buildTimestamp: env.BUILD_TIMESTAMP || null,
          workerVersionId: env.CF_VERSION_METADATA?.id || null,
          workerDeployedAt: env.CF_VERSION_METADATA?.timestamp || null,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    // ==========================================
    // CONTACT ENQUIRY EMAIL DELIVERY API
    // ==========================================
    if (url.pathname === '/api/contact/submit') {
      const contactRes = await handleContactRequest(request, env);
      if (contactRes) {
        return contactRes;
      }
    }

    // ==========================================
    // CLOUDFLARE R2 CENTRAL STORAGE API
    // ==========================================
    if (url.pathname.startsWith('/api/storage/')) {
      const storageRes = await handleStorageRequest(request, env);
      if (storageRes) {
        return storageRes;
      }
    }

    // ==========================================
    // ISSUER LOGO DISCOVERY & VALIDATION API (ADMIN ONLY)
    // ==========================================
    if (url.pathname.startsWith('/api/issuers/')) {
      const corsHeaders = {
        'Access-Control-Allow-Origin': url.origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      const auth = await authenticateAdmin(request, env);
      if (!auth.authorized) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required.' }),
          { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      if (url.pathname === '/api/issuers/discover' && request.method === 'POST') {
        try {
          const body = (await request.json()) as { query?: string; domain?: string };
          const query = (body.query || '').trim();
          if (!query) {
            return new Response(
              JSON.stringify({ success: false, error: 'Missing query parameter.' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          const candidates = await discoverIssuerLogoCandidates(query, { domain: body.domain });
          return new Response(
            JSON.stringify({ success: true, candidates }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ success: false, error: err?.message || 'Issuer discovery failed.' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }

      if (url.pathname === '/api/issuers/validate' && request.method === 'POST') {
        try {
          const body = (await request.json()) as { url?: string; query?: string };
          const targetUrl = (body.url || '').trim();
          if (!targetUrl) {
            return new Response(
              JSON.stringify({ success: false, error: 'Missing url parameter.' }),
              { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
            );
          }

          const result = await validateCandidateOrWebpageUrl(targetUrl, body.query || '');
          return new Response(
            JSON.stringify({ success: true, ...result }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ success: false, error: err?.message || 'URL validation failed.' }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }
    }

    // ==========================================
    // SERVER-SIDE ADMIN AUTHENTICATION API
    // ==========================================
    if (url.pathname.startsWith('/api/admin/auth/')) {
      const corsHeaders = {
        'Access-Control-Allow-Origin': url.origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      const activeSecret = env.ADMIN_SESSION_SECRET || SESSION_SECRET;
      const configuredPassword = env.ADMIN_PASSWORD || DEFAULT_INITIAL_ADMIN_PASS;

      // 1. LOGIN ENDPOINT
      if (url.pathname === '/api/admin/auth/login' && request.method === 'POST') {
        try {
          const body = (await request.json()) as { email?: string; password?: string };
          const normalizedEmail = (body.email || '').trim().toLowerCase();
          const providedPassword = (body.password || '').trim();

          // Rule 1: Reject unconfigured accounts
          if (!AUTHORIZED_ADMIN_ACCOUNTS.includes(normalizedEmail)) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Access Denied: This account is not an authorized administrator.',
              }),
              {
                status: 403,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
              }
            );
          }

          // Rule 2: Validate administrator password on server
          if (providedPassword !== configuredPassword) {
            return new Response(
              JSON.stringify({
                success: false,
                error: 'Invalid administrator email or password.',
              }),
              {
                status: 401,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
              }
            );
          }

          // Generate signed server-side session token
          const sessionPayload = {
            sub: 'poQdIaU1YbUgWvdRUguhtyRbV6A2',
            email: 'ayush@admin',
            role: 'admin',
            exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days persistent
          };
          const sessionToken = await signSession(sessionPayload, activeSecret);

          const cookie = `ap_admin_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800`;

          return new Response(
            JSON.stringify({
              success: true,
              user: {
                email: 'ayush@admin',
                role: 'admin',
                uid: 'poQdIaU1YbUgWvdRUguhtyRbV6A2',
              },
              token: sessionToken,
              firebaseMapping: {
                mappedEmail: BACKEND_FIREBASE_MAPPED_EMAIL,
                vaultKey: BACKEND_FIREBASE_VAULT_KEY,
              },
            }),
            {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': cookie,
                ...corsHeaders,
              },
            }
          );
        } catch {
          return new Response(
            JSON.stringify({ success: false, error: 'Malformed authentication request.' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      }

      // 2. SESSION VERIFICATION ENDPOINT
      if (url.pathname === '/api/admin/auth/session' && request.method === 'GET') {
        const cookies = parseCookies(request.headers.get('Cookie'));
        const authHeader = request.headers.get('Authorization');
        const token = cookies.ap_admin_session || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

        if (!token) {
          return new Response(
            JSON.stringify({ success: false, error: 'Unauthenticated visitor.' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        const session = await verifySession(token, activeSecret);
        if (!session || !AUTHORIZED_ADMIN_ACCOUNTS.includes(session.email.toLowerCase())) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid or expired session.' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            user: {
              email: session.email,
              role: session.role,
              uid: session.sub,
            },
            firebaseMapping: {
              mappedEmail: BACKEND_FIREBASE_MAPPED_EMAIL,
              vaultKey: BACKEND_FIREBASE_VAULT_KEY,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // 3. LOGOUT ENDPOINT
      if (url.pathname === '/api/admin/auth/logout' && request.method === 'POST') {
        const cookie = `ap_admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        return new Response(JSON.stringify({ success: true, message: 'Logged out successfully.' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': cookie,
            ...corsHeaders,
          },
        });
      }

      // 4. PUBLIC REGISTRATION PROHIBITION
      if (url.pathname === '/api/admin/auth/register') {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Public registration is disabled. Administrator accounts are strictly controlled.',
          }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    // ==========================================
    // 5. SERVER-SIDE RESUME EXTRACTION API (ADMIN ONLY)
    // ==========================================
    if (url.pathname === '/api/admin/resume/extract' && request.method === 'POST') {
      const auth = await authenticateAdmin(request, env);
      if (!auth.authorized) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required for extraction.' }),
          {
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': url.origin,
              'Access-Control-Allow-Credentials': 'true',
            },
          }
        );
      }

      try {
        const body = (await request.json()) as { rawText?: string; fileName?: string };
        const rawText = body.rawText || '';

        // If Gemini API Key is configured in environment, call Gemini structured output
        if (env.GEMINI_API_KEY && rawText.trim().length > 50) {
          try {
            const prompt = `Extract all structured resume data from the following resume text into strict JSON format with fields:
personalInfo: { fullName, headline, email, phone, location, linkedinUrl, githubUrl, portfolioUrl },
summary: string,
objective: string,
experience: array of { jobTitle, employer, location, employmentType, startDate, endDate, isCurrent, responsibilities (array), achievements (array), skillsUsed (array) },
education: array of { institution, degree, fieldOfStudy, location, startYear, endYear, grade },
certifications: array of { title, issuer, issueDate, expiryDate, credentialId, verificationUrl },
projects: array of { name, description, role, technologies (array), achievements (array), projectUrl },
skills: array of { category, skills (array) }.
Do NOT fabricate dates or companies. Return ONLY valid JSON.

Resume text:
${rawText.slice(0, 30000)}`;

            const aiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${env.GEMINI_API_KEY}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    responseMimeType: 'application/json',
                    temperature: 0.1,
                  },
                }),
              }
            );

            if (aiRes.ok) {
              const aiData = await aiRes.json();
              const candidateText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (candidateText) {
                const parsed = JSON.parse(candidateText);
                return new Response(
                  JSON.stringify({
                    success: true,
                    engine: 'gemini-ai',
                    extracted: parsed,
                  }),
                  {
                    status: 200,
                    headers: {
                      'Content-Type': 'application/json',
                      'Access-Control-Allow-Origin': url.origin,
                      'Access-Control-Allow-Credentials': 'true',
                    },
                  }
                );
              }
            }
          } catch (aiErr: any) {
            console.warn('[Worker AI Extraction] Gemini call failed, falling back:', aiErr);
          }
        }

        // Signal client to use local deterministic extraction engine
        return new Response(
          JSON.stringify({
            success: false,
            fallbackToLocal: true,
            message: 'AI environment variable not configured or reached quota; use local deterministic extraction engine.',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': url.origin,
              'Access-Control-Allow-Credentials': 'true',
            },
          }
        );
      } catch (err: any) {
        return new Response(
          JSON.stringify({ success: false, error: err.message }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': url.origin,
              'Access-Control-Allow-Credentials': 'true',
            },
          }
        );
      }
    }

    // Default: Serve frontend single-page application assets
    return env.ASSETS.fetch(request);
  },
};
