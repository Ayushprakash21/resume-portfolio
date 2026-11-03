import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

const AUTHORIZED_ADMIN_EMAILS = [
  'ayushprakash0021@gmail.com',
];

export const authService = {
  /**
   * Listen for Firebase Authentication state changes
   */
  onAuthStateChange(callback: (user: User | null, isAdmin: boolean) => void) {
    if (!auth) {
      // Mock listener if auth is unavailable
      const stored = localStorage.getItem('ayush_cms_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          callback(parsed as unknown as User, true);
        } catch {
          callback(null, false);
        }
      } else {
        callback(null, false);
      }
      return () => {};
    }

    return onAuthStateChanged(auth, (user) => {
      const isAdmin = Boolean(
        user && user.email && AUTHORIZED_ADMIN_EMAILS.includes(user.email.toLowerCase())
      );
      callback(user, isAdmin);
    });
  },

  /**
   * Real Firebase Email/Password Sign-In
   */
  async login(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (auth) {
        const userCred = await signInWithEmailAndPassword(auth, email, pass);
        const isAdmin = Boolean(
          userCred.user.email && AUTHORIZED_ADMIN_EMAILS.includes(userCred.user.email.toLowerCase())
        );
        if (!isAdmin) {
          await fbSignOut(auth);
          return { success: false, error: 'Access Denied: This account is not an authorized administrator.' };
        }
        return { success: true };
      } else {
        // Local developer session fallback
        if (email.toLowerCase() === 'ayushprakash0021@gmail.com') {
          const mockUser = { email, uid: 'admin-bootstrap-uid' };
          localStorage.setItem('ayush_cms_session', JSON.stringify(mockUser));
          return { success: true };
        }
        return { success: false, error: 'Invalid credentials or unauthorized account.' };
      }
    } catch (err: any) {
      console.error('[AuthService] Login error:', err);
      // Clean error messaging
      let msg = err.message || 'Authentication failed. Please verify credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please reset password or try again later.';
      }
      return { success: false, error: msg };
    }
  },

  /**
   * Sign Out
   */
  async logout(): Promise<void> {
    try {
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (err) {
      console.error('[AuthService] Logout error:', err);
    } finally {
      localStorage.removeItem('ayush_cms_session');
    }
  },

  /**
   * Send Password Reset
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
   * Synchronous check if current session is active admin
   */
  isCurrentSessionAdmin(): boolean {
    if (auth && auth.currentUser) {
      return Boolean(
        auth.currentUser.email && AUTHORIZED_ADMIN_EMAILS.includes(auth.currentUser.email.toLowerCase())
      );
    }
    const stored = localStorage.getItem('ayush_cms_session');
    return Boolean(stored);
  },
};
