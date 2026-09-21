import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  MapPin,
  Scale,
  User,
  CheckCircle2,
  AlertCircle,
  Eye,
  Play
} from 'lucide-react';
import { scheduleService } from '../../services/scheduleService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';

export const SchedulingPage = () => {
  const { role } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        setLoading(true);
        const res = await scheduleService.getSchedules({});
        if (res.success) {
          setSchedules(res.schedules || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSchedules();
  }, []);

  return (
    <div className="scheduling-page">
      <div className="section-header">
        <div>
          <h1 className="page-title">Inspection Schedule & Appointments</h1>
          <p className="page-subtitle">
            Officer inspection calendar, testing bay slots & on-site verification management
          </p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={6} />
      ) : schedules.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No inspection appointments scheduled"
          description="Inspection schedules will appear here once applications are assigned and scheduled."
        />
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time Slot</th>
                  <th>Application Number</th>
                  <th>Enterprise / Location</th>
                  <th>Instrument Details</th>
                  <th>Assigned Officer</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div className="font-bold text-slate-900">{new Date(s.date).toLocaleDateString()}</div>
                      <div className="text-xs text-muted">
                        <Clock size={12} className="inline" /> {s.startTime} - {s.endTime}
                      </div>
                    </td>
                    <td>
                      <span className="code-badge">{s.application?.applicationNumber || 'N/A'}</span>
                    </td>
                    <td>
                      <div className="font-bold">{s.application?.applicant?.organization || s.application?.applicant?.name}</div>
                      <div className="text-xs text-muted">
                        <MapPin size={12} className="inline" /> {s.location?.city || 'On-Site Facility'}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium">{s.application?.instrument?.instrumentType}</div>
                      <div className="text-xs text-muted code-font">{s.application?.instrument?.serialNumber}</div>
                    </td>
                    <td>
                      <div className="text-sm font-medium">{s.officer?.name || 'Assigned Officer'}</div>
                      <div className="text-xs text-muted">{s.officer?.jurisdiction}</div>
                    </td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td>
                      <div className="table-action-btns">
                        <Link to={`/applications/${s.application?._id}`} className="btn btn-secondary btn-sm">
                          <Eye size={14} /> Review
                        </Link>
                        {(role === 'LMO' || role === 'GATC' || role === 'SUPER_ADMIN') && (
                          <Link
                            to={`/inspections?appId=${s.application?._id}`}
                            className="btn btn-primary btn-sm"
                          >
                            <Play size={13} /> Conduct
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
