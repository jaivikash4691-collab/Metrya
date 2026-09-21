import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Search, ShieldCheck, User, LogIn, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [certSearch, setCertSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleVerifySearch = (e) => {
    e.preventDefault();
    if (certSearch.trim()) {
      navigate(`/verify/${certSearch.trim()}`);
    }
  };

  return (
    <header className="public-navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="logo-icon-wrapper">
            <Scale size={24} className="logo-icon" />
          </div>
          <div className="logo-text-group">
            <span className="brand-name">METRYA</span>
            <span className="brand-tagline">Legal Metrology Portal</span>
          </div>
        </Link>

        {/* Search verification widget */}
        <form onSubmit={handleVerifySearch} className="nav-search-form">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Verify Certificate (e.g. MET-CERT-2026-000101)..."
            value={certSearch}
            onChange={(e) => setCertSearch(e.target.value)}
            className="nav-search-input"
          />
          <button type="submit" className="nav-search-btn">
            Verify
          </button>
        </form>

        {/* Desktop Nav Links */}
        <nav className="nav-links desktop-only">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/verify" className="nav-link">Verify Certificate</Link>
          
          {isAuthenticated ? (
            <div className="auth-user-group">
              <Link to="/dashboard" className="btn btn-primary btn-sm">
                Dashboard ({user?.role})
              </Link>
            </div>
          ) : (
            <div className="auth-buttons-group">
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={15} /> Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register Instrument
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-dropdown">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Home</Link>
          <Link to="/verify" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Public Verification</Link>
          {isAuthenticated ? (
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link text-primary font-bold">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Log In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Register</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .public-navbar {
          background-color: #ffffff;
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 40;
          box-shadow: var(--shadow-xs);
        }
        .nav-container {
          max-width: 1380px;
          margin: 0 auto;
          padding: 0.85rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }
        .logo-icon-wrapper {
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
          color: #ffffff;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 5px rgba(37, 99, 235, 0.3);
        }
        .brand-name {
          font-family: var(--font-heading);
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--slate-900);
          letter-spacing: 0.05em;
          line-height: 1;
          display: block;
        }
        .brand-tagline {
          font-size: 0.7rem;
          color: var(--slate-500);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 600;
          display: block;
          margin-top: 2px;
        }
        .nav-search-form {
          flex: 1;
          max-width: 460px;
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--slate-400);
        }
        .nav-search-input {
          width: 100%;
          padding: 0.5rem 5.5rem 0.5rem 2.4rem;
          font-size: 0.85rem;
          border: 1px solid var(--slate-300);
          border-radius: var(--radius-full);
          background-color: var(--slate-50);
          transition: var(--transition);
        }
        .nav-search-input:focus {
          outline: none;
          background-color: #ffffff;
          border-color: var(--primary-600);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
        .nav-search-btn {
          position: absolute;
          right: 3px;
          background-color: var(--primary-600);
          color: #ffffff;
          border: none;
          padding: 0.35rem 0.9rem;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: var(--transition);
        }
        .nav-search-btn:hover {
          background-color: var(--primary-700);
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .nav-link {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--slate-600);
          text-decoration: none;
          transition: var(--transition);
        }
        .nav-link:hover {
          color: var(--primary-600);
        }
        .auth-buttons-group, .auth-user-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--slate-700);
          cursor: pointer;
        }
        .mobile-nav-dropdown {
          background: #ffffff;
          border-top: 1px solid var(--border-color);
          padding: 1rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .mobile-nav-link {
          padding: 0.5rem 0;
          font-weight: 500;
          color: var(--slate-800);
          border-bottom: 1px solid var(--border-subtle);
        }
        @media (max-width: 868px) {
          .desktop-only { display: none; }
          .mobile-menu-btn { display: block; }
          .nav-search-form { display: none; }
        }
      `}</style>
    </header>
  );
};
