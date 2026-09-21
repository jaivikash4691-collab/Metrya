import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, Search, CheckCheck, Clock, ExternalLink, ShieldAlert, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const DashboardHeader = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      markAsRead(n._id);
    }
    setShowNotifications(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <button
          onClick={onToggleSidebar}
          className="sidebar-toggle-btn"
          aria-label="Toggle Navigation"
        >
          <Menu size={22} />
        </button>

        <div className="header-breadcrumbs">
          <span className="platform-tag">METRYA PLATFORM</span>
          <span className="breadcrumb-divider">/</span>
          <span className="org-context">{user?.organization || user?.jurisdiction || 'Verification Portal'}</span>
        </div>
      </div>

      <div className="header-right">
        {/* Quick Verify Link */}
        <Link to="/verify" target="_blank" className="btn btn-secondary btn-sm quick-verify-btn">
          <Award size={15} /> Public Verify
        </Link>

        {/* Notifications Dropdown */}
        <div className="notifications-container" ref={notifRef}>
          <button
            className="notif-bell-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notif-dropdown">
              <div className="notif-header">
                <div className="notif-title-group">
                  <span className="notif-heading">Notifications</span>
                  {unreadCount > 0 && <span className="notif-count-pill">{unreadCount} New</span>}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="mark-all-read-btn">
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.length === 0 ? (
                  <div className="notif-empty">
                    <Clock size={28} className="empty-notif-icon" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="notif-item-header">
                        <span className="notif-item-title">{n.title}</span>
                        <span className="notif-item-time">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="notif-item-message">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Pill */}
        <Link to="/profile" className="header-user-pill">
          <div className="header-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="header-user-details">
            <span className="header-user-name">{user?.name}</span>
            <span className="header-user-role">{user?.role}</span>
          </div>
        </Link>
      </div>

      <style>{`
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .sidebar-toggle-btn {
          background: none;
          border: none;
          color: var(--slate-700);
          cursor: pointer;
          display: none;
          padding: 0.25rem;
        }
        .header-breadcrumbs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }
        .platform-tag {
          font-family: var(--font-heading);
          font-weight: 700;
          color: var(--primary-700);
          letter-spacing: 0.04em;
        }
        .breadcrumb-divider {
          color: var(--slate-300);
        }
        .org-context {
          color: var(--slate-600);
          font-weight: 500;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .quick-verify-btn {
          font-size: 0.8rem;
          padding: 0.4rem 0.85rem;
        }
        .notifications-container {
          position: relative;
        }
        .notif-bell-btn {
          position: relative;
          background: var(--slate-100);
          border: 1px solid var(--slate-200);
          color: var(--slate-700);
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }
        .notif-bell-btn:hover {
          background: var(--slate-200);
          color: var(--slate-900);
        }
        .notif-badge {
          position: absolute;
          top: -3px;
          right: -3px;
          background: #ef4444;
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          height: 18px;
          min-width: 18px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #ffffff;
        }
        .notif-dropdown {
          position: absolute;
          right: 0;
          top: 48px;
          width: 360px;
          max-height: 480px;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          z-index: 50;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.15s ease-out;
        }
        .notif-header {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--slate-50);
        }
        .notif-title-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .notif-heading {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--slate-900);
        }
        .notif-count-pill {
          background: var(--primary-100);
          color: var(--primary-800);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-full);
        }
        .mark-all-read-btn {
          background: none;
          border: none;
          color: var(--primary-600);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        .notif-list {
          overflow-y: auto;
          max-height: 380px;
        }
        .notif-item {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--border-subtle);
          cursor: pointer;
          transition: var(--transition);
        }
        .notif-item:hover {
          background-color: var(--slate-50);
        }
        .notif-item.unread {
          background-color: #f0fdf4;
          border-left: 3px solid #10b981;
        }
        .notif-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }
        .notif-item-title {
          font-size: 0.825rem;
          font-weight: 700;
          color: var(--slate-900);
        }
        .notif-item-time {
          font-size: 0.7rem;
          color: var(--slate-400);
        }
        .notif-item-message {
          font-size: 0.785rem;
          color: var(--slate-600);
          line-height: 1.35;
        }
        .notif-empty {
          padding: 2.5rem 1rem;
          text-align: center;
          color: var(--slate-400);
        }
        .header-user-pill {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-md);
          transition: var(--transition);
        }
        .header-user-pill:hover {
          background-color: var(--slate-100);
        }
        .header-avatar {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, var(--primary-600), var(--primary-800));
          color: #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }
        .header-user-details {
          display: flex;
          flex-direction: column;
        }
        .header-user-name {
          font-size: 0.825rem;
          font-weight: 600;
          color: var(--slate-900);
          line-height: 1.1;
        }
        .header-user-role {
          font-size: 0.675rem;
          font-weight: 700;
          color: var(--primary-600);
        }
        @media (max-width: 768px) {
          .sidebar-toggle-btn { display: block; }
          .header-user-details { display: none; }
          .org-context { display: none; }
          .breadcrumb-divider { display: none; }
          .quick-verify-btn { display: none; }
        }
      `}</style>
    </header>
  );
};
