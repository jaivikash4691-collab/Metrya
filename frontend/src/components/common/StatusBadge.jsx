import React from 'react';

export const StatusBadge = ({ status, type = 'application' }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  const getStatusConfig = () => {
    switch (normalized) {
      case 'VALID':
      case 'VERIFIED':
      case 'APPROVED':
      case 'CERTIFICATE_GENERATED':
      case 'COMPLETED':
      case 'ACTIVE':
      case 'PASS':
      case 'PASSED':
      case 'INTACT':
        return { label: status.replace(/_/g, ' '), className: 'badge-success' };

      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'ASSIGNED':
      case 'SCHEDULED':
      case 'INSPECTION_IN_PROGRESS':
      case 'PENDING_VERIFICATION':
      case 'PENDING':
      case 'NORMAL':
        return { label: status.replace(/_/g, ' '), className: 'badge-info' };

      case 'INSPECTION_COMPLETED':
      case 'REVERIFICATION_REQUIRED':
      case 'RESCHEDULED':
      case 'EXPIRING_SOON':
      case 'URGENT':
        return { label: status.replace(/_/g, ' '), className: 'badge-warning' };

      case 'EXPIRED':
      case 'REJECTED':
      case 'REVOKED':
      case 'CANCELLED':
      case 'FAILED':
      case 'FAIL':
      case 'BROKEN':
      case 'UNSAFE':
      case 'SUSPENDED':
        return { label: status.replace(/_/g, ' '), className: 'badge-danger' };

      case 'REGISTERED':
      case 'DRAFT':
      default:
        return { label: status.replace(/_/g, ' '), className: 'badge-slate' };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`badge ${config.className}`}>
      <span className="badge-dot" />
      {config.label}
    </span>
  );
};
