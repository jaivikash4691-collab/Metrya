import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  Scale,
  Calendar,
  ClipboardCheck,
  Award,
  ArrowLeft,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  FileText
} from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { authService } from '../../services/authService';
import { certificateService } from '../../services/certificateService';
import { LifecycleTimeline } from '../../components/timeline/LifecycleTimeline';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';

export const ApplicationDetailPage = () => {
  const { id } = useParams();
  const { user, role } = useAuth();
  const [application, setApplication] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Modal States
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState('APPROVED');

  // Form States
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    startTime: '10:00',
    endTime: '11:30',
    notes: ''
  });
  const [decisionForm, setDecisionForm] = useState({
    remarks: '',
    rejectionReason: ''
  });

  const loadApplication = async () => {
    try {
      setLoading(true);
      const res = await applicationService.getApplicationById(id);
      if (res.success) {
        setApplication(res.application);
      }
    } catch (err) {
      setError(err.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, [id]);

  useEffect(() => {
    if (role === 'SUPER_ADMIN' || role === 'LMO') {
      const loadOfficers = async () => {
        try {
          const res = await authService.getUsers({ role: 'LMO' });
          if (res.success) setOfficers(res.users || []);
        } catch (err) {
          console.error(err);
        }
      };
      loadOfficers();
    }
  }, [role]);

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await applicationService.assignOfficerOrGATC(application._id, {
        officerId: selectedOfficer
      });
      setAssignModalOpen(false);
      loadApplication();
    } catch (err) {
      alert(err.message || 'Assignment failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await applicationService.scheduleInspection(application._id, scheduleForm);
      setScheduleModalOpen(false);
      loadApplication();
    } catch (err) {
      alert(err.message || 'Scheduling failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await applicationService.submitDecision(application._id, {
        decision: decisionType,
        remarks: decisionForm.remarks,
        rejectionReason: decisionForm.rejectionReason
      });

      // If approved, automatically trigger certificate generation
      if (decisionType === 'APPROVED') {
        try {
          await certificateService.generateCertificate(application._id);
        } catch (certErr) {
          console.warn('Auto cert generation notice:', certErr.message);
        }
      }

      setDecisionModalOpen(false);
      loadApplication();
    } catch (err) {
      alert(err.message || 'Decision failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={10} />;
  if (!application) return <div className="p-4 text-center">Application record not found.</div>;

  const canAssign = (role === 'SUPER_ADMIN' || role === 'LMO') && ['SUBMITTED', 'UNDER_REVIEW'].includes(application.status);
  const canSchedule = (role === 'SUPER_ADMIN' || role === 'LMO' || role === 'GATC') && ['ASSIGNED', 'UNDER_REVIEW', 'SCHEDULED'].includes(application.status);
  const canInspect = (role === 'LMO' || role === 'GATC' || role === 'SUPER_ADMIN') && ['SCHEDULED', 'INSPECTION_IN_PROGRESS'].includes(application.status);
  const canDecide = (role === 'LMO' || role === 'SUPER_ADMIN') && application.status === 'INSPECTION_COMPLETED';

  return (
    <div className="app-detail-page">
      <div className="mb-3">
        <Link to="/applications" className="back-link">
          <ArrowLeft size={16} /> Back to Applications List
        </Link>
      </div>

      {/* Main Header Banner */}
      <div className="card app-detail-banner mb-4">
        <div className="app-banner-info">
          <div className="app-id-tag">{application.applicationNumber}</div>
          <h1 className="page-title">
            {application.instrument?.instrumentType || 'Verification Application'}
          </h1>
          <p className="app-sub">
            Submitted: {new Date(application.submissionDate).toLocaleDateString()} • Type: <strong>{application.applicationType.replace(/_/g, ' ')}</strong>
          </p>
        </div>

        <div className="app-banner-actions">
          <StatusBadge status={application.status} />

          {/* Action Triggers */}
          <div className="action-buttons-wrap mt-2">
            {canAssign && (
              <button onClick={() => setAssignModalOpen(true)} className="btn btn-primary btn-sm">
                <UserCheck size={14} /> Assign Officer
              </button>
            )}

            {canSchedule && (
              <button onClick={() => setScheduleModalOpen(true)} className="btn btn-primary btn-sm">
                <Calendar size={14} /> Schedule Inspection
              </button>
            )}

            {canInspect && (
              <Link
                to={`/inspections?appId=${application._id}`}
                className="btn btn-success btn-sm"
              >
                <Play size={14} /> Conduct Inspection
              </Link>
            )}

            {canDecide && (
              <div className="decision-btn-group">
                <button
                  onClick={() => {
                    setDecisionType('APPROVED');
                    setDecisionModalOpen(true);
                  }}
                  className="btn btn-success btn-sm"
                >
                  <CheckCircle2 size={14} /> Approve & Certify
                </button>
                <button
                  onClick={() => {
                    setDecisionType('REJECTED');
                    setDecisionModalOpen(true);
                  }}
                  className="btn btn-danger btn-sm"
                >
                  <XCircle size={14} /> Reject
                </button>
              </div>
            )}

            {application.certificate && (
              <a
                href={certificateService.downloadPDFUrl(application.certificate._id || application.certificate)}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-primary btn-sm"
              >
                <Award size={14} /> Download Certificate PDF
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Visual Lifecycle Timeline */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Verification Workflow State Progression</h3>
        </div>
        <LifecycleTimeline
          currentStatus={application.status}
          statusHistory={application.statusHistory}
        />
      </div>

      {/* Main Grid: Application & Instrument Specs */}
      <div className="grid-2 mb-4">
        {/* Instrument Specifications */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Instrument Details</h3>
            <Link to={`/instruments/${application.instrument?._id}`} className="card-header-link">
              Full Instrument Profile →
            </Link>
          </div>

          <div className="spec-table">
            <div className="spec-row">
              <span className="spec-lbl">Instrument ID</span>
              <span className="spec-val code-font">{application.instrument?.instrumentId}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Manufacturer & Model</span>
              <span className="spec-val">{application.instrument?.manufacturer} - {application.instrument?.model}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Serial Number</span>
              <span className="spec-val code-font">{application.instrument?.serialNumber}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Rated Capacity</span>
              <span className="spec-val font-bold">{application.instrument?.capacity} {application.instrument?.unit}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Accuracy Class</span>
              <span className="spec-val">{application.instrument?.accuracyClass}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Installation Site</span>
              <span className="spec-val">
                {application.instrument?.location?.facilityName || 'Main Facility'}, {application.instrument?.location?.city}
              </span>
            </div>
          </div>
        </div>

        {/* Applicant & Inspection Schedule */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Applicant & Officer Assignment</h3>
          </div>

          <div className="spec-table">
            <div className="spec-row">
              <span className="spec-lbl">Applicant / Business</span>
              <span className="spec-val font-medium">{application.applicant?.name || application.applicant?.organization}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Organization</span>
              <span className="spec-val">{application.applicant?.organization || 'N/A'}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Email / Contact</span>
              <span className="spec-val">{application.applicant?.email} • {application.applicant?.phone || 'N/A'}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Assigned LMO Officer</span>
              <span className="spec-val text-primary font-bold">
                {application.assignedOfficer?.name || 'Unassigned'}
              </span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Assigned Testing Centre</span>
              <span className="spec-val">{application.assignedGATC?.gatcCentreName || 'Regional Testing Lab'}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Scheduled Date & Time</span>
              <span className="spec-val font-bold">
                {application.schedule ? (
                  `${new Date(application.schedule.date).toLocaleDateString()} (${application.schedule.startTime} - ${application.schedule.endTime})`
                ) : (
                  <span className="text-muted">Not Scheduled Yet</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Digital Inspection Report (If completed) */}
      {application.inspection && (
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Digital Metrology Inspection Summary</h3>
            <span className={`badge ${application.inspection.overallCompliance ? 'badge-success' : 'badge-danger'}`}>
              {application.inspection.overallCompliance ? 'PASSED MPE LIMITS' : 'FAILED'}
            </span>
          </div>

          <div className="p-2">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Test Point</th>
                    <th>Standard Ref</th>
                    <th>Observed Value</th>
                    <th>Error (Obs - Ref)</th>
                    <th>% Error</th>
                    <th>MPE Tolerance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {application.inspection.measurements?.map((m, idx) => (
                    <tr key={idx}>
                      <td className="font-medium">{m.testPointName}</td>
                      <td>{m.referenceValue} {m.unit}</td>
                      <td>{m.observedValue} {m.unit}</td>
                      <td className="code-font">{m.error > 0 ? `+${m.error}` : m.error} {m.unit}</td>
                      <td className="code-font">{m.percentageError}%</td>
                      <td>±{m.tolerance}%</td>
                      <td>
                        <span className={`badge ${m.pass ? 'badge-success' : 'badge-danger'}`}>
                          {m.pass ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {application.inspection.officerRemarks && (
              <div className="officer-remarks-box mt-3">
                <strong>Officer Remarks:</strong> {application.inspection.officerRemarks}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit History Log */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Application Audit History</h3>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Changed By</th>
                <th>Remarks / Comments</th>
              </tr>
            </thead>
            <tbody>
              {application.statusHistory?.map((h, i) => (
                <tr key={i}>
                  <td><StatusBadge status={h.status} /></td>
                  <td className="text-xs text-muted">{new Date(h.timestamp).toLocaleString()}</td>
                  <td className="font-medium">{h.changedBy?.name || 'System Actor'}</td>
                  <td className="text-sm">{h.comment || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Assign Officer */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Legal Metrology Officer"
        subtitle="Select the authorized officer responsible for inspection"
        footer={
          <>
            <button onClick={() => setAssignModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleAssignSubmit} className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </>
        }
      >
        <form onSubmit={handleAssignSubmit}>
          <div className="form-group">
            <label className="form-label">Select Officer</label>
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              required
              className="form-control"
            >
              <option value="">-- Choose Officer --</option>
              {officers.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.name} ({o.jurisdiction || 'Regional LMO'}) [{o.officerBadgeNumber || 'LMO'}]
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>

      {/* Modal: Schedule Inspection */}
      <Modal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        title="Schedule Inspection Appointment"
        subtitle="Set date and time slot for on-site or laboratory inspection"
        footer={
          <>
            <button onClick={() => setScheduleModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleScheduleSubmit} className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </>
        }
      >
        <form onSubmit={handleScheduleSubmit}>
          <div className="form-group">
            <label className="form-label">Inspection Date *</label>
            <input
              type="date"
              required
              value={scheduleForm.date}
              onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input
                type="time"
                required
                value={scheduleForm.startTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input
                type="time"
                required
                value={scheduleForm.endTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Officer Notes / Equipment Requirement</label>
            <textarea
              rows={2}
              placeholder="e.g. Standard 20kg brass proving weights required."
              value={scheduleForm.notes}
              onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
              className="form-control"
            />
          </div>
        </form>
      </Modal>

      {/* Modal: Approval / Rejection Decision */}
      <Modal
        isOpen={decisionModalOpen}
        onClose={() => setDecisionModalOpen(false)}
        title={decisionType === 'APPROVED' ? 'Approve & Issue Certificate' : 'Reject Verification Application'}
        subtitle={decisionType === 'APPROVED' ? 'Confirm compliance and generate digital PDF certificate' : 'Enter mandatory rejection reason'}
        footer={
          <>
            <button onClick={() => setDecisionModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleDecisionSubmit}
              className={`btn ${decisionType === 'APPROVED' ? 'btn-success' : 'btn-danger'}`}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : decisionType === 'APPROVED' ? 'Approve & Issue' : 'Confirm Rejection'}
            </button>
          </>
        }
      >
        <form onSubmit={handleDecisionSubmit}>
          {decisionType === 'APPROVED' ? (
            <div className="form-group">
              <label className="form-label">Approval Remarks</label>
              <textarea
                rows={3}
                placeholder="Instrument tested and found compliant with legal metrology tolerances."
                value={decisionForm.remarks}
                onChange={(e) => setDecisionForm({ ...decisionForm, remarks: e.target.value })}
                className="form-control"
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Rejection Reason *</label>
              <textarea
                rows={3}
                required
                placeholder="Specify failure reason (e.g. Percentage error exceeded +0.5% MPE limit at half capacity)."
                value={decisionForm.rejectionReason}
                onChange={(e) => setDecisionForm({ ...decisionForm, rejectionReason: e.target.value })}
                className="form-control"
              />
            </div>
          )}
        </form>
      </Modal>

      <style>{`
        .app-detail-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.75rem 2rem;
        }
        .app-id-tag {
          font-family: var(--font-mono);
          font-size: 0.825rem;
          font-weight: 700;
          color: var(--primary-700);
          letter-spacing: 0.05em;
        }
        .app-sub {
          font-size: 0.875rem;
          color: var(--slate-600);
          margin-top: 0.25rem;
        }
        .app-banner-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }
        .action-buttons-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .decision-btn-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .officer-remarks-box {
          background: var(--slate-50);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          font-size: 0.85rem;
          color: var(--slate-700);
        }
        @media (max-width: 768px) {
          .app-detail-banner { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .app-banner-actions { align-items: flex-start; }
        }
      `}</style>
    </div>
  );
};
