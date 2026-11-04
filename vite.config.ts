import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function adminAuthDevPlugin(): Plugin {
  const AUTHORIZED_ADMIN_ACCOUNTS = ['ayush@admin', 'ayushprakash0021@gmail.com'];
  const DEFAULT_INITIAL_ADMIN_PASS = 'admin';
  const BACKEND_FIREBASE_MAPPED_EMAIL = 'ayush-admin@portfolio.internal';
  const BACKEND_FIREBASE_VAULT_KEY = 'AP-Admin-Secure-2026-Vault-7f89b';

  return {
    name: 'admin-auth-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/admin/auth/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');

        if (req.url === '/api/admin/auth/login' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              const email = (data.email || '').trim().toLowerCase();
              const pass = (data.password || '').trim();

              if (!AUTHORIZED_ADMIN_ACCOUNTS.includes(email)) {
                res.statusCode = 403;
                return res.end(
                  JSON.stringify({
                    success: false,
                    error: 'Access Denied: This account is not an authorized administrator.',
                  })
                );
              }

              if (pass !== DEFAULT_INITIAL_ADMIN_PASS) {
                res.statusCode = 401;
                return res.end(
                  JSON.stringify({
                    success: false,
                    error: 'Invalid administrator email or password.',
                  })
                );
              }

              res.setHeader('Set-Cookie', 'ap_admin_session=dev-authenticated-session; Path=/; HttpOnly; SameSite=Strict');
              res.statusCode = 200;
              return res.end(
                JSON.stringify({
                  success: true,
                  user: { email: 'ayush@admin', role: 'admin', uid: 'poQdIaU1YbUgWvdRUguhtyRbV6A2' },
                  token: 'dev-authenticated-session',
                  firebaseMapping: {
                    mappedEmail: BACKEND_FIREBASE_MAPPED_EMAIL,
                    vaultKey: BACKEND_FIREBASE_VAULT_KEY,
                  },
                })
              );
            } catch {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Malformed request.' }));
            }
          });
          return;
        }

        if (req.url === '/api/admin/auth/session' && req.method === 'GET') {
          const cookie = req.headers.cookie || '';
          const hasSession = cookie.includes('ap_admin_session=');
          if (!hasSession) {
            res.statusCode = 401;
            return res.end(JSON.stringify({ success: false, error: 'Unauthenticated.' }));
          }

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              user: { email: 'ayush@admin', role: 'admin', uid: 'poQdIaU1YbUgWvdRUguhtyRbV6A2' },
              firebaseMapping: {
                mappedEmail: BACKEND_FIREBASE_MAPPED_EMAIL,
                vaultKey: BACKEND_FIREBASE_VAULT_KEY,
              },
            })
          );
        }

        if (req.url === '/api/admin/auth/logout' && req.method === 'POST') {
          res.setHeader('Set-Cookie', 'ap_admin_session=; Path=/; HttpOnly; Max-Age=0');
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }

        if (req.url === '/api/admin/auth/register') {
          res.statusCode = 403;
          return res.end(
            JSON.stringify({
              success: false,
              error: 'Public registration is disabled.',
            })
          );
        }

        next();
      });
    },
  };
}

function storageDevPlugin(): Plugin {
  // In-memory dev storage map for local dev server
  const devStorage = new Map<string, { buffer: Buffer; contentType: string; metadata: any }>();

  return {
    name: 'storage-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/storage/')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost:3000');
        const pathname = url.pathname;

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        // Status
        if (pathname === '/api/storage/status') {
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              provider: 'cloudflare-r2',
              bucket: 'portfolio-assets',
              connected: true,
              fileCount: devStorage.size,
              totalSizeBytes: Array.from(devStorage.values()).reduce((sum, v) => sum + v.buffer.length, 0),
              categories: { resumes: 0, profile: 0, projects: 0, media: devStorage.size },
              lastChecked: new Date().toISOString(),
              message: 'Connected to Cloudflare R2 (portfolio-assets)',
            })
          );
        }

        // Upload
        if (pathname === '/api/storage/upload' && req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (c) => chunks.push(c));
          req.on('end', () => {
            const buffer = Buffer.concat(chunks);
            const contentType = req.headers['content-type'] || '';

            // Handle multipart or raw stream
            const randomSuffix = Math.random().toString(36).substring(2, 7);
            const cleanFileName = `uploaded_${Date.now()}_${randomSuffix}`;
            const objectKey = `public/media/${Date.now()}_${randomSuffix}_${cleanFileName}`;

            devStorage.set(objectKey, {
              buffer,
              contentType: contentType.includes('multipart') ? 'application/octet-stream' : contentType,
              metadata: {
                originalName: cleanFileName,
                uploadedAt: new Date().toISOString(),
              },
            });

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            return res.end(
              JSON.stringify({
                success: true,
                file: {
                  fileId: `r2_${Date.now()}_${randomSuffix}`,
                  storageProvider: 'cloudflare-r2',
                  objectKey,
                  publicUrl: `/api/storage/files/${objectKey}`,
                  secureUrl: `/api/storage/secure/${objectKey}`,
                  originalName: cleanFileName,
                  displayName: cleanFileName,
                  mimeType: 'application/octet-stream',
                  sizeBytes: buffer.length,
                  visibility: 'public',
                  uploadedBy: 'ayush@admin',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  category: 'media',
                  status: 'active',
                  migrationStatus: 'verified',
                },
              })
            );
          });
          return;
        }

        // Public file delivery
        if (pathname.startsWith('/api/storage/files/')) {
          const key = decodeURIComponent(pathname.slice('/api/storage/files/'.length));
          if (key.startsWith('private/')) {
            res.statusCode = 403;
            return res.end('Access Denied: Private document');
          }

          const file = devStorage.get(key);
          if (file) {
            res.setHeader('Content-Type', file.contentType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.statusCode = 200;
            return res.end(file.buffer);
          }
          res.statusCode = 404;
          return res.end('File not found');
        }

        // Secure file delivery
        if (pathname.startsWith('/api/storage/secure/')) {
          const key = decodeURIComponent(pathname.slice('/api/storage/secure/'.length));
          const file = devStorage.get(key);
          if (file) {
            res.setHeader('Content-Type', file.contentType);
            res.setHeader('Cache-Control', 'private, no-cache');
            res.statusCode = 200;
            return res.end(file.buffer);
          }
          res.statusCode = 404;
          return res.end('Secure file not found');
        }

        // Delete
        if (pathname === '/api/storage/delete' && req.method === 'POST') {
          let body = '';
          req.on('data', (c) => (body += c));
          req.on('end', () => {
            try {
              const data = JSON.parse(body || '{}');
              if (data.objectKey) {
                devStorage.delete(data.objectKey);
              }
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, deletedKey: data.objectKey }));
            } catch {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Malformed JSON' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), adminAuthDevPlugin(), storageDevPlugin()],
  server: {
    port: 3000,
    host: true,
  },
});

