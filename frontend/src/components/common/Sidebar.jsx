import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Scale,
  FileCheck2,
  CalendarDays,
  ClipboardCheck,
  Award,
  Sliders,
  History,
  FileSpreadsheet,
  Users,
  UserCheck,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'LMO': return 'LMO Officer';
      case 'GATC': return 'GATC Centre';
      case 'USER':
      default: return 'Instrument Owner';
    }
  };

  const navItemClass = ({ isActive }) =>
    `sidebar-nav-item ${isActive ? 'active' : ''}`;

  return (
    <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <Link to="/dashboard" className="sidebar-brand-link">
          <div className="sidebar-logo-icon">
            <Scale size={22} />
          </div>
          <div>
            <span className="sidebar-title">METRYA</span>
            <span className="sidebar-subtitle">Legal Metrology</span>
          </div>
        </Link>
      </div>

      {/* User Badge Info Card */}
      <div className="sidebar-user-card">
        <div className="user-avatar-initials">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="user-info-text">
          <div className="user-name" title={user?.name}>{user?.name || 'User'}</div>
          <div className="user-role-badge">{getRoleLabel()}</div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <div className="nav-group-title">MAIN WORKSPACE</div>

        <NavLink to="/dashboard" end className={navItemClass} onClick={onClose}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        {/* Instruments Module - For all except pure testing centre if preferred */}
        <NavLink to="/instruments" className={navItemClass} onClick={onClose}>
          <Scale size={18} />
          <span>Instruments</span>
        </NavLink>

        {/* Applications */}
        <NavLink to="/applications" className={navItemClass} onClick={onClose}>
          <FileCheck2 size={18} />
          <span>Verification Apps</span>
        </NavLink>

        {/* Scheduling */}
        <NavLink to="/scheduling" className={navItemClass} onClick={onClose}>
          <CalendarDays size={18} />
          <span>Inspection Schedule</span>
        </NavLink>

        {/* Digital Inspection Module - LMO, GATC, Admin */}
        {(role === 'LMO' || role === 'GATC' || role === 'SUPER_ADMIN') && (
          <NavLink to="/inspections" className={navItemClass} onClick={onClose}>
            <ClipboardCheck size={18} />
            <span>Digital Inspections</span>
          </NavLink>
        )}

        {/* Digital Certificates */}
        <NavLink to="/certificates" className={navItemClass} onClick={onClose}>
          <Award size={18} />
          <span>Certificates</span>
        </NavLink>

        {/* Admin and Officer Specifics */}
        {(role === 'SUPER_ADMIN' || role === 'LMO') && (
          <>
            <div className="nav-group-title">ADMINISTRATION</div>

            <NavLink to="/analytics" className={navItemClass} onClick={onClose}>
              <Sliders size={18} />
              <span>Department Analytics</span>
            </NavLink>

            <NavLink to="/reports" className={navItemClass} onClick={onClose}>
              <FileSpreadsheet size={18} />
              <span>Reports & Exports</span>
            </NavLink>
          </>
        )}

        {role === 'SUPER_ADMIN' && (
          <>
            <NavLink to="/rules" className={navItemClass} onClick={onClose}>
              <ShieldCheck size={18} />
              <span>Tolerance Rules</span>
            </NavLink>

            <NavLink to="/audit-logs" className={navItemClass} onClick={onClose}>
              <History size={18} />
              <span>Audit Trail</span>
            </NavLink>

            <NavLink to="/users" className={navItemClass} onClick={onClose}>
              <Users size={18} />
              <span>User & Officer Mgmt</span>
            </NavLink>
          </>
        )}

        <div className="nav-group-title">PUBLIC PORTAL</div>
        <Link to="/" target="_blank" className="sidebar-nav-item external-link">
          <ExternalLink size={18} />
          <span>Public Portal</span>
        </Link>
        <Link to="/verify" target="_blank" className="sidebar-nav-item external-link">
          <ShieldCheck size={18} />
          <span>Verify Certificate</span>
        </Link>
      </nav>

      {/* Bottom Profile & Logout Footer */}
      <div className="sidebar-footer">
        <NavLink to="/profile" className={navItemClass} onClick={onClose}>
          <UserCheck size={18} />
          <span>My Profile</span>
        </NavLink>
        <button onClick={handleLogout} className="sidebar-nav-item logout-btn">
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>

      <style>{`
        .sidebar-brand {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #1e293b;
        }
        .sidebar-brand-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }
        .sidebar-logo-icon {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
          padding: 0.5rem;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .sidebar-title {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.05em;
          display: block;
          line-height: 1;
        }
        .sidebar-subtitle {
          font-size: 0.65rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 600;
          display: block;
          margin-top: 2px;
        }
        .sidebar-user-card {
          margin: 1rem 1rem 0.5rem 1rem;
          padding: 0.75rem;
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(51, 65, 85, 0.6);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .user-avatar-initials {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #2563eb;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.95rem;
          flex-shrink: 0;
        }
        .user-info-text {
          min-width: 0;
          flex: 1;
        }
        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-role-badge {
          font-size: 0.68rem;
          font-weight: 700;
          color: #60a5fa;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .sidebar-nav {
          flex: 1;
          padding: 0.75rem 0.75rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .nav-group-title {
          font-size: 0.65rem;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.08em;
          padding: 0.75rem 0.75rem 0.25rem;
          text-transform: uppercase;
        }
        .sidebar-nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.875rem;
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: var(--transition);
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          cursor: pointer;
        }
        .sidebar-nav-item:hover {
          background-color: rgba(51, 65, 85, 0.5);
          color: #ffffff;
        }
        .sidebar-nav-item.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(30, 64, 175, 0.4));
          color: #ffffff;
          border-left: 3px solid #3b82f6;
          font-weight: 600;
        }
        .sidebar-footer {
          padding: 0.75rem;
          border-top: 1px solid #1e293b;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .logout-btn {
          color: #f87171;
        }
        .logout-btn:hover {
          background-color: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }
      `}</style>
    </aside>
  );
};
