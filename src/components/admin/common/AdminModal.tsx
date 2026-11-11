import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { X, Trash2, Loader2, AlertCircle } from 'lucide-react';

export interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxWidth?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const SIZE_MAP: Record<NonNullable<AdminModalProps['size']>, string> = {
  sm: '460px',
  md: '680px',
  lg: '860px',
  xl: '1080px',
  full: '96vw',
};

/**
 * UNIFIED ADMIN MODAL
 * Standardized black luxury modal container adhering to AP design system:
 * - Stacking context detachment via React Portal directly into document.body
 * - Auto body scroll locking & restoration
 * - Keyboard Escape listener & focus management
 * - Consistent graphite/black luxury glassmorphism surfaces
 * - Fluid responsive sizing across desktop, tablet, and mobile
 */
export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  maxWidth,
  size = 'lg',
  children,
  className = '',
  style,
  closeOnBackdropClick = false,
  closeOnEscape = true,
  ariaLabel = 'Dialog',
  ariaDescribedBy,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const resolvedMaxWidth = maxWidth || SIZE_MAP[size] || '860px';

  // Body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`admin-modal-overlay ${className}`}
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.86)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: 'clamp(8px, 2.5vw, 24px)',
        animation: 'fadeIn 0.18s ease-out',
        ...style,
      }}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="admin-modal-container"
        style={{
          backgroundColor: '#0A0B0E',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '14px',
          maxWidth: resolvedMaxWidth,
          width: '100%',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.04)',
          animation: 'modalSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {children}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? ReactDOM.createPortal(content, document.body) : null;
};

export interface AdminModalHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  badge?: string;
}

export const AdminModalHeader: React.FC<AdminModalHeaderProps> = ({
  title,
  subtitle,
  icon,
  onClose,
  badge,
}) => {
  return (
    <div
      style={{
        padding: '16px 22px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#121319',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {icon && (
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: 'rgba(140, 21, 36, 0.18)',
              border: '1px solid rgba(140, 21, 36, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#F47282',
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '17.5px',
                fontWeight: 600,
                color: '#F4F3EE',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              {title}
            </h3>
            {badge && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#C1C4BE',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <div
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '12px',
                color: '#8E948D',
                marginTop: '3px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close dialog"
        title="Close (Esc)"
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          color: '#A7B0A9',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = '#FFFFFF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
          e.currentTarget.style.color = '#A7B0A9';
        }}
      >
        <X size={17} />
      </button>
    </div>
  );
};

export interface AdminModalBodyProps {
  children: React.ReactNode;
  padding?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const AdminModalBody: React.FC<AdminModalBodyProps> = ({
  children,
  padding = '22px',
  style,
  className = '',
}) => {
  return (
    <div
      className={`admin-modal-body ${className}`}
      style={{
        padding,
        overflowY: 'auto',
        flex: 1,
        minHeight: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export interface AdminModalFooterProps {
  children?: React.ReactNode;
  onCancel?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  cancelText?: string;
  saveText?: string;
  savingText?: string;
  deleteText?: string;
  isSaving?: boolean;
  isDeleting?: boolean;
  saveDisabled?: boolean;
  saveType?: 'button' | 'submit';
  statusText?: React.ReactNode;
}

export const AdminModalFooter: React.FC<AdminModalFooterProps> = ({
  children,
  onCancel,
  onSave,
  onDelete,
  cancelText = 'Cancel',
  saveText = 'Save Changes',
  savingText = 'Saving...',
  deleteText = 'Delete',
  isSaving = false,
  isDeleting = false,
  saveDisabled = false,
  saveType = 'submit',
  statusText,
}) => {
  const showSaveButton = Boolean(onSave || saveType === 'submit');

  return (
    <div
      className="admin-modal-footer"
      style={{
        padding: '14px 22px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        backgroundColor: '#121319',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        gap: '12px',
      }}
    >
      <div>
        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting || isSaving}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              backgroundColor: 'rgba(217, 83, 79, 0.12)',
              border: '1px solid rgba(217, 83, 79, 0.3)',
              color: '#E06C75',
              fontSize: '13px',
              fontWeight: 500,
              cursor: isDeleting || isSaving ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isDeleting && !isSaving) {
                e.currentTarget.style.backgroundColor = 'rgba(217, 83, 79, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(217, 83, 79, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(217, 83, 79, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(217, 83, 79, 0.3)';
            }}
          >
            {isDeleting ? <Loader2 size={13} className="spin" /> : <Trash2 size={13} />}
            {deleteText}
          </button>
        ) : statusText ? (
          <div style={{ fontSize: '12px', color: '#8E948D', fontFamily: 'var(--font-body)' }}>
            {statusText}
          </div>
        ) : (
          <div />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {children}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#C1C4BE',
              fontSize: '13px',
              fontWeight: 500,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isSaving) {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.color = '#FFFFFF';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#C1C4BE';
            }}
          >
            {cancelText}
          </button>
        )}
        {showSaveButton && (
          <button
            type={saveType}
            onClick={saveType === 'button' ? onSave : undefined}
            disabled={saveDisabled || isSaving || isDeleting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 20px',
              borderRadius: '6px',
              backgroundColor: saveDisabled ? 'rgba(255, 255, 255, 0.05)' : '#FFFFFF',
              border: 'none',
              color: saveDisabled ? '#6A736E' : '#080809',
              fontSize: '13px',
              fontWeight: 600,
              cursor: saveDisabled || isSaving || isDeleting ? 'not-allowed' : 'pointer',
              boxShadow: saveDisabled ? 'none' : '0 2px 10px rgba(255, 255, 255, 0.2)',
              opacity: isSaving ? 0.85 : 1,
              transition: 'all 0.15s ease',
            }}
          >
            {isSaving && <Loader2 size={13} className="spin" />}
            {isSaving ? savingText : saveText}
          </button>
        )}
      </div>
    </div>
  );
};

