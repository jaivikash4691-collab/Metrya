import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scale, Lock, Mail, User, Building, Phone, MapPin, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    organization: '',
    businessRegistrationNumber: '',
    street: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        organization: formData.organization,
        businessRegistrationNumber: formData.businessRegistrationNumber,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        }
      };

      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-brand">
            <div className="auth-logo-icon">
              <Scale size={24} />
            </div>
            <span className="auth-brand-name">METRYA</span>
          </Link>
          <h2 className="auth-title">Register Business / Instrument Owner</h2>
          <p className="auth-subtitle">Create an account to submit verification applications and manage instruments</p>
        </div>

        {error && (
          <div className="auth-alert alert-danger">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name / Authorized Rep *</label>
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Official Email Address *</label>
              <div className="input-icon-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control with-icon"
                />
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-icon-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone Number</label>
              <div className="input-icon-wrapper">
                <Phone size={18} className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control with-icon"
                />
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Company / Enterprise Name</label>
              <div className="input-icon-wrapper">
                <Building size={18} className="input-icon" />
                <input
                  type="text"
                  name="organization"
                  placeholder="e.g. Acme Trading Ltd."
                  value={formData.organization}
                  onChange={handleChange}
                  className="form-control with-icon"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">GSTIN / Trade License No</label>
              <input
                type="text"
                name="businessRegistrationNumber"
                placeholder="GSTIN27AABCA1234F1Z5"
                value={formData.businessRegistrationNumber}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Facility / Installation Address</label>
            <input
              type="text"
              name="street"
              placeholder="Street / Industrial Area / Unit No."
              value={formData.street}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                placeholder="Mumbai"
                value={formData.city}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                placeholder="Maharashtra"
                value={formData.state}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input
                type="text"
                name="pincode"
                placeholder="400705"
                value={formData.pincode}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight size={16} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .register-card {
          max-width: 680px;
        }
      `}</style>
    </div>
  );
};
