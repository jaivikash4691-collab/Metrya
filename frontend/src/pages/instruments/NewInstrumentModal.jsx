import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { instrumentService } from '../../services/instrumentService';
import { Scale, Upload, AlertCircle } from 'lucide-react';

export const NewInstrumentModal = ({ isOpen, onClose, categories, onSuccess }) => {
  const [formData, setFormData] = useState({
    category: '',
    instrumentType: '',
    manufacturer: '',
    model: '',
    serialNumber: '',
    capacity: '',
    unit: 'kg',
    accuracyClass: 'CLASS_III',
    leastCount: '0.01',
    facilityName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    verificationFrequencyMonths: '12'
  });

  const [files, setFiles] = useState({
    instrumentPhoto: null,
    previousCertificate: null,
    invoiceDocument: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.instrumentType || !formData.manufacturer || !formData.serialNumber || !formData.capacity) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      if (files.instrumentPhoto) data.append('instrumentPhoto', files.instrumentPhoto);
      if (files.previousCertificate) data.append('previousCertificate', files.previousCertificate);
      if (files.invoiceDocument) data.append('invoiceDocument', files.invoiceDocument);

      const res = await instrumentService.createInstrument(data);
      if (res.success) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to register instrument.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Instrument"
      subtitle="Enter technical specifications and facility location for legal verification"
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register Instrument'}
          </button>
        </>
      }
    >
      {error && (
        <div className="auth-alert alert-danger mb-3">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Instrument Type *</label>
            <input
              type="text"
              name="instrumentType"
              required
              placeholder="e.g. Electronic Platform Scale"
              value={formData.instrumentType}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Manufacturer *</label>
            <input
              type="text"
              name="manufacturer"
              required
              placeholder="e.g. Essae-Teraoka"
              value={formData.manufacturer}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Model Name / Number *</label>
            <input
              type="text"
              name="model"
              required
              placeholder="e.g. DS-215"
              value={formData.model}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Serial Number *</label>
            <input
              type="text"
              name="serialNumber"
              required
              placeholder="e.g. SN-882104"
              value={formData.serialNumber}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Rated Capacity *</label>
            <input
              type="number"
              step="any"
              name="capacity"
              required
              placeholder="e.g. 150"
              value={formData.capacity}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit of Measure *</label>
            <select name="unit" value={formData.unit} onChange={handleChange} className="form-control">
              <option value="kg">kg (Kilograms)</option>
              <option value="g">g (Grams)</option>
              <option value="mg">mg (Milligrams)</option>
              <option value="L">L (Litres)</option>
              <option value="bar">bar (Pressure)</option>
              <option value="t">t (Tonnes)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Accuracy Class</label>
            <select
              name="accuracyClass"
              value={formData.accuracyClass}
              onChange={handleChange}
              className="form-control"
            >
              <option value="CLASS_I">Class I (Special Precision)</option>
              <option value="CLASS_II">Class II (High Precision)</option>
              <option value="CLASS_III">Class III (Medium / Trade)</option>
              <option value="CLASS_IIII">Class IIII (Ordinary)</option>
              <option value="GENERAL">General Standard</option>
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Verification Cycle (Months)</label>
            <select
              name="verificationFrequencyMonths"
              value={formData.verificationFrequencyMonths}
              onChange={handleChange}
              className="form-control"
            >
              <option value="12">Annual (12 Months)</option>
              <option value="24">Biennial (24 Months)</option>
              <option value="6">Half-Yearly (6 Months)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Facility / Bay Name</label>
            <input
              type="text"
              name="facilityName"
              placeholder="e.g. Packaging Unit Bay 2"
              value={formData.facilityName}
              onChange={handleChange}
              className="form-control"
            />
          </div>
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

        {/* File Uploads */}
        <div className="form-group">
          <label className="form-label">Instrument Photograph / Evidence</label>
          <input
            type="file"
            name="instrumentPhoto"
            accept="image/*,.pdf"
            onChange={handleFileChange}
            className="form-control"
          />
        </div>
      </form>
    </Modal>
  );
};
