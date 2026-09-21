import React from 'react';
import { Check, Clock, AlertCircle, Award, Calendar, FileText, UserCheck, ShieldCheck } from 'lucide-react';

export const LifecycleTimeline = ({ currentStatus, statusHistory = [] }) => {
  const steps = [
    { key: 'SUBMITTED', label: 'Submitted', icon: FileText },
    { key: 'ASSIGNED', label: 'Officer Assigned', icon: UserCheck },
    { key: 'SCHEDULED', label: 'Inspection Scheduled', icon: Calendar },
    { key: 'INSPECTION_COMPLETED', label: 'Digital Inspection', icon: ShieldCheck },
    { key: 'APPROVED', label: 'Officer Approval', icon: Check },
    { key: 'CERTIFICATE_GENERATED', label: 'Digital Certificate', icon: Award }
  ];

  const statusOrder = [
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'ASSIGNED',
    'SCHEDULED',
    'INSPECTION_IN_PROGRESS',
    'INSPECTION_COMPLETED',
    'APPROVED',
    'CERTIFICATE_GENERATED'
  ];

  const isRejected = currentStatus === 'REJECTED';
  const isExpired = currentStatus === 'EXPIRED';

  const currentIndex = statusOrder.indexOf(currentStatus);

  const getStepState = (stepKey) => {
    if (isRejected) return 'rejected';
    const stepIndex = statusOrder.indexOf(stepKey);
    if (currentStatus === stepKey) return 'current';
    if (currentIndex >= stepIndex) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="lifecycle-timeline-wrapper">
      <div className="timeline-steps">
        {steps.map((step, idx) => {
          const state = getStepState(step.key);
          const Icon = step.icon;

          return (
            <div key={step.key} className={`timeline-step ${state}`}>
              <div className="step-marker-container">
                <div className="step-marker">
                  {state === 'completed' ? (
                    <Check size={16} strokeWidth={3} />
                  ) : state === 'rejected' ? (
                    <AlertCircle size={16} />
                  ) : (
                    <Icon size={16} />
                  )}
                </div>
                {idx < steps.length - 1 && <div className="step-connector" />}
              </div>
              <div className="step-label">{step.label}</div>
            </div>
          );
        })}
      </div>

      {/* Rejection Alert Banner if applicable */}
      {isRejected && (
        <div className="timeline-rejection-banner">
          <AlertCircle size={18} />
          <span>Application was marked REJECTED during verification review.</span>
        </div>
      )}

      <style>{`
        .lifecycle-timeline-wrapper {
          padding: 1.5rem 0.5rem;
          width: 100%;
        }
        .timeline-steps {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          position: relative;
        }
        .timeline-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
        }
        .step-marker-container {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.65rem;
        }
        .step-marker {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid var(--slate-300);
          color: var(--slate-400);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          transition: var(--transition);
        }
        .step-connector {
          position: absolute;
          left: 50%;
          right: -50%;
          top: 50%;
          height: 3px;
          background-color: var(--slate-200);
          z-index: 1;
          transform: translateY(-50%);
        }
        .timeline-step.completed .step-marker {
          background-color: #10b981;
          border-color: #10b981;
          color: #ffffff;
        }
        .timeline-step.completed .step-connector {
          background-color: #10b981;
        }
        .timeline-step.current .step-marker {
          background-color: var(--primary-600);
          border-color: var(--primary-600);
          color: #ffffff;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.2);
          transform: scale(1.1);
        }
        .timeline-step.rejected .step-marker {
          background-color: #ef4444;
          border-color: #ef4444;
          color: #ffffff;
        }
        .step-label {
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--slate-600);
          max-width: 110px;
          line-height: 1.25;
        }
        .timeline-step.current .step-label {
          color: var(--primary-700);
          font-weight: 700;
        }
        .timeline-step.completed .step-label {
          color: var(--slate-900);
        }
        .timeline-rejection-banner {
          margin-top: 1.25rem;
          padding: 0.75rem 1rem;
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: var(--radius-md);
          color: #991b1b;
          font-size: 0.85rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        @media (max-width: 640px) {
          .timeline-steps {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .timeline-step {
            flex-direction: row;
            gap: 1rem;
            width: 100%;
          }
          .step-marker-container {
            width: auto;
            margin-bottom: 0;
          }
          .step-connector {
            display: none;
          }
          .step-label {
            max-width: none;
            text-align: left;
          }
        }
      `}</style>
    </div>
  );
};
