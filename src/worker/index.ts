/**
 * Cloudflare Worker Entrypoint for Ayush Prakash Portfolio & Administration
 * Handles secure server-side administrator authentication, session verification, and static assets.
 */

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  ADMIN_PASSWORD?: string;
  ADMIN_SESSION_SECRET?: string;
}

const AUTHORIZED_ADMIN_ACCOUNTS = ['ayush@admin', 'ayushprakash0021@gmail.com'];
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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

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

    // Default: Serve frontend single-page application assets
    return env.ASSETS.fetch(request);
  },
};
