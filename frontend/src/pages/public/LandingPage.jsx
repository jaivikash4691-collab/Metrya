import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  ShieldCheck,
  Search,
  CheckCircle2,
  Calendar,
  ClipboardCheck,
  Award,
  QrCode,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Lock,
  UserCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const [certInput, setCertInput] = useState('');
  const [demoLoginLoading, setDemoLoginLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    if (certInput.trim()) {
      navigate(`/verify/${certInput.trim()}`);
    }
  };

  const handleQuickDemoLogin = async (email, password) => {
    try {
      setDemoLoginLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setDemoLoginLoading(false);
    }
  };

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="hero-container">
          <div className="hero-badge">
            <Sparkles size={14} className="text-amber-400" />
            <span>Digital Legal Metrology Framework</span>
          </div>

          <h1 className="hero-title">
            Smart Legal Metrology Verification & <span className="highlight-text">Digital Certification</span>
          </h1>

          <p className="hero-subtitle">
            A unified digital platform for weighing and measuring instrument registration,
            precision inspection, digital certification, and instant public QR validation.
          </p>

          {/* Quick Certificate Search in Hero */}
          <div className="hero-search-card">
            <form onSubmit={handleVerifySubmit} className="hero-search-form">
              <Search className="hero-search-icon" size={20} />
              <input
                type="text"
                placeholder="Enter Certificate No (e.g. MET-CERT-2026-000101) or Instrument ID..."
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                className="hero-search-input"
              />
              <button type="submit" className="hero-search-btn">
                <QrCode size={16} /> Validate Certificate
              </button>
            </form>

            <div className="hero-search-pills">
              <span className="pills-label">Quick Test Certificates:</span>
              <button
                type="button"
                className="test-cert-pill valid"
                onClick={() => setCertInput('MET-CERT-2026-000101')}
              >
                MET-CERT-2026-000101 (Valid Platform Scale)
              </button>
              <button
                type="button"
                className="test-cert-pill valid"
                onClick={() => setCertInput('MET-CERT-2026-000103')}
              >
                MET-CERT-2026-000103 (Valid Retail Scale)
              </button>
              <button
                type="button"
                className="test-cert-pill expired"
                onClick={() => setCertInput('MET-CERT-2025-000088')}
              >
                MET-CERT-2025-000088 (Expired Balance)
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Access Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Register Instrument <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Officer / Centre Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Quick 1-Click Demo Roles Launcher */}
      <section className="demo-launcher-section">
        <div className="section-container">
          <div className="demo-launcher-box">
            <div className="launcher-header">
              <div className="launcher-title-group">
                <UserCheck size={20} className="text-primary-600" />
                <h3>Explore Metrya with 1-Click Role Logins</h3>
              </div>
              <p className="launcher-subtitle">Test each actor workflow without typing credentials:</p>
            </div>

            <div className="role-cards-grid">
              <button
                onClick={() => handleQuickDemoLogin('user@demo.com', 'Password123!')}
                disabled={demoLoginLoading}
                className="role-launch-card user"
              >
                <div className="role-icon-box user">
                  <Scale size={22} />
                </div>
                <div className="role-launch-content">
                  <div className="role-name">Instrument Owner</div>
                  <div className="role-email">user@demo.com</div>
                  <div className="role-action">Apply & Track Instruments →</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickDemoLogin('lmo@demo.com', 'Password123!')}
                disabled={demoLoginLoading}
                className="role-launch-card lmo"
              >
                <div className="role-icon-box lmo">
                  <ClipboardCheck size={22} />
                </div>
                <div className="role-launch-content">
                  <div className="role-name">LMO Officer</div>
                  <div className="role-email">lmo@demo.com</div>
                  <div className="role-action">Conduct Digital Inspection →</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickDemoLogin('gatc@demo.com', 'Password123!')}
                disabled={demoLoginLoading}
                className="role-launch-card gatc"
              >
                <div className="role-icon-box gatc">
                  <Cpu size={22} />
                </div>
                <div className="role-launch-content">
                  <div className="role-name">GATC Testing Centre</div>
                  <div className="role-email">gatc@demo.com</div>
                  <div className="role-action">Verification Testing Bay →</div>
                </div>
              </button>

              <button
                onClick={() => handleQuickDemoLogin('admin@demo.com', 'Password123!')}
                disabled={demoLoginLoading}
                className="role-launch-card admin"
              >
                <div className="role-icon-box admin">
                  <ShieldCheck size={22} />
                </div>
                <div className="role-launch-content">
                  <div className="role-name">Super Admin</div>
                  <div className="role-email">admin@demo.com</div>
                  <div className="role-action">Analytics & Rules Engine →</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Lifecycle Pipeline */}
      <section className="workflow-section">
        <div className="section-container">
          <div className="section-title-wrap">
            <span className="section-kicker">END-TO-END WORKFLOW</span>
            <h2 className="section-heading">How Digital Verification Works in Metrya</h2>
            <p className="section-subtext">
              Eliminating paper bottlenecks through a controlled state machine from instrument registration to validity tracking.
            </p>
          </div>

          <div className="workflow-grid">
            <div className="workflow-card">
              <div className="workflow-step-num">01</div>
              <div className="workflow-icon-box">
                <Scale size={24} />
              </div>
              <h4 className="workflow-step-title">Instrument Registration</h4>
              <p className="workflow-step-desc">
                Owner uploads specifications, manufacturer details, model, serial number, and facility geolocation.
              </p>
            </div>

            <div className="workflow-card">
              <div className="workflow-step-num">02</div>
              <div className="workflow-icon-box">
                <Calendar size={24} />
              </div>
              <h4 className="workflow-step-title">Application & Scheduling</h4>
              <p className="workflow-step-desc">
                Submit verification request. Automated conflict prevention schedules an LMO Officer or GATC testing slot.
              </p>
            </div>

            <div className="workflow-card">
              <div className="workflow-step-num">03</div>
              <div className="workflow-icon-box">
                <ClipboardCheck size={24} />
              </div>
              <h4 className="workflow-step-title">Digital Inspection</h4>
              <p className="workflow-step-desc">
                Officer inputs live test measurements. Metrology calculation engine computes error tolerances and compliance in real-time.
              </p>
            </div>

            <div className="workflow-card">
              <div className="workflow-step-num">04</div>
              <div className="workflow-icon-box">
                <Award size={24} />
              </div>
              <h4 className="workflow-step-title">QR Stamped Certification</h4>
              <p className="workflow-step-desc">
                Upon approval, an official PDF compliance certificate with security QR and seal stamping is generated instantly.
              </p>
            </div>

            <div className="workflow-card">
              <div className="workflow-step-num">05</div>
              <div className="workflow-icon-box">
                <Clock size={24} />
              </div>
              <h4 className="workflow-step-title">Expiry Monitoring</h4>
              <p className="workflow-step-desc">
                Automated daemon tracks validity and triggers re-verification alerts 30, 15, 7, and 1 day before expiry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-title-wrap">
            <span className="section-kicker">SYSTEM CAPABILITIES</span>
            <h2 className="section-heading">Engineered for Legal Metrology Excellence</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon bg-blue">
                <Cpu size={24} />
              </div>
              <h3 className="feature-title">Live Metrology Calculation Engine</h3>
              <p className="feature-desc">
                Automatically calculates <code>Error = Observed - Reference</code> and percentage deviations against dynamic Maximum Permissible Error (MPE) thresholds.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-emerald">
                <QrCode size={24} />
              </div>
              <h3 className="feature-title">Public QR Validation</h3>
              <p className="feature-desc">
                Every certificate contains a unique high-resolution QR code allowing consumers, traders, and enforcement officers to verify authenticity in one scan.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-amber">
                <Calendar size={24} />
              </div>
              <h3 className="feature-title">Conflict-Free Inspection Scheduling</h3>
              <p className="feature-desc">
                Smart scheduling prevents overlapping appointments for inspecting officers and coordinates on-site or laboratory test bays seamlessly.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-purple">
                <Lock size={24} />
              </div>
              <h3 className="feature-title">Role-Based Security & Audit Trails</h3>
              <p className="feature-desc">
                Strict multi-layer RBAC authentication protecting state transitions, accompanied by an immutable system event audit trail.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-indigo">
                <TrendingUp size={24} />
              </div>
              <h3 className="feature-title">Executive Department Analytics</h3>
              <p className="feature-desc">
                Comprehensive analytics dashboards reporting monthly verification velocity, compliance rates, officer workloads, and regional distributions.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon bg-rose">
                <ShieldCheck size={24} />
              </div>
              <h3 className="feature-title">Dynamic Tolerance Rules Manager</h3>
              <p className="feature-desc">
                Super Admins can configure custom metrological tolerance rules per instrument category, accuracy class, and rated capacity thresholds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Banner / Stats */}
      <section className="stats-section">
        <div className="section-container">
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-num">100%</div>
              <div className="stat-lbl">Digital Verification Lifecycle</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">&lt; 1 sec</div>
              <div className="stat-lbl">Public QR Validation Response</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">4 Roles</div>
              <div className="stat-lbl">Owner, Officer, GATC & Admin</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">0% Hardcoded</div>
              <div className="stat-lbl">Configurable Legal Metrology Rules</div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .landing-page {
          background-color: #ffffff;
        }
        .hero-section {
          position: relative;
          background: radial-gradient(circle at 50% 0%, #172554 0%, #0c1527 75%, #080d1a 100%);
          color: #ffffff;
          padding: 6rem 1.5rem 5rem;
          text-align: center;
          overflow: hidden;
        }
        .hero-glow-1 {
          position: absolute;
          top: -100px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-container {
          max-width: 960px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.4rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.825rem;
          font-weight: 600;
          color: #93c5fd;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(8px);
        }
        .hero-title {
          font-size: 3.25rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 1.25rem;
          color: #ffffff;
        }
        .highlight-text {
          background: linear-gradient(135deg, #60a5fa 0%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 1.15rem;
          color: #cbd5e1;
          max-width: 720px;
          margin: 0 auto 2.5rem;
          line-height: 1.6;
        }
        .hero-search-card {
          background: rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          max-width: 760px;
          margin: 0 auto 2.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .hero-search-form {
          display: flex;
          align-items: center;
          position: relative;
        }
        .hero-search-icon {
          position: absolute;
          left: 1.25rem;
          color: #94a3b8;
        }
        .hero-search-input {
          width: 100%;
          padding: 0.95rem 12.5rem 0.95rem 3.25rem;
          font-size: 0.95rem;
          background: #ffffff;
          border: none;
          border-radius: var(--radius-md);
          color: #0f172a;
        }
        .hero-search-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.5);
        }
        .hero-search-btn {
          position: absolute;
          right: 6px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          border: none;
          padding: 0.65rem 1.25rem;
          font-weight: 600;
          font-size: 0.875rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: var(--transition);
        }
        .hero-search-btn:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }
        .hero-search-pills {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.85rem;
          font-size: 0.775rem;
        }
        .pills-label {
          color: #94a3b8;
          font-weight: 600;
        }
        .test-cert-pill {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #e2e8f0;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
          font-family: var(--font-mono);
          font-size: 0.725rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .test-cert-pill:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
        .test-cert-pill.valid { border-color: rgba(52, 211, 153, 0.4); color: #a7f3d0; }
        .test-cert-pill.expired { border-color: rgba(248, 113, 113, 0.4); color: #fca5a5; }
        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }
        /* Demo Launcher Section */
        .demo-launcher-section {
          background: #f8fafc;
          padding: 2.5rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .section-container {
          max-width: 1280px;
          margin: 0 auto;
        }
        .demo-launcher-box {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem 2rem;
          box-shadow: var(--shadow-sm);
        }
        .launcher-header {
          margin-bottom: 1.25rem;
        }
        .launcher-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .launcher-title-group h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--slate-900);
        }
        .launcher-subtitle {
          font-size: 0.85rem;
          color: var(--slate-500);
          margin-top: 0.2rem;
        }
        .role-cards-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .role-launch-card {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem;
          text-align: left;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .role-launch-card:hover {
          border-color: var(--primary-600);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .role-icon-box {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .role-icon-box.user { background: #eff6ff; color: #2563eb; }
        .role-icon-box.lmo { background: #f0fdf4; color: #16a34a; }
        .role-icon-box.gatc { background: #faf5ff; color: #9333ea; }
        .role-icon-box.admin { background: #fff7ed; color: #ea580c; }
        .role-name {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--slate-900);
        }
        .role-email {
          font-size: 0.775rem;
          color: var(--slate-500);
          font-family: var(--font-mono);
          margin-top: 2px;
        }
        .role-action {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--primary-600);
          margin-top: 0.5rem;
        }
        /* Workflow Section */
        .workflow-section {
          padding: 5rem 1.5rem;
          background: #ffffff;
        }
        .section-title-wrap {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 3.5rem;
        }
        .section-kicker {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--primary-600);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .section-heading {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--slate-900);
          letter-spacing: -0.02em;
          margin-top: 0.4rem;
          margin-bottom: 0.85rem;
        }
        .section-subtext {
          font-size: 1rem;
          color: var(--slate-600);
          line-height: 1.55;
        }
        .workflow-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.25rem;
        }
        .workflow-card {
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          position: relative;
          transition: var(--transition);
        }
        .workflow-card:hover {
          background: #ffffff;
          box-shadow: var(--shadow-md);
          border-color: var(--primary-500);
          transform: translateY(-3px);
        }
        .workflow-step-num {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--slate-400);
          margin-bottom: 0.75rem;
        }
        .workflow-icon-box {
          width: 46px;
          height: 46px;
          border-radius: var(--radius-md);
          background: #ffffff;
          border: 1px solid var(--slate-200);
          color: var(--primary-600);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          box-shadow: var(--shadow-xs);
        }
        .workflow-step-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 0.5rem;
        }
        .workflow-step-desc {
          font-size: 0.825rem;
          color: var(--slate-600);
          line-height: 1.45;
        }
        /* Features Section */
        .features-section {
          padding: 5rem 1.5rem;
          background: #f8fafc;
          border-top: 1px solid var(--border-color);
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .feature-card {
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          transition: var(--transition);
        }
        .feature-card:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--primary-500);
          transform: translateY(-2px);
        }
        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .bg-blue { background: #eff6ff; color: #2563eb; }
        .bg-emerald { background: #ecfdf5; color: #059669; }
        .bg-amber { background: #fffbeb; color: #d97706; }
        .bg-purple { background: #faf5ff; color: #9333ea; }
        .bg-indigo { background: #e0e7ff; color: #4338ca; }
        .bg-rose { background: #fff1f2; color: #e11d48; }

        .feature-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 0.5rem;
        }
        .feature-desc {
          font-size: 0.875rem;
          color: var(--slate-600);
          line-height: 1.5;
        }
        .feature-desc code {
          background: var(--slate-100);
          padding: 0.15rem 0.35rem;
          border-radius: 4px;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--primary-700);
        }
        /* Stats Section */
        .stats-section {
          background: #0f172a;
          color: #ffffff;
          padding: 3.5rem 1.5rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          text-align: center;
        }
        .stat-num {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          font-weight: 800;
          color: #38bdf8;
          letter-spacing: -0.02em;
        }
        .stat-lbl {
          font-size: 0.85rem;
          color: #94a3b8;
          margin-top: 0.25rem;
          font-weight: 500;
        }
        @media (max-width: 1024px) {
          .workflow-grid { grid-template-columns: repeat(3, 1fr); }
          .role-cards-grid { grid-template-columns: repeat(2, 1fr); }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-title { font-size: 2.5rem; }
        }
        @media (max-width: 768px) {
          .workflow-grid { grid-template-columns: 1fr; }
          .role-cards-grid { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-search-input { padding-right: 1rem; }
          .hero-search-btn { position: static; width: 100%; margin-top: 0.5rem; }
          .hero-search-form { flex-direction: column; }
          .hero-title { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
};
