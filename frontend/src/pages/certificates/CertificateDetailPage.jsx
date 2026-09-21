import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Award,
  Download,
  Printer,
  ArrowLeft,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  User,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { certificateService } from '../../services/certificateService';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const CertificateDetailPage = () => {
  const { id } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        setLoading(true);
        const res = await certificateService.getCertificateById(id);
        if (res.success) {
          setCertificate(res.certificate);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCertificate();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <LoadingSkeleton rows={10} />;
  if (!certificate) return <div className="p-4 text-center">Certificate not found.</div>;

  return (
    <div className="certificate-detail-page">
      <div className="cert-actions-bar no-print mb-4">
        <Link to="/certificates" className="back-link">
          <ArrowLeft size={16} /> Back to Certificates
        </Link>
        <div className="cert-top-btns">
          <button onClick={handlePrint} className="btn btn-secondary btn-sm">
            <Printer size={15} /> Print Document
          </button>
          <a
            href={certificateService.downloadPDFUrl(certificate._id)}
            download
            className="btn btn-primary btn-sm"
          >
            <Download size={15} /> Download PDF
          </a>
        </div>
      </div>

      {/* Visual Digital Certificate Document */}
      <div className="cert-document-frame">
        <div className="cert-document-inner">
          {/* Certificate Header Banner */}
          <div className="cert-doc-header">
            <div className="cert-brand-seal">
              <Scale size={36} />
            </div>
            <div className="cert-header-titles">
              <h1 className="cert-main-title">METRYA</h1>
              <h2 className="cert-sub-title">LEGAL METROLOGY VERIFICATION CERTIFICATE</h2>
              <p className="cert-legal-ref">
                Issued in accordance with Legal Metrology Verification and Model Standards
              </p>
            </div>
          </div>

          {/* Certificate ID & Status Ribbon */}
          <div className="cert-meta-ribbon">
            <div className="meta-block">
              <span className="meta-lbl">CERTIFICATE NO:</span>
              <span className="meta-val font-mono">{certificate.certificateNumber}</span>
            </div>
            <div className="meta-block">
              <span className="meta-lbl">APPLICATION REF:</span>
              <span className="meta-val">{certificate.application?.applicationNumber || 'N/A'}</span>
            </div>
            <div className="meta-block status-box">
              <span className="cert-status-badge">STATUS: VERIFIED & COMPLIANT</span>
            </div>
          </div>

          {/* Section 1: Owner Details */}
          <div className="cert-doc-section">
            <h3 className="cert-section-heading">1. INSTRUMENT OWNER / COMMERCIAL ENTERPRISE</h3>
            <div className="cert-grid-2">
              <div>
                <strong>Name / Entity:</strong> {certificate.owner?.name}
              </div>
              <div>
                <strong>Organization:</strong> {certificate.owner?.organization || 'N/A'}
              </div>
              <div className="span-2">
                <strong>Installation Site:</strong> {certificate.instrumentSnapshot?.location?.facilityName || 'Main Facility'}, {certificate.instrumentSnapshot?.location?.address || ''} {certificate.instrumentSnapshot?.location?.city || ''}
              </div>
            </div>
          </div>

          {/* Section 2: Instrument Specs */}
          <div className="cert-doc-section">
            <h3 className="cert-section-heading">2. VERIFIED INSTRUMENT SPECIFICATIONS</h3>
            <div className="cert-grid-4">
              <div className="cert-prop">
                <span className="prop-lbl">Instrument ID:</span>
                <span className="prop-val font-mono">{certificate.instrumentSnapshot?.instrumentId}</span>
              </div>
              <div className="cert-prop">
                <span className="prop-lbl">Category:</span>
                <span className="prop-val">{certificate.instrumentSnapshot?.categoryName}</span>
              </div>
              <div className="cert-prop">
                <span className="prop-lbl">Type:</span>
                <span className="prop-val font-bold">{certificate.instrumentSnapshot?.instrumentType}</span>
              </div>
              <div className="cert-prop">
                <span className="prop-lbl">Manufacturer:</span>
                <span className="prop-val">{certificate.instrumentSnapshot?.manufacturer}</span>
              </div>
              <div className="cert-prop">
                <span className="prop-lbl">Model:</span>
                <span className="prop-val">{certificate.instrumentSnapshot?.model}</span>
              </div>
              <div className="cert-prop">
                <span className="prop-lbl">Serial Number:</span>
                <span className="prop-val font-mono font-bold">{certificate.instrumentSnapshot?.serialNumber}</span>
              </div>
              <div className="cert-prop">
                <span className="prop-lbl">Rated Capacity:</span>
                <span className="prop-val font-bold">{certificate.instrumentSnapshot?.capacity} {certificate.instrumentSnapshot?.unit}</span>
              </div>
              <div className="cert-prop">
                <span className="prop-lbl">Accuracy Class:</span>
                <span className="prop-val font-bold">{certificate.instrumentSnapshot?.accuracyClass}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Verification Findings & Validity */}
          <div className="cert-doc-section">
            <h3 className="cert-section-heading">3. METROLOGICAL VERIFICATION FINDINGS</h3>
            <div className="cert-findings-box">
              <div className="finding-row">
                <span>Verification Date: <strong>{new Date(certificate.verificationDate).toLocaleDateString()}</strong></span>
                <span>Verification Seal No: <strong className="font-mono">{certificate.verificationSummary?.sealNumber || 'LM-SEAL-VERIFIED'}</strong></span>
              </div>
              <div className="finding-row mt-2">
                <span>Validity Period: <strong className="text-emerald-700">{new Date(certificate.validFrom).toLocaleDateString()} TO {new Date(certificate.validUntil).toLocaleDateString()}</strong></span>
                <span>Stamping Mark: <strong>{certificate.verificationSummary?.stampingQuarter} - {certificate.verificationSummary?.stampingYear}</strong></span>
              </div>
            </div>
          </div>

          {/* Section 4: QR & Authentication Block */}
          <div className="cert-doc-section">
            <h3 className="cert-section-heading">4. DIGITAL AUTHENTICATION & PUBLIC QR REGISTRY</h3>
            <div className="cert-qr-auth-grid">
              <div className="qr-image-wrapper">
                {certificate.qrCodeDataUrl ? (
                  <img
                    src={certificate.qrCodeDataUrl}
                    alt={`QR Code for ${certificate.certificateNumber}`}
                    className="cert-actual-qr"
                  />
                ) : (
                  <QrCode size={100} />
                )}
              </div>
              <div className="qr-auth-text">
                <h4>Scan to Verify Authenticity Online</h4>
                <p>
                  This digital compliance certificate is registered on the Metrya Legal Metrology network.
                  Anyone can verify its authenticity, stamping validity, and instrument serial match in real-time.
                </p>
                <div className="qr-url-box font-mono">
                  {certificate.qrVerificationUrl || `http://localhost:5173/verify/${certificate.certificateNumber}`}
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Signatures / Endorsements */}
          <div className="cert-signatures-grid">
            <div className="signature-box">
              <div className="sig-header">VERIFYING LMO OFFICER</div>
              <div className="sig-body">
                <div><strong>Officer:</strong> {certificate.officer?.name || 'Authorized Officer'}</div>
                <div><strong>Badge No:</strong> {certificate.officer?.officerBadgeNumber || 'LMO-OFFICER'}</div>
                <div><strong>Jurisdiction:</strong> {certificate.officer?.jurisdiction || 'Regional Office'}</div>
                <div className="sig-stamp">[ Digitally Signed & Stamped ]</div>
              </div>
            </div>

            <div className="signature-box">
              <div className="sig-header">GATC / TESTING LABORATORY</div>
              <div className="sig-body">
                <div><strong>Centre:</strong> {certificate.gatc?.gatcCentreName || certificate.gatc?.name || 'Govt Approved Test Centre'}</div>
                <div><strong>Issue Date:</strong> {new Date(certificate.issueDate).toLocaleDateString()}</div>
                <div><strong>Registry Ref:</strong> {certificate.certificateNumber}</div>
                <div className="sig-stamp">[ Verified Standards Compliance ]</div>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="cert-doc-footer">
            Metrya Legal Metrology Digital Verification System Prototype • Complies with Weights & Measures Stamping Protocol
          </div>
        </div>
      </div>

      <style>{`
        .cert-actions-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 860px;
          margin: 0 auto 1.5rem;
        }
        .cert-top-btns {
          display: flex;
          gap: 0.75rem;
        }
        .cert-document-frame {
          max-width: 860px;
          margin: 0 auto;
          background: #ffffff;
          border: 3px double #1e3a8a;
          border-radius: var(--radius-lg);
          padding: 12px;
          box-shadow: var(--shadow-xl);
        }
        .cert-document-inner {
          border: 1px solid #cbd5e1;
          border-radius: var(--radius-md);
          padding: 2.5rem;
          background: #ffffff;
        }
        .cert-doc-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          text-align: center;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #1e3a8a;
          margin-bottom: 1.5rem;
        }
        .cert-brand-seal {
          background: #1e3a8a;
          color: #ffffff;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(30, 58, 138, 0.3);
        }
        .cert-main-title {
          font-family: var(--font-heading);
          font-size: 2.25rem;
          font-weight: 800;
          color: #1e3a8a;
          letter-spacing: 0.08em;
          line-height: 1;
        }
        .cert-sub-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--slate-900);
          letter-spacing: 0.04em;
          margin-top: 0.35rem;
        }
        .cert-legal-ref {
          font-size: 0.775rem;
          color: var(--slate-500);
          margin-top: 0.25rem;
        }
        .cert-meta-ribbon {
          display: grid;
          grid-template-columns: 1fr 1fr 1.2fr;
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.85rem 1.25rem;
          margin-bottom: 1.75rem;
          align-items: center;
        }
        .meta-lbl {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--slate-500);
          display: block;
        }
        .meta-val {
          font-size: 0.95rem;
          font-weight: 800;
          color: #1e3a8a;
        }
        .cert-status-badge {
          background: #10b981;
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 800;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          display: inline-block;
          letter-spacing: 0.03em;
        }
        .cert-doc-section {
          margin-bottom: 1.5rem;
        }
        .cert-section-heading {
          font-size: 0.85rem;
          font-weight: 800;
          color: #1e3a8a;
          letter-spacing: 0.04em;
          padding-bottom: 0.4rem;
          border-bottom: 1px solid #cbd5e1;
          margin-bottom: 0.85rem;
        }
        .cert-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          font-size: 0.85rem;
          color: var(--slate-800);
        }
        .span-2 { grid-column: span 2; }
        .cert-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.85rem;
        }
        .cert-prop {
          display: flex;
          flex-direction: column;
        }
        .prop-lbl {
          font-size: 0.725rem;
          color: var(--slate-500);
          font-weight: 600;
        }
        .prop-val {
          font-size: 0.85rem;
          color: var(--slate-900);
        }
        .cert-findings-box {
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
          font-size: 0.85rem;
        }
        .finding-row {
          display: flex;
          justify-content: space-between;
        }
        .cert-qr-auth-grid {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
        }
        .cert-actual-qr {
          width: 100px;
          height: 100px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
        }
        .qr-auth-text h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 0.25rem;
        }
        .qr-auth-text p {
          font-size: 0.785rem;
          color: var(--slate-600);
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }
        .qr-url-box {
          font-size: 0.75rem;
          color: var(--primary-700);
          word-break: break-all;
        }
        .cert-signatures-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-top: 2rem;
          margin-bottom: 1.5rem;
        }
        .signature-box {
          border: 1px solid #cbd5e1;
          border-radius: var(--radius-md);
          padding: 1rem;
          background: #ffffff;
        }
        .sig-header {
          font-size: 0.75rem;
          font-weight: 800;
          color: #1e3a8a;
          letter-spacing: 0.04em;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.4rem;
          margin-bottom: 0.65rem;
        }
        .sig-body {
          font-size: 0.8rem;
          color: var(--slate-700);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .sig-stamp {
          margin-top: 0.5rem;
          color: #10b981;
          font-weight: 700;
          font-size: 0.75rem;
        }
        .cert-doc-footer {
          text-align: center;
          font-size: 0.725rem;
          color: var(--slate-400);
          padding-top: 1rem;
          border-top: 1px solid #cbd5e1;
        }
        @media (max-width: 768px) {
          .cert-grid-4 { grid-template-columns: 1fr 1fr; }
          .cert-meta-ribbon { grid-template-columns: 1fr; gap: 0.5rem; }
          .cert-signatures-grid { grid-template-columns: 1fr; }
          .cert-qr-auth-grid { flex-direction: column; text-align: center; }
        }
        @media print {
          .no-print { display: none !important; }
          .certificate-detail-page { padding: 0; background: #ffffff; }
          .cert-document-frame { box-shadow: none; max-width: 100%; border: 2px solid #000; }
        }
      `}</style>
    </div>
  );
};
