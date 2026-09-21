import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  CalendarDays,
  FileCheck2,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Scale,
  Building2,
  MapPin,
  Play
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { applicationService } from '../../services/applicationService';
import { scheduleService } from '../../services/scheduleService';
import { adminService } from '../../services/adminService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';

export const LMODashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOfficerData = async () => {
      try {
        setLoading(true);
        const [appRes, schedRes, analyticsRes] = await Promise.all([
          applicationService.getApplications({ limit: 10 }),
          scheduleService.getSchedules({}),
          adminService.getAnalytics()
        ]);

        if (appRes.success) setApplications(appRes.applications || []);
        if (schedRes.success) setSchedules(schedRes.schedules || []);
        if (analyticsRes.success) setAnalytics(analyticsRes);
      } catch (err) {
        console.error('Error loading LMO data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOfficerData();
  }, []);

  const assignedCount = applications.filter((a) => a.status === 'ASSIGNED' || a.status === 'UNDER_REVIEW').length;
  const scheduledCount = schedules.filter((s) => s.status === 'SCHEDULED').length;
  const readyForDecisionCount = applications.filter((a) => a.status === 'INSPECTION_COMPLETED').length;
  const completedCount = applications.filter((a) => ['APPROVED', 'CERTIFICATE_GENERATED'].includes(a.status)).length;

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

  if (loading) {
    return <LoadingSkeleton rows={8} />;
  }

  return (
    <div className="lmo-dashboard">
      {/* Officer Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title">Officer Verification Workbench</h1>
          <p className="page-subtitle">
            {user?.name} • Badge: <strong>{user?.officerBadgeNumber || 'LMO-OFFICER'}</strong> • Jurisdiction: {user?.jurisdiction || 'Regional District'}
          </p>
        </div>
        <div className="header-actions">
          <Link to="/inspections" className="btn btn-primary">
            <ClipboardCheck size={16} /> Open Inspection Form
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4 mb-4">
        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-blue">
            <FileCheck2 size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{assignedCount}</div>
            <div className="kpi-label">Assigned Queue</div>
          </div>
        </div>

        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-amber">
            <CalendarDays size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{scheduledCount}</div>
            <div className="kpi-label">Scheduled Inspections</div>
          </div>
        </div>

        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-purple">
            <Clock size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{readyForDecisionCount}</div>
            <div className="kpi-label">Pending Approval Decision</div>
          </div>
        </div>

        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-emerald">
            <Award size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{completedCount}</div>
            <div className="kpi-label">Certified This Period</div>
          </div>
        </div>
      </div>

      {/* Inspection Schedules Queue */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Upcoming Inspection Schedule & Field Work</h3>
          <Link to="/scheduling" className="card-header-link">
            Calendar View →
          </Link>
        </div>

        {schedules.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No scheduled inspections"
            description="You currently have no scheduled field inspection appointments."
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Application Ref</th>
                  <th>Enterprise / Facility</th>
                  <th>Instrument Details</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="font-bold">{new Date(s.date).toLocaleDateString()}</div>
                      <div className="text-muted text-xs">{s.startTime} - {s.endTime}</div>
                    </td>
                    <td>
                      <span className="code-badge">{s.application?.applicationNumber || 'N/A'}</span>
                    </td>
                    <td>
                      <div className="font-medium">{s.application?.applicant?.organization || s.application?.applicant?.name}</div>
                      <div className="text-xs text-muted">
                        <MapPin size={12} className="inline" /> {s.location?.city || 'On-Site'}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">{s.application?.instrument?.instrumentType}</div>
                      <div className="text-xs text-muted code-font">{s.application?.instrument?.serialNumber}</div>
                    </td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td>
                      <Link
                        to={`/inspections?appId=${s.application?._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        <Play size={13} /> Conduct Test
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Applications Queue & Charts */}
      <div className="grid-2 mb-4">
        {/* Applications Waiting for Action */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Assigned Applications Queue</h3>
            <Link to="/applications" className="card-header-link">
              All Applications →
            </Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>App No</th>
                  <th>Applicant</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map((app) => (
                  <tr key={app._id}>
                    <td>
                      <span className="code-badge">{app.applicationNumber}</span>
                    </td>
                    <td>
                      <div className="font-medium">{app.applicant?.organization || app.applicant?.name}</div>
                      <div className="text-xs text-muted">{app.instrument?.instrumentType}</div>
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td>
                      <Link to={`/applications/${app._id}`} className="btn btn-outline-primary btn-sm">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Verification Trends Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Verification Trends</h3>
            <span className="badge badge-info">Department Throughput</span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            {analytics?.monthlyTrends?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="approved" name="Approved & Certified" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart-box">
                <p className="text-muted text-sm">Monthly trends will populate as applications are verified.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .empty-chart-box {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
      `}</style>
    </div>
  );
};
