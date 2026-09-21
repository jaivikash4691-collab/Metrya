import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="empty-state-wrapper">
      <div className="empty-state-icon">
        <Icon size={38} />
      </div>
      <h4 className="empty-state-title">{title}</h4>
      <p className="empty-state-desc">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary btn-sm mt-3">
          {actionLabel}
        </button>
      )}

      <style>{`
        .empty-state-wrapper {
          padding: 3.5rem 1.5rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          border: 1px dashed var(--slate-300);
          border-radius: var(--radius-lg);
          margin: 1rem 0;
        }
        .empty-state-icon {
          color: var(--slate-400);
          background: var(--slate-100);
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .empty-state-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--slate-800);
          margin-bottom: 0.35rem;
        }
        .empty-state-desc {
          font-size: 0.875rem;
          color: var(--slate-500);
          max-width: 420px;
          line-height: 1.45;
        }
        .mt-3 {
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};
