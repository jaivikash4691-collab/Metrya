import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  FileCheck2,
  Award,
  AlertTriangle,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { instrumentService } from '../../services/instrumentService';
import { applicationService } from '../../services/applicationService';
import { certificateService } from '../../services/certificateService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [instruments, setInstruments] = useState([]);
  const [applications, setApplications] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [instRes, appRes, certRes] = await Promise.all([
          instrumentService.getInstruments({ limit: 5 }),
          applicationService.getApplications({ limit: 5 }),
          certificateService.getCertificates({ limit: 5 })
        ]);

        if (instRes.success) setInstruments(instRes.instruments || []);
        if (appRes.success) setApplications(appRes.applications || []);
        if (certRes.success) setCertificates(certRes.certificates || []);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalInstruments = instruments.length;
  const activeCertificatesCount = certificates.filter((c) => c.status === 'VALID').length;
  const pendingAppsCount = applications.filter((a) =>
    ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'SCHEDULED', 'INSPECTION_IN_PROGRESS'].includes(a.status)
  ).length;
  const expiredCount = instruments.filter((i) => i.status === 'EXPIRED').length;

  if (loading) {
    return (
      <div>
        <div className="section-header">
          <div>
            <h1 className="page-title">Welcome back, {user?.name}</h1>
            <p className="page-subtitle">Legal Metrology Compliance & Instrument Overview</p>
          </div>
        </div>
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Header Section */}
      <div className="dashboard-banner">
        <div className="banner-content">
          <span className="banner-tag">INSTRUMENT OWNER PORTAL</span>
          <h1 className="banner-title">Welcome back, {user?.name}</h1>
          <p className="banner-sub">
            {user?.organization ? `${user.organization} • ` : ''}
            Manage weights and measures compliance, track inspections, and download verified digital certificates.
          </p>
        </div>
        <div className="banner-actions">
          <Link to="/instruments" className="btn btn-primary">
            <PlusCircle size={16} /> Register Instrument
          </Link>
          <Link to="/applications" className="btn btn-secondary">
            <FileCheck2 size={16} /> New Verification App
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid-4 mb-4">
        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-blue">
            <Scale size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{totalInstruments}</div>
            <div className="kpi-label">Registered Instruments</div>
          </div>
        </div>

        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-amber">
            <Clock size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{pendingAppsCount}</div>
            <div className="kpi-label">Active Applications</div>
          </div>
        </div>

        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-emerald">
            <Award size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{activeCertificatesCount}</div>
            <div className="kpi-label">Active Certificates</div>
          </div>
        </div>

        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-rose">
            <AlertTriangle size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{expiredCount}</div>
            <div className="kpi-label">Expired / Needs Stamping</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Applications & Instruments */}
      <div className="grid-2 mb-4">
        {/* Recent Applications */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Verification Applications</h3>
            <Link to="/applications" className="card-header-link">
              View all ({applications.length}) →
            </Link>
          </div>

          {applications.length === 0 ? (
            <EmptyState
              icon={FileCheck2}
              title="No active verification applications"
              description="Submit a verification application to get your weighing instruments inspected and stamped."
              actionLabel="Apply for Verification"
              onAction={() => (window.location.href = '/applications')}
            />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>App No</th>
                    <th>Instrument</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id}>
                      <td>
                        <span className="code-badge">{app.applicationNumber}</span>
                      </td>
                      <td>
                        <div className="table-cell-title">{app.instrument?.instrumentType || 'Instrument'}</div>
                        <div className="table-cell-sub">{app.instrument?.serialNumber}</div>
                      </td>
                      <td>
                        <StatusBadge status={app.status} />
                      </td>
                      <td>
                        <Link to={`/applications/${app._id}`} className="btn btn-outline-primary btn-sm">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Registered Instruments */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">My Registered Instruments</h3>
            <Link to="/instruments" className="card-header-link">
              Manage Instruments →
            </Link>
          </div>

          {instruments.length === 0 ? (
            <EmptyState
              icon={Scale}
              title="No registered instruments"
              description="Register your business scales, weighing machines or meters to monitor their verification lifecycle."
              actionLabel="Register New Instrument"
              onAction={() => (window.location.href = '/instruments')}
            />
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID / Type</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Next Stamping</th>
                  </tr>
                </thead>
                <tbody>
                  {instruments.map((inst) => (
                    <tr key={inst._id}>
                      <td>
                        <div className="table-cell-title">{inst.instrumentType}</div>
                        <div className="table-cell-sub code-font">{inst.instrumentId} • {inst.serialNumber}</div>
                      </td>
                      <td>
                        <span className="font-semibold">{inst.capacity} {inst.unit}</span>
                      </td>
                      <td>
                        <StatusBadge status={inst.status} />
                      </td>
                      <td>
                        {inst.nextVerificationDate ? (
                          <span className="text-sm font-medium">
                            {new Date(inst.nextVerificationDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-muted text-sm">Not Stamped</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Active Certificates Quick Row */}
      {certificates.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Active Digital Certificates & QR Stamping</h3>
            <Link to="/certificates" className="card-header-link">
              View all certificates →
            </Link>
          </div>

          <div className="cert-cards-row">
            {certificates.map((cert) => (
              <div key={cert._id} className="cert-mini-card">
                <div className="cert-mini-header">
                  <div className="cert-mini-icon">
                    <Award size={18} />
                  </div>
                  <StatusBadge status={cert.status} />
                </div>
                <div className="cert-mini-num">{cert.certificateNumber}</div>
                <div className="cert-mini-inst">{cert.instrumentSnapshot?.instrumentType}</div>
                <div className="cert-mini-validity">
                  Valid until: <strong>{new Date(cert.validUntil).toLocaleDateString()}</strong>
                </div>
                <div className="cert-mini-footer">
                  <Link to={`/verify/${cert.certificateNumber}`} target="_blank" className="cert-mini-link">
                    <ShieldCheck size={14} /> Public Verify QR
                  </Link>
                  <Link to="/certificates" className="btn btn-outline-primary btn-sm">
                    Download
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .dashboard-banner {
          background: linear-gradient(135deg, #1e293b, #0f172a);
          color: #ffffff;
          border-radius: var(--radius-lg);
          padding: 2rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          box-shadow: var(--shadow-md);
        }
        .banner-tag {
          font-size: 0.725rem;
          font-weight: 700;
          color: #60a5fa;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .banner-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0.25rem 0 0.5rem;
        }
        .banner-sub {
          font-size: 0.875rem;
          color: #94a3b8;
          max-width: 600px;
          line-height: 1.45;
        }
        .banner-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .stat-kpi-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.25rem;
        }
        .kpi-icon-box {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .kpi-value {
          font-family: var(--font-heading);
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--slate-900);
          line-height: 1;
        }
        .kpi-label {
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--slate-500);
          margin-top: 0.25rem;
        }
        .mb-4 { margin-bottom: 1.5rem; }
        .card-header-link {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--primary-600);
        }
        .table-cell-title {
          font-weight: 600;
          color: var(--slate-900);
        }
        .table-cell-sub {
          font-size: 0.75rem;
          color: var(--slate-500);
        }
        .code-badge {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.8rem;
          color: var(--primary-700);
          background: var(--primary-50);
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
        }
        .cert-cards-row {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .cert-mini-card {
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .cert-mini-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cert-mini-icon {
          color: #059669;
          background: #ecfdf5;
          padding: 0.35rem;
          border-radius: var(--radius-sm);
        }
        .cert-mini-num {
          font-family: var(--font-mono);
          font-weight: 800;
          font-size: 0.925rem;
          color: var(--slate-900);
        }
        .cert-mini-inst {
          font-size: 0.85rem;
          color: var(--slate-600);
        }
        .cert-mini-validity {
          font-size: 0.775rem;
          color: var(--slate-500);
        }
        .cert-mini-footer {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cert-mini-link {
          font-size: 0.775rem;
          font-weight: 600;
          color: var(--primary-600);
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        @media (max-width: 868px) {
          .dashboard-banner { flex-direction: column; align-items: flex-start; }
          .banner-actions { width: 100%; flex-direction: row; }
        }
      `}</style>
    </div>
  );
};
