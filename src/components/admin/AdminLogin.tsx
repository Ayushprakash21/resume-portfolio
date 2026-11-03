import React, { useState } from 'react';
import { Lock, Mail, Key, AlertCircle, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onReturnToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onReturnToSite }) => {
  const [email, setEmail] = useState('ayushprakash0021@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('ayushprakash0021@gmail.com');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authService.login(email, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authService.requestPasswordReset(resetEmail);
      if (res.success) {
        setResetSent(true);
      } else {
        setError(res.error || 'Could not send reset link.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#07090D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
      }}
    >
      {/* Return to public site button */}
      <button
        onClick={onReturnToSite}
        style={{
          position: 'absolute',
          top: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#151E29',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#A7B2C0',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
        }}
      >
        <ArrowLeft size={14} />
        <span>Return to 3D Portfolio</span>
      </button>

      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#0C1118',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '36px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: 'rgba(69, 214, 255, 0.1)',
              border: '1px solid rgba(69, 214, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#45D6FF',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <h1
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '22px',
              fontWeight: 700,
              color: '#F5F7FA',
              marginBottom: '6px',
            }}
          >
            Private CMS Console
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#738195' }}>
            Authorized Administrator Access Only
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(255, 107, 117, 0.1)',
              border: '1px solid rgba(255, 107, 117, 0.3)',
              borderRadius: '6px',
              padding: '12px 14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '13px',
              color: '#FF6B75',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                color: '#738195',
                marginBottom: '6px',
              }}
            >
              ADMIN EMAIL
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 36px',
                  backgroundColor: '#151E29',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  color: '#F5F7FA',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <Mail
                size={16}
                color="#738195"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                color: '#738195',
                marginBottom: '6px',
              }}
            >
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="Enter Firebase admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 36px',
                  backgroundColor: '#151E29',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  color: '#F5F7FA',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <Key
                size={16}
                color="#738195"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#45D6FF',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: 'rgba(69, 214, 255, 0.15)',
              border: '1px solid #45D6FF',
              color: '#FFFFFF',
              padding: '12px',
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Authenticating with Firebase...' : 'Sign In to Console'}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            paddingTop: '16px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            color: '#738195',
            textAlign: 'center',
          }}
        >
          FIREBASE AUTHENTICATION • ZERO-HARDCODED BACKDOOR
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 100,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              backgroundColor: '#0C1118',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '28px',
            }}
          >
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FFFFFF', marginBottom: '12px' }}>
              Reset Admin Password
            </h3>
            {resetSent ? (
              <div>
                <p style={{ fontSize: '13px', color: '#42D6A4', marginBottom: '16px' }}>
                  A secure password reset link has been dispatched to {resetEmail}.
                </p>
                <button
                  onClick={() => setShowResetModal(false)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#151E29',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset}>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: '#151E29',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    marginBottom: '16px',
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: 'rgba(69, 214, 255, 0.2)',
                      border: '1px solid #45D6FF',
                      color: '#FFFFFF',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Send Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#151E29',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#A7B2C0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
