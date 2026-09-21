import React, { useState } from 'react';
import {
  User,
  Mail,
  Building,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Save,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
    businessRegistrationNumber: user?.businessRegistrationNumber || ''
  });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMsg('');
      const res = await authService.updateProfile(formData);
      if (res.success) {
        updateUser(res.user);
        setSuccessMsg('Profile updated successfully.');
      }
    } catch (err) {
      alert(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="section-header">
        <div>
          <h1 className="page-title">User Account & Profile</h1>
          <p className="page-subtitle">
            Manage organization credentials, contact information & security settings
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="auth-alert alert-warning mb-4">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Profile Information</h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Enterprise / Organization Name</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">GSTIN / Trade License</label>
              <input
                type="text"
                value={formData.businessRegistrationNumber}
                onChange={(e) => setFormData({ ...formData, businessRegistrationNumber: e.target.value })}
                className="form-control"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              <Save size={15} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Role & Security Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Security & Role Credentials</h3>
          </div>

          <div className="security-info-box">
            <div className="security-row">
              <span className="sec-lbl">Assigned Role:</span>
              <span className="badge badge-info">{user?.role}</span>
            </div>

            {user?.jurisdiction && (
              <div className="security-row">
                <span className="sec-lbl">Officer Jurisdiction:</span>
                <span className="sec-val font-bold">{user.jurisdiction}</span>
              </div>
            )}

            {user?.officerBadgeNumber && (
              <div className="security-row">
                <span className="sec-lbl">Officer Badge Number:</span>
                <span className="sec-val code-font">{user.officerBadgeNumber}</span>
              </div>
            )}

            {user?.gatcCentreName && (
              <div className="security-row">
                <span className="sec-lbl">GATC Testing Centre:</span>
                <span className="sec-val font-bold">{user.gatcCentreName}</span>
              </div>
            )}

            <div className="security-row">
              <span className="sec-lbl">Session Token:</span>
              <span className="sec-val text-xs text-muted">JWT Authenticated (7-Day Expiry)</span>
            </div>

            <div className="security-row">
              <span className="sec-lbl">Account Status:</span>
              <span className="badge badge-success">ACTIVE & VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .security-info-box {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .security-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.75rem;
          border-bottom: 1px dashed var(--slate-200);
          font-size: 0.875rem;
        }
        .sec-lbl {
          color: var(--slate-500);
          font-weight: 500;
        }
        .sec-val {
          color: var(--slate-900);
        }
      `}</style>
    </div>
  );
};
