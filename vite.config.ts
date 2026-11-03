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

export default defineConfig({
  plugins: [react(), adminAuthDevPlugin()],
  server: {
    port: 3000,
    host: true,
  },
});

