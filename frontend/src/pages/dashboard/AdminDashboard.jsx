import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Scale,
  FileCheck2,
  Award,
  AlertTriangle,
  Download,
  TrendingUp,
  History,
  Sliders,
  CheckCircle2,
  CalendarDays,
  FileSpreadsheet
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { adminService } from '../../services/adminService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        setLoading(true);
        const [analyticsRes, auditRes] = await Promise.all([
          adminService.getAnalytics(),
          adminService.getAuditLogs({ limit: 6 })
        ]);

        if (analyticsRes.success) setAnalytics(analyticsRes);
        if (auditRes.success) setAuditLogs(auditRes.logs || []);
      } catch (err) {
        console.error('Error loading admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  if (loading) return <LoadingSkeleton rows={10} />;

  const summary = analytics?.summary || {};

  return (
    <div className="admin-dashboard">
      {/* Executive Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title">Executive Directorate & System Analytics</h1>
          <p className="page-subtitle">
            Department of Legal Metrology • Real-Time Standards Verification & Enforcement Metrics
          </p>
        </div>
        <div className="header-actions">
          <a
            href={adminService.exportReportUrl('applications')}
            download
            className="btn btn-secondary btn-sm"
          >
            <Download size={15} /> Export Applications (CSV)
          </a>
          <a
            href={adminService.exportReportUrl('certificates')}
            download
            className="btn btn-primary btn-sm"
          >
            <FileSpreadsheet size={15} /> Export Certificates (CSV)
          </a>
        </div>
      </div>

      {/* KPI Overview Grid */}
      <div className="grid-4 mb-4">
        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-blue">
            <Users size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{summary.totalUsers || 0}</div>
            <div className="kpi-label">System Users & Officers</div>
          </div>
        </div>

        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-indigo">
            <Scale size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{summary.totalInstruments || 0}</div>
            <div className="kpi-label">Registered Instruments</div>
          </div>
        </div>

        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-amber">
            <FileCheck2 size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{summary.totalApplications || 0}</div>
            <div className="kpi-label">Total Verification Apps</div>
          </div>
        </div>

        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-emerald">
            <Award size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{summary.activeCertificates || 0}</div>
            <div className="kpi-label">Active Valid Certificates</div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid-2 mb-4">
        {/* Verification Monthly Trend */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Verification Application Velocity</h3>
              <p className="text-xs text-muted">Monthly approved vs rejected breakdown</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            {analytics?.monthlyTrends?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="applications" name="Total Applied" fill="#93c5fd" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="approved" name="Approved & Certified" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart-box">
                <p className="text-muted text-sm">Monthly verification trends will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Instrument Categories Distribution */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Instrument Category Breakdown</h3>
              <p className="text-xs text-muted">Distribution across NAWI, fuel dispensers, and weighbridges</p>
            </div>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            {analytics?.categoryDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryDistribution}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart-box">
                <p className="text-muted text-sm">Category distribution loading...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Officer Workload and Recent Audit Log Stream */}
      <div className="grid-2 mb-4">
        {/* Officer Workload */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Officer Workload & Regional Distribution</h3>
          </div>

          {analytics?.officerWorkload?.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Officer</th>
                    <th>Jurisdiction</th>
                    <th>Assigned</th>
                    <th>Completed</th>
                    <th>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.officerWorkload.map((o) => (
                    <tr key={o._id}>
                      <td className="font-bold">{o.officerName}</td>
                      <td className="text-xs text-muted">{o.jurisdiction}</td>
                      <td><span className="badge badge-info">{o.assigned}</span></td>
                      <td><span className="badge badge-success">{o.completed}</span></td>
                      <td><span className="badge badge-warning">{o.pending}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-muted text-sm">No officer workload metrics recorded yet.</div>
          )}
        </div>

        {/* Audit Log Stream */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent System Audit Trail</h3>
            <Link to="/audit-logs" className="card-header-link">All Logs →</Link>
          </div>

          <div className="audit-list">
            {auditLogs.map((log) => (
              <div key={log._id} className="audit-item">
                <div className="audit-icon-box">
                  <History size={16} />
                </div>
                <div className="audit-content">
                  <div className="audit-header">
                    <span className="audit-action">{log.action}</span>
                    <span className="audit-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="audit-desc">{log.description}</p>
                  <div className="audit-user">Actor: {log.userName || 'System'} [{log.role}]</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .audit-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .audit-item {
          display: flex;
          gap: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px dashed var(--slate-200);
        }
        .audit-icon-box {
          color: var(--primary-600);
          background: var(--primary-50);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .audit-content {
          flex: 1;
        }
        .audit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.2rem;
        }
        .audit-action {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.775rem;
          color: var(--primary-800);
        }
        .audit-time {
          font-size: 0.7rem;
          color: var(--slate-400);
        }
        .audit-desc {
          font-size: 0.8rem;
          color: var(--slate-700);
          line-height: 1.35;
        }
        .audit-user {
          font-size: 0.7rem;
          color: var(--slate-500);
          margin-top: 0.2rem;
        }
      `}</style>
    </div>
  );
};
