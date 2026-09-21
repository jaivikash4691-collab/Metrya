import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  Calendar,
  MapPin,
  Award,
  FileCheck2,
  ArrowLeft,
  QrCode,
  ShieldCheck,
  Building,
  User,
  ExternalLink,
  History
} from 'lucide-react';
import { instrumentService } from '../../services/instrumentService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const InstrumentDetailPage = () => {
  const { id } = useParams();
  const [instrument, setInstrument] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInstrument = async () => {
      try {
        setLoading(true);
        const res = await instrumentService.getInstrumentById(id);
        if (res.success) {
          setInstrument(res.instrument);
          setHistory(res.verificationHistory || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadInstrument();
  }, [id]);

  if (loading) return <LoadingSkeleton rows={8} />;
  if (!instrument) return <div className="p-4 text-center">Instrument not found.</div>;

  return (
    <div className="instrument-detail-page">
      <div className="mb-3">
        <Link to="/instruments" className="back-link">
          <ArrowLeft size={16} /> Back to Instruments Registry
        </Link>
      </div>

      {/* Header Banner */}
      <div className="card inst-detail-banner mb-4">
        <div className="inst-banner-main">
          <div className="inst-icon-lg">
            <Scale size={32} />
          </div>
          <div>
            <div className="inst-id-tag">{instrument.instrumentId}</div>
            <h1 className="page-title">{instrument.instrumentType}</h1>
            <p className="inst-sub">
              {instrument.manufacturer} • Model: <strong>{instrument.model}</strong> • Serial: <span className="code-font">{instrument.serialNumber}</span>
            </p>
          </div>
        </div>

        <div className="inst-banner-right">
          <StatusBadge status={instrument.status} />
          <Link
            to={`/applications?new=true&instId=${instrument._id}`}
            className="btn btn-primary btn-sm mt-2"
          >
            <FileCheck2 size={15} /> Apply for Verification
          </Link>
        </div>
      </div>

      {/* Technical Specifications Grid */}
      <div className="grid-2 mb-4">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Technical Specifications</h3>
          </div>
          <div className="spec-table">
            <div className="spec-row">
              <span className="spec-lbl">Category</span>
              <span className="spec-val">{instrument.category?.name}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Rated Capacity</span>
              <span className="spec-val font-bold">{instrument.capacity} {instrument.unit}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Accuracy Class</span>
              <span className="spec-val"><span className="badge badge-info">{instrument.accuracyClass}</span></span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Verification Frequency</span>
              <span className="spec-val">{instrument.verificationFrequencyMonths} Months (Annual)</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Last Verification Date</span>
              <span className="spec-val">
                {instrument.lastVerificationDate ? new Date(instrument.lastVerificationDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Next Stamping Due</span>
              <span className="spec-val text-primary font-bold">
                {instrument.nextVerificationDate ? new Date(instrument.nextVerificationDate).toLocaleDateString() : 'Pending Stamping'}
              </span>
            </div>
          </div>
        </div>

        {/* Location & Enterprise */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Installation Facility & Owner</h3>
          </div>
          <div className="spec-table">
            <div className="spec-row">
              <span className="spec-lbl">Owner Name</span>
              <span className="spec-val font-medium">{instrument.owner?.name}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Organization</span>
              <span className="spec-val">{instrument.owner?.organization || 'N/A'}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Facility / Bay</span>
              <span className="spec-val">{instrument.location?.facilityName || 'Main Facility'}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">Location Address</span>
              <span className="spec-val">{instrument.location?.address || 'N/A'}</span>
            </div>
            <div className="spec-row">
              <span className="spec-lbl">City & State</span>
              <span className="spec-val">{instrument.location?.city}, {instrument.location?.state} - {instrument.location?.pincode}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Applications History */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Verification & Stamping History</h3>
        </div>

        {history.length === 0 ? (
          <div className="p-4 text-center text-muted text-sm">No past verification applications recorded.</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application Number</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Assigned Officer</th>
                  <th>Certificate Ref</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id}>
                    <td><span className="code-badge">{h.applicationNumber}</span></td>
                    <td>{new Date(h.submissionDate).toLocaleDateString()}</td>
                    <td><StatusBadge status={h.status} /></td>
                    <td>{h.assignedOfficer?.name || 'Unassigned'}</td>
                    <td>
                      {h.certificate ? (
                        <span className="code-font text-emerald-600 font-bold">
                          {h.certificate.certificateNumber || 'MET-CERT-ACTIVE'}
                        </span>
                      ) : (
                        <span className="text-muted text-xs">None</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/applications/${h._id}`} className="btn btn-secondary btn-sm">
                        View Application
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .inst-detail-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.75rem 2rem;
        }
        .inst-banner-main {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .inst-icon-lg {
          background: var(--primary-50);
          color: var(--primary-600);
          padding: 1rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--primary-100);
        }
        .inst-id-tag {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary-700);
          letter-spacing: 0.05em;
        }
        .inst-sub {
          font-size: 0.9rem;
          color: var(--slate-600);
          margin-top: 0.25rem;
        }
        .spec-table {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .spec-row {
          display: flex;
          justify-content: space-between;
          padding-bottom: 0.5rem;
          border-bottom: 1px dashed var(--slate-200);
          font-size: 0.875rem;
        }
        .spec-lbl {
          color: var(--slate-500);
          font-weight: 500;
        }
        .spec-val {
          color: var(--slate-900);
          text-align: right;
        }
        @media (max-width: 768px) {
          .inst-detail-banner { flex-direction: column; align-items: flex-start; gap: 1rem; }
        }
      `}</style>
    </div>
  );
};
