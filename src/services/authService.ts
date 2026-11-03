import {
  signInWithCredential,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  EmailAuthProvider,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

export interface AdminUser {
  email: string;
  role: string;
  uid: string;
}

export interface AdminAuthState {
  user: User | AdminUser | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

const AUTHORIZED_ADMIN_EMAILS = [
  'ayush@admin',
  'ayush-admin@portfolio.internal',
  'ayushprakash0021@gmail.com',
];

export const authService = {
  /**
   * Listen for Administrator Authentication state changes
   * Synchronized across Firebase Auth and Server Session
   */
  onAuthStateChange(callback: (user: User | AdminUser | null, isAdmin: boolean) => void) {
    let activeUser: User | AdminUser | null = null;
    let activeIsAdmin = false;

    // 1. Check server-side session persistence via secure HttpOnly cookie
    fetch('/api/admin/auth/session', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && data.user) {
          activeUser = data.user;
          activeIsAdmin = true;
          callback(data.user, true);

          // If Firebase client isn't signed in yet, sign in with the server-provided mapping
          if (auth && !auth.currentUser && data.firebaseMapping) {
            const cred = EmailAuthProvider.credential(
              data.firebaseMapping.mappedEmail,
              data.firebaseMapping.vaultKey
            );
            signInWithCredential(auth, cred).catch((err) => {
              console.warn('[AuthService] Firebase background sync warning:', err);
            });
          }
        }
      })
      .catch(() => {
        // Network or offline check
      });

    // 2. Listen to Firebase Auth state
    if (auth) {
      return onAuthStateChanged(auth, (user) => {
        if (user && user.email) {
          const isAuthorized = AUTHORIZED_ADMIN_EMAILS.includes(user.email.toLowerCase());
          if (isAuthorized) {
            activeUser = user;
            activeIsAdmin = true;
            callback(user, true);
            return;
          }
        }

        // If Firebase says not signed in, verify whether server session still holds
        if (!activeIsAdmin) {
          callback(null, false);
        }
      });
    }

    return () => {};
  },

  /**
   * Server-Validated Administrator Login
   * Accepts credentials (e.g. ayush@admin / admin), validates on server,
   * establishes secure session and connects to Firebase backend identity.
   */
  async login(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const trimmedPass = (pass || '').trim();

      if (!normalizedEmail || !trimmedPass) {
        return { success: false, error: 'Email and password are required.' };
      }

      // Call secure server endpoint
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: normalizedEmail, password: trimmedPass }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || 'Authentication failed. Please verify credentials.',
        };
      }

      // Connect Firebase Auth using the server-returned mapped identity
      if (auth && data.firebaseMapping) {
        try {
          const cred = EmailAuthProvider.credential(
            data.firebaseMapping.mappedEmail,
            data.firebaseMapping.vaultKey
          );
          await signInWithCredential(auth, cred);
        } catch (fbErr) {
          console.warn('[AuthService] Firebase client credential sync:', fbErr);
        }
      }

      return { success: true };
    } catch (err: any) {
      console.error('[AuthService] Login error:', err);
      return {
        success: false,
        error: 'Unable to communicate with the authentication server. Please check connection.',
      };
    }
  },

  /**
   * Sign Out & Invalidate Session
   */
  async logout(): Promise<void> {
    try {
      // Clear server session cookie
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('[AuthService] Server logout notification error:', err);
    }

    try {
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (err) {
      console.error('[AuthService] Firebase signout error:', err);
    }
  },

  /**
   * Request Password Reset for production recovery
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!auth) {
        return { success: true };
      }
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Password reset request failed.' };
    }
  },

  /**
   * Synchronous check if current Firebase session is active admin
   */
  isCurrentSessionAdmin(): boolean {
    if (auth && auth.currentUser && auth.currentUser.email) {
      return AUTHORIZED_ADMIN_EMAILS.includes(auth.currentUser.email.toLowerCase());
    }
    return false;
  },
};
