import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Scale, Lock, Mail, ArrowRight, UserCheck, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sessionExpired = new URLSearchParams(location.search).get('session') === 'expired';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    try {
      setLoading(true);
      setError('');
      await login(demoEmail, demoPass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <Link to="/" className="auth-brand">
            <div className="auth-logo-icon">
              <Scale size={24} />
            </div>
            <span className="auth-brand-name">METRYA</span>
          </Link>
          <h2 className="auth-title">Legal Metrology Portal Login</h2>
          <p className="auth-subtitle">Sign in to manage verification applications and certificates</p>
        </div>

        {sessionExpired && (
          <div className="auth-alert alert-warning">
            <AlertCircle size={16} />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="auth-alert alert-danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Accounts Selector */}
        <div className="demo-accounts-pill-box">
          <div className="demo-pill-title">
            <UserCheck size={14} /> 1-Click Demo Logins:
          </div>
          <div className="demo-pill-buttons">
            <button
              type="button"
              className="demo-pill"
              onClick={() => handleDemoFill('user@demo.com', 'Password123!')}
            >
              🏢 Business Owner
            </button>
            <button
              type="button"
              className="demo-pill"
              onClick={() => handleDemoFill('lmo@demo.com', 'Password123!')}
            >
              👮 LMO Officer
            </button>
            <button
              type="button"
              className="demo-pill"
              onClick={() => handleDemoFill('gatc@demo.com', 'Password123!')}
            >
              🔬 GATC Centre
            </button>
            <button
              type="button"
              className="demo-pill"
              onClick={() => handleDemoFill('admin@demo.com', 'Password123!')}
            >
              👑 Super Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Official Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                required
                placeholder="name@organization.gov.in / name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control with-icon"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control with-icon"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Workspace'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an instrument owner account?{' '}
            <Link to="/register" className="auth-link">
              Register New Business
            </Link>
          </p>
          <div className="public-verify-hint">
            Looking to check certificate validity?{' '}
            <Link to="/verify">Public Verification</Link>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          background: radial-gradient(circle at 50% 0%, #172554 0%, #0c1527 80%, #080d1a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
        }
        .auth-card {
          background: #ffffff;
          border-radius: var(--radius-lg);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
          width: 100%;
          max-width: 480px;
          padding: 2.5rem;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 1.75rem;
        }
        .auth-brand {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
          margin-bottom: 1rem;
        }
        .auth-logo-icon {
          background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
          color: #ffffff;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          display: flex;
        }
        .auth-brand-name {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--slate-900);
          letter-spacing: 0.05em;
        }
        .auth-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 0.35rem;
        }
        .auth-subtitle {
          font-size: 0.85rem;
          color: var(--slate-500);
        }
        .auth-alert {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.825rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .alert-warning {
          background-color: #fffbeb;
          border: 1px solid #fde68a;
          color: #b45309;
        }
        .alert-danger {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }
        .demo-accounts-pill-box {
          background: var(--slate-50);
          border: 1px dashed var(--slate-300);
          border-radius: var(--radius-md);
          padding: 0.85rem;
          margin-bottom: 1.5rem;
        }
        .demo-pill-title {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--slate-600);
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .demo-pill-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.4rem;
        }
        .demo-pill {
          background: #ffffff;
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-sm);
          padding: 0.35rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--slate-700);
          text-align: left;
          cursor: pointer;
          transition: var(--transition);
        }
        .demo-pill:hover {
          border-color: var(--primary-500);
          color: var(--primary-700);
          background: var(--primary-50);
        }
        .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--slate-400);
        }
        .with-icon {
          padding-left: 2.5rem;
        }
        .btn-block {
          width: 100%;
          padding: 0.75rem;
          font-size: 0.95rem;
          margin-top: 0.5rem;
        }
        .auth-footer {
          margin-top: 1.75rem;
          text-align: center;
          font-size: 0.825rem;
          color: var(--slate-600);
          border-top: 1px solid var(--border-subtle);
          padding-top: 1.25rem;
        }
        .auth-link {
          font-weight: 700;
          color: var(--primary-600);
        }
        .public-verify-hint {
          margin-top: 0.5rem;
          font-size: 0.775rem;
          color: var(--slate-400);
        }
        .public-verify-hint a {
          color: var(--primary-600);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};
