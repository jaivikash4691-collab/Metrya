import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  User,
  Clock,
  Layers
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAuditLogs({
        search: search || undefined,
        entityType: entityType || undefined,
        limit: 50
      });
      if (res.success) {
        setLogs(res.logs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, entityType]);

  return (
    <div className="audit-logs-page">
      <div className="section-header">
        <div>
          <h1 className="page-title">System Audit Trail & Event Logs</h1>
          <p className="page-subtitle">
            Immutable log of all user actions, state transitions, inspection results & certificate issuances
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card filter-card mb-4">
        <div className="filter-grid">
          <div className="search-input-group">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by action, user name, email, or entity ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control with-icon"
            />
          </div>

          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="form-control"
          >
            <option value="">All Entity Types</option>
            <option value="APPLICATION">Application</option>
            <option value="CERTIFICATE">Certificate</option>
            <option value="INSPECTION">Inspection</option>
            <option value="INSTRUMENT">Instrument</option>
            <option value="RULE">Tolerance Rule</option>
            <option value="USER">User Account</option>
            <option value="SYSTEM">System Engine</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={8} />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action Event</th>
                  <th>Actor (User)</th>
                  <th>Role</th>
                  <th>Entity Type</th>
                  <th>Description</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="text-xs text-muted whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className="code-badge">{log.action}</span>
                    </td>
                    <td>
                      <div className="font-medium text-slate-900">{log.userName || 'System'}</div>
                      <div className="text-xs text-muted">{log.userEmail}</div>
                    </td>
                    <td>
                      <span className="badge badge-slate">{log.role || 'SYSTEM'}</span>
                    </td>
                    <td>
                      <span className="badge badge-info">{log.entityType}</span>
                    </td>
                    <td>
                      <div className="text-sm text-slate-800">{log.description}</div>
                    </td>
                    <td className="text-xs code-font text-slate-500">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .whitespace-nowrap { white-space: nowrap; }
      `}</style>
    </div>
  );
};
