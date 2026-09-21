import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  PlusCircle,
  Search,
  Filter,
  Eye,
  FileCheck,
  Award,
  AlertTriangle,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { instrumentService } from '../../services/instrumentService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { NewInstrumentModal } from './NewInstrumentModal';
import { useAuth } from '../../context/AuthContext';

export const InstrumentListPage = () => {
  const { role } = useAuth();
  const [instruments, setInstruments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInstruments = async () => {
    try {
      setLoading(true);
      const res = await instrumentService.getInstruments({
        search: search || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined
      });
      if (res.success) {
        setInstruments(res.instruments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await instrumentService.getCategories();
        if (res.success) setCategories(res.categories || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchInstruments();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search, categoryFilter, statusFilter]);

  return (
    <div className="instrument-list-page">
      <div className="section-header">
        <div>
          <h1 className="page-title">Weighing & Measuring Instruments</h1>
          <p className="page-subtitle">
            Registered metrology devices, verification lifecycle & compliance registry
          </p>
        </div>
        {(role === 'USER' || role === 'SUPER_ADMIN') && (
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
            <PlusCircle size={16} /> Register New Instrument
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card filter-card mb-4">
        <div className="filter-grid">
          <div className="search-input-group">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by Instrument ID, Serial No, Manufacturer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control with-icon"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-control filter-select"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-control filter-select"
          >
            <option value="">All Statuses</option>
            <option value="VERIFIED">Verified & Stamped</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="REGISTERED">Registered</option>
            <option value="EXPIRED">Expired</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Instruments Table */}
      <div className="card">
        {loading ? (
          <LoadingSkeleton rows={6} />
        ) : instruments.length === 0 ? (
          <EmptyState
            icon={Scale}
            title="No instruments found"
            description="No weighing or measuring instruments match your query."
            actionLabel="Register Instrument"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Instrument ID</th>
                  <th>Instrument Details</th>
                  <th>Category</th>
                  <th>Capacity</th>
                  <th>Accuracy Class</th>
                  <th>Status</th>
                  <th>Valid Until</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {instruments.map((inst) => (
                  <tr key={inst._id}>
                    <td>
                      <span className="code-badge">{inst.instrumentId}</span>
                    </td>
                    <td>
                      <div className="font-bold text-slate-900">{inst.instrumentType}</div>
                      <div className="text-xs text-muted">
                        {inst.manufacturer} • {inst.model} • SN: <span className="code-font">{inst.serialNumber}</span>
                      </div>
                      {inst.location?.city && (
                        <div className="text-xs text-slate-400">
                          <MapPin size={11} className="inline" /> {inst.location.city}, {inst.location.state}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="text-sm font-medium">{inst.category?.name || 'NAWI'}</span>
                    </td>
                    <td>
                      <span className="font-semibold">{inst.capacity} {inst.unit}</span>
                    </td>
                    <td>
                      <span className="badge badge-slate">{inst.accuracyClass}</span>
                    </td>
                    <td>
                      <StatusBadge status={inst.status} />
                    </td>
                    <td>
                      {inst.nextVerificationDate ? (
                        <span className={`text-sm font-medium ${new Date(inst.nextVerificationDate) < new Date() ? 'text-danger font-bold' : ''}`}>
                          {new Date(inst.nextVerificationDate).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-muted text-xs">Not Certified</span>
                      )}
                    </td>
                    <td>
                      <div className="table-action-btns">
                        <Link to={`/instruments/${inst._id}`} className="btn btn-secondary btn-sm">
                          <Eye size={14} /> Details
                        </Link>
                        {inst.status !== 'PENDING_VERIFICATION' && (
                          <Link
                            to={`/applications?new=true&instId=${inst._id}`}
                            className="btn btn-outline-primary btn-sm"
                          >
                            <FileCheck size={14} /> Apply
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Instrument Registration Modal */}
      <NewInstrumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchInstruments();
        }}
      />

      <style>{`
        .filter-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1rem;
        }
        .search-input-group {
          position: relative;
          display: flex;
          align-items: center;
        }
        .table-action-btns {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        @media (max-width: 768px) {
          .filter-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};
