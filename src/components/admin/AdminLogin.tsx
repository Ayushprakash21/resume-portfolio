import React, { useState } from 'react';
import { Mail, Key, AlertCircle, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { authService } from '../../services/authService';
import { ApMonogram } from '../brand/ApMonogram';
import {
  AdminModal,
  AdminModalHeader,
  AdminModalBody,
  AdminModalFooter,
  AdminFormField,
  AdminInput,
} from './common/AdminModal';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onReturnToSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onReturnToSite }) => {
  const [email, setEmail] = useState('ayush@admin');
  const [password, setPassword] = useState('admin');
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
        backgroundColor: '#050505',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 32px)',
        position: 'relative',
      }}
    >
      <div style={{ width: '100%', maxWidth: '430px', marginBottom: '16px', display: 'flex', justifyContent: 'flex-start' }}>
        {/* Return to public site button */}
        <button
          onClick={onReturnToSite}
          className="glass-btn-spring"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '12px',
            minHeight: '44px',
          }}
        >
          <ArrowLeft size={13} />
          <span>Return to Portfolio</span>
        </button>
      </div>

      {/* Main Glass Login Card */}
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '430px',
          padding: 'clamp(28px, 6vw, 44px) clamp(20px, 5vw, 36px)',
        }}
      >
        {/* AP Official Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-block', marginBottom: '18px' }}>
            <ApMonogram width={84} withGlow={true} />
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            AYUSH PRAKASH
          </h1>

          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Portfolio Administration
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '12px 14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '13px',
              color: '#F87171',
              fontFamily: 'var(--font-body)',
            }}
          >
            <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '8px',
              }}
            >
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <Mail
                size={16}
                color="var(--accent-silver)"
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '8px',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter administrator password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <Key
                size={16}
                color="var(--accent-silver)"
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
                color: 'var(--accent-silver)',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-luxury-primary"
            style={{
              padding: '12px',
              width: '100%',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {loading ? 'Authenticating with Firebase...' : 'Sign In to Console'}
          </button>
        </form>

        <div
          style={{
            marginTop: '28px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '16px',
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            letterSpacing: '0.04em',
          }}
        >
          FIREBASE AUTHENTICATION &bull; ENCRYPTED ACCESS
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <AdminModal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          size="sm"
          maxWidth="420px"
          ariaLabel="Reset Admin Password"
        >
          <AdminModalHeader
            title="Reset Admin Password"
            subtitle="Request an encrypted password reset token via email."
            icon={<Key size={18} />}
            onClose={() => setShowResetModal(false)}
          />

          <AdminModalBody padding="24px">
            {resetSent ? (
              <div>
                <p style={{ fontSize: '13.5px', color: '#4ADE80', marginBottom: '8px', lineHeight: 1.5 }}>
                  A secure password reset link has been dispatched to <strong>{resetEmail}</strong>.
                </p>
                <p style={{ fontSize: '12px', color: '#8E948D', margin: 0 }}>
                  Check your inbox and spam folder, then follow the instructions.
                </p>
              </div>
            ) : (
              <form id="password-reset-form" onSubmit={handlePasswordReset}>
                <AdminFormField
                  label="Administrative Email Address"
                  required={true}
                  helpText="Enter your authorized portfolio administrator address."
                >
                  <AdminInput
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="ayushprakash0021@gmail.com"
                  />
                </AdminFormField>
              </form>
            )}
          </AdminModalBody>

          <AdminModalFooter
            onCancel={() => setShowResetModal(false)}
            cancelText={resetSent ? 'Close' : 'Cancel'}
            onSave={resetSent ? undefined : () => {
              const formEl = document.getElementById('password-reset-form') as HTMLFormElement | null;
              formEl?.requestSubmit();
            }}
            saveText="Send Link"
            saveType="button"
          />
        </AdminModal>
      )}
    </div>
  );
};
