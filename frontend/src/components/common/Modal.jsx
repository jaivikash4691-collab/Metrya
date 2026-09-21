import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, footer, size = 'md' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = size === 'lg' ? 'modal-content-lg' : size === 'sm' ? 'modal-content-sm' : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${sizeClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">{title}</h3>
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>

      <style>{`
        .modal-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--slate-900);
        }
        .modal-subtitle {
          font-size: 0.8rem;
          color: var(--slate-500);
          margin-top: 2px;
        }
        .modal-close-btn {
          background: none;
          border: none;
          color: var(--slate-400);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          transition: var(--transition);
        }
        .modal-close-btn:hover {
          color: var(--slate-800);
          background-color: var(--slate-100);
        }
        .modal-content-sm {
          max-width: 440px;
        }
      `}</style>
    </div>
  );
};
