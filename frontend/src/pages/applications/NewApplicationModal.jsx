import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { applicationService } from '../../services/applicationService';
import { FileCheck2, AlertCircle } from 'lucide-react';

export const NewApplicationModal = ({ isOpen, onClose, instruments, preselectedInstId, onSuccess }) => {
  const [formData, setFormData] = useState({
    instrumentId: preselectedInstId || (instruments[0]?._id || ''),
    applicationType: 'NEW_VERIFICATION',
    priority: 'NORMAL',
    preferredInspectionDate: '',
    applicantNotes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.instrumentId) {
      setError('Please select an instrument.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await applicationService.createApplication(formData);
      if (res.success) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Verification Application"
      subtitle="Request official inspection and legal stamping for your instrument"
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Application'}
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
        <div className="form-group">
          <label className="form-label">Select Registered Instrument *</label>
          <select
            name="instrumentId"
            required
            value={formData.instrumentId}
            onChange={handleChange}
            className="form-control"
          >
            <option value="">-- Choose Instrument --</option>
            {instruments.map((inst) => (
              <option key={inst._id} value={inst._id}>
                {inst.instrumentType} ({inst.manufacturer} - SN: {inst.serialNumber}) [{inst.status}]
              </option>
            ))}
          </select>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Application Type</label>
            <select
              name="applicationType"
              value={formData.applicationType}
              onChange={handleChange}
              className="form-control"
            >
              <option value="NEW_VERIFICATION">Initial / New Verification</option>
              <option value="RE_VERIFICATION">Annual Re-Verification</option>
              <option value="RENEWAL">Stamping Renewal</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="form-control"
            >
              <option value="NORMAL">Standard Queue (Normal)</option>
              <option value="URGENT">Urgent Stamping Required</option>
              <option value="ROUTINE">Routine Periodic</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Preferred Inspection Date</label>
          <input
            type="date"
            name="preferredInspectionDate"
            value={formData.preferredInspectionDate}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Applicant Notes / Special Instructions</label>
          <textarea
            name="applicantNotes"
            rows={3}
            placeholder="e.g. Instrument is located in Warehouse Bay 2. Working hours 9 AM to 5 PM."
            value={formData.applicantNotes}
            onChange={handleChange}
            className="form-control"
          />
        </div>
      </form>
    </Modal>
  );
};
