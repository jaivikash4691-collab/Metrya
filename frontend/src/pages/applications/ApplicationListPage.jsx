import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FileCheck2,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Calendar,
  UserCheck,
  Award,
  AlertTriangle,
  Play
} from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { instrumentService } from '../../services/instrumentService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { NewApplicationModal } from './NewApplicationModal';
import { useAuth } from '../../context/AuthContext';

export const ApplicationListPage = () => {
  const { role } = useAuth();
  const [searchParams] = useSearchParams();
  const [applications, setApplications] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState(searchParams.get('status') || 'ALL');
  const [isModalOpen, setIsModalOpen] = useState(searchParams.get('new') === 'true');
  const preselectedInstId = searchParams.get('instId') || '';

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getApplications({
        search: search || undefined,
        status: statusTab !== 'ALL' ? statusTab : undefined
      });
      if (res.success) {
        setApplications(res.applications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInstruments = async () => {
      try {
        const res = await instrumentService.getInstruments({});
        if (res.success) setInstruments(res.instruments || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadInstruments();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchApplications();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, statusTab]);

  const tabs = [
    { key: 'ALL', label: 'All Applications' },
    { key: 'SUBMITTED', label: 'Submitted' },
    { key: 'ASSIGNED', label: 'Assigned' },
    { key: 'SCHEDULED', label: 'Scheduled' },
    { key: 'INSPECTION_COMPLETED', label: 'Inspection Done' },
    { key: 'CERTIFICATE_GENERATED', label: 'Certified' },
    { key: 'REJECTED', label: 'Rejected' }
  ];

  return (
    <div className="application-list-page">
      <div className="section-header">
        <div>
          <h1 className="page-title">Verification Applications</h1>
          <p className="page-subtitle">
            Lifecycle tracking, officer assignments, scheduling & digital approval records
          </p>
        </div>
        {(role === 'USER' || role === 'SUPER_ADMIN') && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <PlusCircle size={16} /> New Verification Application
          </button>
        )}
      </div>

      {/* Tabs Row */}
      <div className="status-tabs-container mb-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatusTab(t.key)}
            className={`status-tab-btn ${statusTab === t.key ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search Input Bar */}
      <div className="card filter-card mb-4">
        <div className="search-input-group">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Application Number (e.g. VER-2026-000101)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control with-icon"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={6} />
        ) : applications.length === 0 ? (
          <EmptyState
            icon={FileCheck2}
            title="No verification applications found"
            description="No applications match the selected status or search query."
            actionLabel="Create Application"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application No</th>
                  <th>Submitted Date</th>
                  <th>Applicant / Enterprise</th>
                  <th>Instrument</th>
                  <th>Type & Priority</th>
                  <th>Assigned Officer</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <span className="code-badge">{app.applicationNumber}</span>
                    </td>
                    <td>
                      <span className="text-sm font-medium">{new Date(app.submissionDate).toLocaleDateString()}</span>
                    </td>
                    <td>
                      <div className="font-bold text-slate-900">{app.applicant?.organization || app.applicant?.name}</div>
                      <div className="text-xs text-muted">{app.applicant?.email}</div>
                    </td>
                    <td>
                      <div className="font-medium text-slate-800">{app.instrument?.instrumentType}</div>
                      <div className="text-xs text-muted code-font">{app.instrument?.serialNumber}</div>
                    </td>
                    <td>
                      <div className="text-xs font-semibold">{app.applicationType.replace(/_/g, ' ')}</div>
                      {app.priority === 'URGENT' ? (
                        <span className="badge badge-danger text-xs">URGENT</span>
                      ) : (
                        <span className="badge badge-slate text-xs">NORMAL</span>
                      )}
                    </td>
                    <td>
                      {app.assignedOfficer ? (
                        <div className="text-sm font-medium">{app.assignedOfficer.name}</div>
                      ) : (
                        <span className="text-xs text-muted">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <Link to={`/applications/${app._id}`} className="btn btn-secondary btn-sm">
                        <Eye size={14} /> Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Application Modal */}
      <NewApplicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        instruments={instruments}
        preselectedInstId={preselectedInstId}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchApplications();
        }}
      />

      <style>{`
        .status-tabs-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.25rem;
        }
        .status-tab-btn {
          background: #ffffff;
          border: 1px solid var(--border-color);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--slate-600);
          cursor: pointer;
          white-space: nowrap;
          transition: var(--transition);
        }
        .status-tab-btn:hover {
          border-color: var(--primary-500);
          color: var(--primary-700);
        }
        .status-tab-btn.active {
          background: var(--primary-600);
          color: #ffffff;
          border-color: var(--primary-600);
        }
      `}</style>
    </div>
  );
};
