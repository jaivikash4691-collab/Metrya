import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Scale, ShieldCheck, FileCheck, Award, ExternalLink } from 'lucide-react';

export const PublicLayout = () => {
  return (
    <div className="public-layout">
      <Navbar />
      <main className="public-main-content">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="footer-container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-col brand-col">
              <div className="footer-brand">
                <div className="footer-logo-icon">
                  <Scale size={20} />
                </div>
                <span className="footer-brand-title">METRYA</span>
              </div>
              <p className="footer-desc">
                Smart Legal Metrology Verification & Digital Certification Platform.
                Modernizing compliance standards for weighing and measuring instruments.
              </p>
              <div className="footer-badge">
                <ShieldCheck size={14} /> SIH Prototype & Demo System
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-col">
              <h5 className="footer-heading">Verification Services</h5>
              <ul className="footer-links">
                <li><Link to="/verify">Public Certificate Verification</Link></li>
                <li><Link to="/register">Register New Instrument</Link></li>
                <li><Link to="/login">Officer Portal Access</Link></li>
                <li><Link to="/login">GATC Testing Centre</Link></li>
              </ul>
            </div>

            {/* Compliance Standards */}
            <div className="footer-col">
              <h5 className="footer-heading">Legal Standards</h5>
              <ul className="footer-links">
                <li><span>OIML R 76 Non-Automatic Scales</span></li>
                <li><span>OIML R 117 Fuel Flow Meters</span></li>
                <li><span>Class I to Class IIII Tolerances</span></li>
                <li><span>Electronic Stamping & Sealing</span></li>
              </ul>
            </div>

            {/* Demo Quick Access */}
            <div className="footer-col">
              <h5 className="footer-heading">Demo Credentials</h5>
              <div className="footer-demo-creds">
                <div><strong>Admin:</strong> <code>admin@demo.com</code></div>
                <div><strong>LMO:</strong> <code>lmo@demo.com</code></div>
                <div><strong>GATC:</strong> <code>gatc@demo.com</code></div>
                <div><strong>Owner:</strong> <code>user@demo.com</code></div>
                <div className="footer-pass-hint">Password: <code>Password123!</code></div>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} Metrya Platform. Built for Smart India Hackathon legal metrology prototype presentation.</p>
            <div className="footer-disclaimer">
              Notice: Metrya is a software prototype designed to demonstrate digital verification workflows. It does not issue binding government certifications.
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .public-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .public-main-content {
          flex: 1;
        }
        .public-footer {
          background-color: #0c1527;
          color: #94a3b8;
          border-top: 1px solid #1e293b;
          padding: 4rem 1.5rem 2rem;
          margin-top: auto;
        }
        .footer-container {
          max-width: 1380px;
          margin: 0 auto;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 1rem;
        }
        .footer-logo-icon {
          background: #2563eb;
          color: #ffffff;
          padding: 0.4rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .footer-brand-title {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.04em;
        }
        .footer-desc {
          font-size: 0.875rem;
          line-height: 1.55;
          margin-bottom: 1rem;
          color: #94a3b8;
        }
        .footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(37, 99, 235, 0.15);
          color: #60a5fa;
          border: 1px solid rgba(37, 99, 235, 0.3);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }
        .footer-heading {
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          letter-spacing: 0.02em;
        }
        .footer-links {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .footer-links a, .footer-links span {
          color: #94a3b8;
          font-size: 0.85rem;
          text-decoration: none;
          transition: var(--transition);
        }
        .footer-links a:hover {
          color: #60a5fa;
        }
        .footer-demo-creds {
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid #1e293b;
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          font-size: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          color: #cbd5e1;
        }
        .footer-demo-creds code {
          background: #0f172a;
          padding: 0.1rem 0.35rem;
          border-radius: 4px;
          color: #38bdf8;
          font-family: var(--font-mono);
          font-size: 0.75rem;
        }
        .footer-pass-hint {
          margin-top: 0.35rem;
          padding-top: 0.35rem;
          border-top: 1px dashed #334155;
          color: #94a3b8;
        }
        .footer-bottom {
          padding-top: 2rem;
          border-top: 1px solid #1e293b;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.775rem;
          color: #64748b;
        }
        .footer-disclaimer {
          color: #475569;
          font-style: italic;
        }
        @media (max-width: 992px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
