import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Search,
  Filter,
  Download,
  Eye,
  QrCode,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { certificateService } from '../../services/certificateService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Modal } from '../../components/common/Modal';

export const CertificateListPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expiringDays, setExpiringDays] = useState('');
  const [selectedQR, setSelectedQR] = useState(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await certificateService.getCertificates({
        search: search || undefined,
        status: statusFilter || undefined,
        expiringWithinDays: expiringDays || undefined
      });
      if (res.success) {
        setCertificates(res.certificates || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCertificates();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, statusFilter, expiringDays]);

  return (
    <div className="certificate-list-page">
      <div className="section-header">
        <div>
          <h1 className="page-title">Digital Verification Certificates</h1>
          <p className="page-subtitle">
            Authenticated Legal Metrology digital compliance certificates & tamper-evident QR registries
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card filter-card mb-4">
        <div className="filter-grid-cert">
          <div className="search-input-group">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by Certificate Number, Serial No, or Instrument ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control with-icon"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setExpiringDays('');
            }}
            className="form-control"
          >
            <option value="">All Statuses</option>
            <option value="VALID">Valid & Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="REVOKED">Revoked</option>
          </select>

          <select
            value={expiringDays}
            onChange={(e) => {
              setExpiringDays(e.target.value);
              setStatusFilter('');
            }}
            className="form-control"
          >
            <option value="">All Expiry Windows</option>
            <option value="30">Expiring in 30 Days</option>
            <option value="15">Expiring in 15 Days</option>
            <option value="7">Expiring in 7 Days (Critical)</option>
          </select>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={6} />
        ) : certificates.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No digital certificates found"
            description="No certificates match your selected criteria."
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Certificate Number</th>
                  <th>Instrument Details</th>
                  <th>Owner / Enterprise</th>
                  <th>Valid From</th>
                  <th>Valid Until</th>
                  <th>Seal Number</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span className="code-badge font-bold">{c.certificateNumber}</span>
                    </td>
                    <td>
                      <div className="font-bold text-slate-900">{c.instrumentSnapshot?.instrumentType}</div>
                      <div className="text-xs text-muted">
                        SN: <span className="code-font">{c.instrumentSnapshot?.serialNumber}</span> • {c.instrumentSnapshot?.capacity} {c.instrumentSnapshot?.unit}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">{c.owner?.organization || c.owner?.name}</div>
                    </td>
                    <td>{new Date(c.validFrom).toLocaleDateString()}</td>
                    <td>
                      <span className={`font-semibold ${new Date(c.validUntil) < new Date() ? 'text-danger' : 'text-slate-900'}`}>
                        {new Date(c.validUntil).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span className="code-font text-xs">{c.verificationSummary?.sealNumber || 'LM-SEAL'}</span>
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>
                      <div className="table-action-btns">
                        <Link to={`/certificates/${c._id}`} className="btn btn-secondary btn-sm" title="View Certificate Document">
                          <Eye size={14} /> View
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedQR(c)}
                          className="btn btn-secondary btn-sm"
                          title="Show Public QR Code"
                        >
                          <QrCode size={14} /> QR
                        </button>
                        <a
                          href={certificateService.downloadPDFUrl(c._id)}
                          download
                          className="btn btn-outline-primary btn-sm"
                          title="Download PDF"
                        >
                          <Download size={14} /> PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code Inspection Modal */}
      {selectedQR && (
        <Modal
          isOpen={!!selectedQR}
          onClose={() => setSelectedQR(null)}
          title={`Public Verification QR — ${selectedQR.certificateNumber}`}
          subtitle="Scan with any smartphone camera to verify authenticity online"
          size="sm"
          footer={
            <Link
              to={`/verify/${selectedQR.certificateNumber}`}
              target="_blank"
              className="btn btn-primary btn-block"
            >
              Open Public Verification Page
            </Link>
          }
        >
          <div className="qr-modal-content">
            {selectedQR.qrCodeDataUrl && (
              <img
                src={selectedQR.qrCodeDataUrl}
                alt={`QR code for ${selectedQR.certificateNumber}`}
                className="qr-modal-image"
              />
            )}
            <div className="qr-modal-cert-num">{selectedQR.certificateNumber}</div>
            <p className="qr-modal-hint">
              Instrument: <strong>{selectedQR.instrumentSnapshot?.instrumentType}</strong>
            </p>
          </div>
        </Modal>
      )}

      <style>{`
        .filter-grid-cert {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1rem;
        }
        .table-action-btns {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .qr-modal-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 1rem 0;
        }
        .qr-modal-image {
          width: 220px;
          height: 220px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
          margin-bottom: 1rem;
        }
        .qr-modal-cert-num {
          font-family: var(--font-mono);
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--primary-700);
        }
        .qr-modal-hint {
          font-size: 0.85rem;
          color: var(--slate-600);
          margin-top: 0.25rem;
        }
        @media (max-width: 768px) {
          .filter-grid-cert { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
