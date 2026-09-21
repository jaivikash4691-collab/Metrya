import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Search,
  CheckCircle2,
  Calendar,
  Scale,
  Building,
  Award,
  Printer,
  QrCode,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { publicService } from '../../services/publicService';

export const PublicVerifyPage = () => {
  const { identifier } = useParams();
  const [searchInput, setSearchInput] = useState(identifier || '');
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (identifier) {
      fetchVerification(identifier);
    }
  }, [identifier]);

  const fetchVerification = async (queryId) => {
    try {
      setLoading(true);
      setError('');
      setVerificationData(null);
      const res = await publicService.verifyCertificate(queryId);
      if (res.success) {
        setVerificationData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Verification record not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/verify/${searchInput.trim()}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VALID':
        return (
          <div className="status-banner status-valid">
            <CheckCircle2 size={24} />
            <div>
              <div className="status-title">LEGALLY VERIFIED & ACTIVE</div>
              <div className="status-sub">This certificate is genuine and registered in the Metrya compliance registry.</div>
            </div>
          </div>
        );
      case 'EXPIRED':
        return (
          <div className="status-banner status-expired">
            <Clock size={24} />
            <div>
              <div className="status-title">CERTIFICATE EXPIRED</div>
              <div className="status-sub">This verification period has elapsed. Re-verification by an authorized officer is required.</div>
            </div>
          </div>
        );
      case 'REVOKED':
        return (
          <div className="status-banner status-revoked">
            <ShieldAlert size={24} />
            <div>
              <div className="status-title">CERTIFICATE REVOKED</div>
              <div className="status-sub">This certificate has been revoked by Legal Metrology authorities and is no longer valid.</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="public-verify-page">
      <div className="verify-container">
        {/* Header Navigation */}
        <div className="verify-header no-print">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} /> Back to Metrya Home
          </Link>
          <div className="verify-tag">
            <ShieldCheck size={16} /> Public Verification Portal
          </div>
        </div>

        {/* Verification Search Bar */}
        <div className="search-box-card no-print">
          <h2 className="search-card-title">Certificate & Instrument Authenticity Verification</h2>
          <p className="search-card-desc">
            Verify official legal metrology verification certificates, verify stamping dates, and ensure compliance.
          </p>

          <form onSubmit={handleSearchSubmit} className="verify-form">
            <div className="input-group">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Enter Certificate Number (e.g. MET-CERT-2026-000101)..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="verify-input"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Validating...' : 'Validate Status'}
            </button>
          </form>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="loading-card">
            <div className="spinner" />
            <p>Querying verified metrology registry...</p>
          </div>
        )}

        {/* Error / Not Found Message */}
        {error && (
          <div className="error-card">
            <AlertTriangle size={36} className="error-icon" />
            <h3>Verification Record Not Found</h3>
            <p>{error}</p>
            <div className="error-help">
              Please double check the certificate number, ensure formatting (e.g. <code>MET-CERT-2026-000101</code>), or contact the issuing Legal Metrology office.
            </div>
          </div>
        )}

        {/* Validated Certificate Card Display */}
        {verificationData && (
          <div className="certificate-public-card">
            {/* Status Banner */}
            {getStatusBadge(verificationData.status)}

            {/* Action Toolbar */}
            <div className="cert-toolbar no-print">
              <div className="cert-identity">
                <span className="cert-code-label">CERTIFICATE ID:</span>
                <span className="cert-code">{verificationData.certificateNumber}</span>
              </div>
              <button onClick={handlePrint} className="btn btn-secondary btn-sm">
                <Printer size={16} /> Print Verification Slip
              </button>
            </div>

            {/* Certificate Details Grid */}
            <div className="cert-details-grid">
              {/* Instrument Information */}
              <div className="detail-section">
                <h4 className="detail-heading">
                  <Scale size={18} /> Instrument Specifications
                </h4>
                <div className="detail-table">
                  <div className="detail-row">
                    <span className="detail-label">Instrument ID</span>
                    <span className="detail-value">{verificationData.instrument?.instrumentId || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Category</span>
                    <span className="detail-value">{verificationData.instrument?.category}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Instrument Type</span>
                    <span className="detail-value font-bold">{verificationData.instrument?.instrumentType}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Manufacturer & Model</span>
                    <span className="detail-value">{verificationData.instrument?.manufacturer} - {verificationData.instrument?.model}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Serial Number</span>
                    <span className="detail-value code-font">{verificationData.instrument?.serialNumber}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Capacity & Unit</span>
                    <span className="detail-value">{verificationData.instrument?.capacity} {verificationData.instrument?.unit}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Accuracy Class</span>
                    <span className="detail-value">{verificationData.instrument?.accuracyClass}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Registered Location</span>
                    <span className="detail-value">{verificationData.instrument?.city}, {verificationData.instrument?.state}</span>
                  </div>
                </div>
              </div>

              {/* Validity & Stamping Authority */}
              <div className="detail-section">
                <h4 className="detail-heading">
                  <Calendar size={18} /> Validity & Verification Period
                </h4>
                <div className="detail-table">
                  <div className="detail-row">
                    <span className="detail-label">Verification Date</span>
                    <span className="detail-value">{new Date(verificationData.verificationDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Valid From</span>
                    <span className="detail-value">{new Date(verificationData.validFrom).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Valid Until</span>
                    <span className="detail-value text-primary font-bold">{new Date(verificationData.validUntil).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Days Remaining</span>
                    <span className="detail-value">
                      {verificationData.isValid ? (
                        <span className="text-success font-bold">{verificationData.daysRemaining} Days</span>
                      ) : (
                        <span className="text-danger font-bold">0 Days (Expired)</span>
                      )}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Verification Seal No</span>
                    <span className="detail-value code-font">{verificationData.verificationSeal?.sealNumber || 'LM-SEAL-VERIFIED'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Stamping Quarter/Year</span>
                    <span className="detail-value">{verificationData.verificationSeal?.stampingQuarter} - {verificationData.verificationSeal?.stampingYear}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Verifying Officer Badge</span>
                    <span className="detail-value">{verificationData.authority?.officerBadge || 'LMO-OFFICER'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Jurisdiction / Centre</span>
                    <span className="detail-value">{verificationData.authority?.verificationCentre || verificationData.authority?.jurisdiction}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Public Trust Notice */}
            <div className="cert-footer-notice">
              <ShieldCheck size={18} className="text-primary-600" />
              <span>
                Public Compliance Notice: This verification record is cryptographically registered under the Legal Metrology Digital Standards Verification protocol.
              </span>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .public-verify-page {
          background-color: var(--slate-50);
          min-height: calc(100vh - 200px);
          padding: 2.5rem 1.5rem 5rem;
        }
        .verify-container {
          max-width: 960px;
          margin: 0 auto;
        }
        .verify-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.875rem;
          color: var(--slate-600);
          text-decoration: none;
          font-weight: 500;
        }
        .back-link:hover { color: var(--primary-600); }
        .verify-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary-700);
          background: var(--primary-50);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
        }
        .search-box-card {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow-sm);
        }
        .search-card-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 0.35rem;
        }
        .search-card-desc {
          font-size: 0.875rem;
          color: var(--slate-600);
          margin-bottom: 1.5rem;
        }
        .verify-form {
          display: flex;
          gap: 0.75rem;
        }
        .input-group {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--slate-400);
        }
        .verify-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          font-size: 0.95rem;
          border: 1px solid var(--slate-300);
          border-radius: var(--radius-md);
        }
        .verify-input:focus {
          outline: none;
          border-color: var(--primary-600);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .loading-card {
          padding: 3rem;
          text-align: center;
          background: #ffffff;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }
        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid var(--slate-200);
          border-top-color: var(--primary-600);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .error-card {
          background: #ffffff;
          border: 1px solid var(--slate-300);
          border-radius: var(--radius-lg);
          padding: 2.5rem;
          text-align: center;
          margin-bottom: 2rem;
        }
        .error-icon {
          color: var(--danger-primary);
          margin-bottom: 0.75rem;
        }
        .error-card h3 {
          font-size: 1.25rem;
          color: var(--slate-900);
          margin-bottom: 0.5rem;
        }
        .error-card p {
          color: var(--slate-600);
          font-size: 0.9rem;
          margin-bottom: 1.25rem;
        }
        .error-help {
          font-size: 0.8rem;
          color: var(--slate-500);
          background: var(--slate-50);
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          max-width: 500px;
          margin: 0 auto;
        }
        .error-help code {
          background: var(--slate-200);
          padding: 0.1rem 0.3rem;
          border-radius: 3px;
          font-family: var(--font-mono);
        }
        .certificate-public-card {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          overflow: hidden;
        }
        .status-banner {
          padding: 1.25rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .status-valid {
          background: linear-gradient(135deg, #059669, #047857);
          color: #ffffff;
        }
        .status-expired {
          background: linear-gradient(135deg, #d97706, #b45309);
          color: #ffffff;
        }
        .status-revoked {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: #ffffff;
        }
        .status-title {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: 0.02em;
        }
        .status-sub {
          font-size: 0.825rem;
          opacity: 0.9;
        }
        .cert-toolbar {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--slate-50);
        }
        .cert-identity {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .cert-code-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--slate-500);
        }
        .cert-code {
          font-family: var(--font-mono);
          font-weight: 800;
          font-size: 1rem;
          color: var(--primary-700);
        }
        .cert-details-grid {
          padding: 1.5rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .detail-heading {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--slate-900);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-subtle);
          margin-bottom: 1rem;
        }
        .detail-table {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          padding-bottom: 0.45rem;
          border-bottom: 1px dashed var(--slate-100);
        }
        .detail-label {
          color: var(--slate-500);
          font-weight: 500;
        }
        .detail-value {
          color: var(--slate-900);
          font-weight: 600;
          text-align: right;
        }
        .font-bold { font-weight: 700; }
        .code-font { font-family: var(--font-mono); font-size: 0.8rem; }
        .text-success { color: #15803d; }
        .text-danger { color: #dc2626; }
        .text-primary { color: var(--primary-600); }
        .cert-footer-notice {
          padding: 1rem 1.5rem;
          background: var(--slate-50);
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
          color: var(--slate-600);
        }
        @media (max-width: 768px) {
          .cert-details-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .verify-form { flex-direction: column; }
          .cert-toolbar { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
        }
        @media print {
          .no-print { display: none !important; }
          .public-verify-page { padding: 0; background: #ffffff; }
          .certificate-public-card { border: 1px solid #000; box-shadow: none; }
        }
      `}</style>
    </div>
  );
};
