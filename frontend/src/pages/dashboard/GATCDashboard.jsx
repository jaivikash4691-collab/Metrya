import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  CalendarDays,
  ClipboardCheck,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Scale,
  MapPin,
  Play
} from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { scheduleService } from '../../services/scheduleService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';

export const GATCDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGATCData = async () => {
      try {
        setLoading(true);
        const [appRes, schedRes] = await Promise.all([
          applicationService.getApplications({}),
          scheduleService.getSchedules({})
        ]);

        if (appRes.success) setApplications(appRes.applications || []);
        if (schedRes.success) setSchedules(schedRes.schedules || []);
      } catch (err) {
        console.error('Error loading GATC data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGATCData();
  }, []);

  const totalAssigned = applications.length;
  const scheduledCount = schedules.filter((s) => s.status === 'SCHEDULED').length;
  const completedCount = applications.filter((a) => ['APPROVED', 'CERTIFICATE_GENERATED'].includes(a.status)).length;

  if (loading) return <LoadingSkeleton rows={8} />;

  return (
    <div className="gatc-dashboard">
      <div className="section-header">
        <div>
          <h1 className="page-title">GATC Testing Centre Workbench</h1>
          <p className="page-subtitle">
            {user?.gatcCentreName || user?.name} • Testing Lab & Standards Calibration Bay
          </p>
        </div>
        <div>
          <Link to="/inspections" className="btn btn-primary">
            <ClipboardCheck size={16} /> New Calibration Test
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-3 mb-4">
        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-purple">
            <Cpu size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{totalAssigned}</div>
            <div className="kpi-label">Centre Assigned Jobs</div>
          </div>
        </div>

        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-amber">
            <CalendarDays size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{scheduledCount}</div>
            <div className="kpi-label">Scheduled Test Slots</div>
          </div>
        </div>

        <div className="card stat-kpi-card">
          <div className="kpi-icon-box bg-emerald">
            <Award size={22} />
          </div>
          <div className="kpi-content">
            <div className="kpi-value">{completedCount}</div>
            <div className="kpi-label">Completed Tests</div>
          </div>
        </div>
      </div>

      {/* Testing Schedule Queue */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Centre Inspection & Verification Queue</h3>
          <Link to="/scheduling" className="card-header-link">Schedule Manager →</Link>
        </div>

        {schedules.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No scheduled laboratory verifications"
            description="All scheduled testing bay appointments have been processed."
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Schedule Slot</th>
                  <th>Application Number</th>
                  <th>Enterprise</th>
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
                      <div className="text-xs text-muted">{s.startTime} - {s.endTime}</div>
                    </td>
                    <td>
                      <span className="code-badge">{s.application?.applicationNumber || 'N/A'}</span>
                    </td>
                    <td>
                      <div className="font-medium">{s.application?.applicant?.organization || s.application?.applicant?.name}</div>
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
                        <Play size={13} /> Open Lab Test Form
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
