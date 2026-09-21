import React from 'react';

export const LoadingSkeleton = ({ rows = 5, height = '40px' }) => {
  return (
    <div className="skeleton-container">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-item" style={{ height }} />
      ))}

      <style>{`
        .skeleton-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem 0;
        }
        .skeleton-item {
          width: 100%;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: skeletonPulse 1.5s infinite;
          border-radius: var(--radius-md);
        }
        @keyframes skeletonPulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};