export interface AdminFormFieldProps {
  label?: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  badge?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const AdminFormField: React.FC<AdminFormFieldProps> = ({
  label,
  required = false,
  helpText,
  error,
  badge,
  children,
  style,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', ...style }}>
      {label && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <label
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12.5px',
              fontWeight: 500,
              color: '#D5D2D6',
            }}
          >
            {label} {required && <span style={{ color: '#E06C75' }}>*</span>}
          </label>
          {badge && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: '#8E948D',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {badge}
            </span>
          )}
        </div>
      )}

      {children}

      {error ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: '#E06C75',
            marginTop: '4px',
            fontFamily: 'var(--font-body)',
          }}
        >
          <AlertCircle size={12} />
          {error}
        </div>
      ) : helpText ? (
        <div
          style={{
            fontSize: '11px',
            color: '#8E948D',
            marginTop: '4px',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.4,
          }}
        >
          {helpText}
        </div>
      ) : null}
    </div>
  );
};

export interface AdminInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const AdminInput = React.forwardRef<HTMLInputElement, AdminInputProps>(
  ({ error, style, disabled, ...props }, ref) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        {...props}
        style={{
          width: '100%',
          minHeight: '42px',
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: disabled ? '#080C0B' : '#0E1412',
          border: error
            ? '1px solid #E06C75'
            : '1px solid rgba(244, 243, 238, 0.12)',
          color: '#F4F3EE',
          fontSize: '13.5px',
          fontFamily: 'var(--font-body)',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'all 0.15s ease',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#8C1524';
          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(140, 21, 36, 0.25)';
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#E06C75' : 'rgba(244, 243, 238, 0.12)';
          e.currentTarget.style.boxShadow = 'none';
          props.onBlur?.(e);
        }}
      />
    );
  }
);
AdminInput.displayName = 'AdminInput';

export interface AdminTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const AdminTextarea = React.forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ error, style, disabled, rows = 3, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        disabled={disabled}
        rows={rows}
        {...props}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: '6px',
          backgroundColor: disabled ? '#080C0B' : '#0E1412',
          border: error
            ? '1px solid #E06C75'
            : '1px solid rgba(244, 243, 238, 0.12)',
          color: '#F4F3EE',
          fontSize: '13px',
          fontFamily: 'var(--font-body)',
          outline: 'none',
          resize: 'vertical',
          boxSizing: 'border-box',
          lineHeight: 1.5,
          transition: 'all 0.15s ease',
          ...style,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#8C1524';
          e.currentTarget.style.boxShadow = '0 0 0 2px rgba(140, 21, 36, 0.25)';
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#E06C75' : 'rgba(244, 243, 238, 0.12)';
          e.currentTarget.style.boxShadow = 'none';
          props.onBlur?.(e);
        }}
      />
    );
  }
);
AdminTextarea.displayName = 'AdminTextarea';

export interface AdminConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AdminConfirmDialog: React.FC<AdminConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <AdminModal isOpen={isOpen} onClose={onCancel} size="sm">
      <AdminModalHeader title={title} onClose={onCancel} />
      <AdminModalBody padding="20px">
        <p style={{ margin: 0, fontSize: '13.5px', color: '#C1C4BE', lineHeight: 1.6 }}>
          {message}
        </p>
      </AdminModalBody>
      <AdminModalFooter>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            color: '#C1C4BE',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          style={{
            padding: '8px 18px',
            borderRadius: '6px',
            backgroundColor: isDestructive ? '#D9534F' : '#FFFFFF',
            border: 'none',
            color: isDestructive ? '#FFFFFF' : '#000000',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {confirmText}
        </button>
      </AdminModalFooter>
    </AdminModal>
  );
};
