import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ClipboardCheck,
  Scale,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  AlertTriangle,
  ArrowLeft,
  Play,
  Award
} from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { inspectionService } from '../../services/inspectionService';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { useAuth } from '../../context/AuthContext';

export const InspectionWorkspacePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const requestedAppId = searchParams.get('appId') || '';

  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(requestedAppId);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Inspection Form State
  const [envConditions, setEnvConditions] = useState({
    temperatureCelsius: 22.5,
    relativeHumidityPercentage: 55,
    atmosphericPressureHpa: 1013.25
  });

  const [measurements, setMeasurements] = useState([
    { testPointName: 'Min Load (10%)', referenceValue: 15, observedValue: 15.0, tolerance: 0.1, unit: 'kg' },
    { testPointName: 'Half Load (50%)', referenceValue: 75, observedValue: 75.02, tolerance: 0.1, unit: 'kg' },
    { testPointName: 'Full Load (100%)', referenceValue: 150, observedValue: 150.03, tolerance: 0.1, unit: 'kg' }
  ]);

  const [physicalChecks, setPhysicalChecks] = useState({
    displayCondition: { status: 'PASS', remarks: '' },
    sealCondition: { status: 'INTACT', remarks: '' },
    calibrationCondition: { status: 'PASS', remarks: '' },
    manufacturerMarking: { status: 'LEGIBLE', remarks: '' },
    serialNumberVisibility: { status: 'VERIFIED', remarks: '' },
    safetyCondition: { status: 'SAFE', remarks: '' },
    levelIndicator: { status: 'CENTRED', remarks: '' }
  });

  const [sealingDetails, setSealingDetails] = useState({
    stampingQuarter: 'Q1',
    stampingYear: new Date().getFullYear()
  });

  const [officerRemarks, setOfficerRemarks] = useState('');
  const [recommendation, setRecommendation] = useState('APPROVED');

  // Load eligible applications for inspection
  useEffect(() => {
    const loadApps = async () => {
      try {
        setLoading(true);
        const res = await applicationService.getApplications({
          status: 'SCHEDULED'
        });
        if (res.success) {
          const list = res.applications || [];
          setApplications(list);
          if (requestedAppId) {
            setSelectedAppId(requestedAppId);
          } else if (list.length > 0) {
            setSelectedAppId(list[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadApps();
  }, [requestedAppId]);

  // Load single application details when selected
  useEffect(() => {
    if (selectedAppId) {
      const fetchApp = async () => {
        try {
          const res = await applicationService.getApplicationById(selectedAppId);
          if (res.success) {
            setSelectedApp(res.application);
            const inst = res.application.instrument;
            if (inst) {
              const cap = inst.capacity;
              const u = inst.unit || 'kg';
              // Populate initial test points based on capacity
              setMeasurements([
                { testPointName: `Min Verification Load (10%)`, referenceValue: Number((cap * 0.1).toFixed(3)), observedValue: Number((cap * 0.1).toFixed(3)), tolerance: 0.1, unit: u },
                { testPointName: `Half Scale Load (50%)`, referenceValue: Number((cap * 0.5).toFixed(3)), observedValue: Number((cap * 0.5).toFixed(3)), tolerance: 0.1, unit: u },
                { testPointName: `Maximum Rated Load (100%)`, referenceValue: Number(cap.toFixed(3)), observedValue: Number(cap.toFixed(3)), tolerance: 0.1, unit: u }
              ]);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      fetchApp();
    }
  }, [selectedAppId]);

  const handleMeasurementChange = (index, field, value) => {
    const updated = [...measurements];
    updated[index][field] = value;
    setMeasurements(updated);
  };

  const addMeasurementRow = () => {
    const u = selectedApp?.instrument?.unit || 'kg';
    setMeasurements([
      ...measurements,
      { testPointName: `Test Point ${measurements.length + 1}`, referenceValue: 0, observedValue: 0, tolerance: 0.1, unit: u }
    ]);
  };

  const removeMeasurementRow = (index) => {
    if (measurements.length <= 1) return;
    setMeasurements(measurements.filter((_, i) => i !== index));
  };

  // Helper calculation for live table display
  const computeRowError = (refVal, obsVal, tol) => {
    const ref = parseFloat(refVal) || 0;
    const obs = parseFloat(obsVal) || 0;
    const tolerance = parseFloat(tol) || 0.1;

    const error = Number((obs - ref).toFixed(4));
    const percentageError = ref !== 0 ? Number((((obs - ref) / ref) * 100).toFixed(4)) : 0;
    const isPass = Math.abs(percentageError) <= tolerance;

    return { error, percentageError, isPass };
  };

  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    if (!selectedAppId) {
      setError('Please select an application to inspect.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        applicationId: selectedAppId,
        environmentalConditions: envConditions,
        measurements: measurements.map((m) => ({
          testPointName: m.testPointName,
          referenceValue: Number(m.referenceValue),
          observedValue: Number(m.observedValue),
          unit: m.unit || selectedApp?.instrument?.unit || 'kg',
          tolerance: Number(m.tolerance || 0.1)
        })),
        physicalInspection: physicalChecks,
        officerRemarks,
        recommendation,
        stampingQuarter: sealingDetails.stampingQuarter,
        stampingYear: sealingDetails.stampingYear
      };

      const res = await inspectionService.conductInspection(payload);
      if (res.success) {
        navigate(`/applications/${selectedAppId}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit inspection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={10} />;

  return (
    <div className="inspection-workspace-page">
      <div className="section-header">
        <div>
          <h1 className="page-title">Digital Inspection & Metrological Stamping</h1>
          <p className="page-subtitle">
            Live tolerance calculation engine, verification measurement entries & physical checklist
          </p>
        </div>
      </div>

      {error && (
        <div className="auth-alert alert-danger mb-4">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Select Application Card */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Select Scheduled Application</h3>
        </div>

        <div className="form-group">
          <label className="form-label">Application Queue</label>
          <select
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            className="form-control"
          >
            <option value="">-- Choose Application --</option>
            {applications.map((a) => (
              <option key={a._id} value={a._id}>
                {a.applicationNumber} - {a.instrument?.instrumentType} ({a.applicant?.organization || a.applicant?.name}) [{a.status}]
              </option>
            ))}
          </select>
        </div>

        {selectedApp && (
          <div className="selected-inst-summary">
            <div className="summary-item">
              <span className="summary-lbl">Instrument ID:</span>
              <span className="summary-val code-font">{selectedApp.instrument?.instrumentId}</span>
            </div>
            <div className="summary-item">
              <span className="summary-lbl">Capacity & Unit:</span>
              <span className="summary-val font-bold">{selectedApp.instrument?.capacity} {selectedApp.instrument?.unit}</span>
            </div>
            <div className="summary-item">
              <span className="summary-lbl">Accuracy Class:</span>
              <span className="summary-val badge badge-info">{selectedApp.instrument?.accuracyClass}</span>
            </div>
            <div className="summary-item">
              <span className="summary-lbl">Serial Number:</span>
              <span className="summary-val code-font">{selectedApp.instrument?.serialNumber}</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmitInspection}>
        {/* Environmental Conditions */}
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Environmental Conditions at Test Bay</h3>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Ambient Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                value={envConditions.temperatureCelsius}
                onChange={(e) => setEnvConditions({ ...envConditions, temperatureCelsius: parseFloat(e.target.value) })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Relative Humidity (% RH)</label>
              <input
                type="number"
                step="1"
                value={envConditions.relativeHumidityPercentage}
                onChange={(e) => setEnvConditions({ ...envConditions, relativeHumidityPercentage: parseFloat(e.target.value) })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Atmospheric Pressure (hPa)</label>
              <input
                type="number"
                step="0.1"
                value={envConditions.atmosphericPressureHpa}
                onChange={(e) => setEnvConditions({ ...envConditions, atmosphericPressureHpa: parseFloat(e.target.value) })}
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Live Measurement Tolerances Table */}
        <div className="card mb-4">
          <div className="card-header">
            <div>
              <h3 className="card-title">Metrological Measurements & Tolerance Evaluation</h3>
              <p className="text-xs text-muted">
                Formula: Error = Observed - Reference • % Error = ((Observed - Reference) / Reference) × 100
              </p>
            </div>
            <button type="button" onClick={addMeasurementRow} className="btn btn-secondary btn-sm">
              <Plus size={14} /> Add Test Point
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test Point Description</th>
                  <th>Standard Reference</th>
                  <th>Observed Value</th>
                  <th>Unit</th>
                  <th>MPE Tolerance</th>
                  <th>Error (Obs - Ref)</th>
                  <th>% Error</th>
                  <th>Compliance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m, idx) => {
                  const calc = computeRowError(m.referenceValue, m.observedValue, m.tolerance);

                  return (
                    <tr key={idx}>
                      <td>
                        <input
                          type="text"
                          value={m.testPointName}
                          onChange={(e) => handleMeasurementChange(idx, 'testPointName', e.target.value)}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="any"
                          value={m.referenceValue}
                          onChange={(e) => handleMeasurementChange(idx, 'referenceValue', e.target.value)}
                          className="form-control"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="any"
                          value={m.observedValue}
                          onChange={(e) => handleMeasurementChange(idx, 'observedValue', e.target.value)}
                          className="form-control"
                        />
                      </td>
                      <td className="font-semibold">{m.unit || selectedApp?.instrument?.unit || 'kg'}</td>
                      <td>
                        <input
                          type="number"
                          step="any"
                          value={m.tolerance}
                          onChange={(e) => handleMeasurementChange(idx, 'tolerance', e.target.value)}
                          className="form-control"
                          style={{ width: '80px' }}
                        />
                      </td>
                      <td>
                        <span className={`code-font font-bold ${calc.error === 0 ? 'text-slate-800' : calc.error > 0 ? 'text-primary' : 'text-danger'}`}>
                          {calc.error > 0 ? `+${calc.error}` : calc.error}
                        </span>
                      </td>
                      <td>
                        <span className="code-font font-semibold">{calc.percentageError}%</span>
                      </td>
                      <td>
                        {calc.isPass ? (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> PASS
                          </span>
                        ) : (
                          <span className="badge badge-danger">
                            <XCircle size={12} /> FAIL
                          </span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeMeasurementRow(idx)}
                          className="btn-icon text-danger"
                          title="Remove row"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Physical Inspection Checklist */}
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Physical Condition Checklist</h3>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Digital Display / Scale Dial</label>
              <select
                value={physicalChecks.displayCondition.status}
                onChange={(e) => setPhysicalChecks({ ...physicalChecks, displayCondition: { ...physicalChecks.displayCondition, status: e.target.value } })}
                className="form-control"
              >
                <option value="PASS">PASS (Clear, visible and non-flickering)</option>
                <option value="FAIL">FAIL (Defective segments or illegible)</option>
                <option value="NA">Not Applicable</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Calibration Seal Integrity</label>
              <select
                value={physicalChecks.sealCondition.status}
                onChange={(e) => setPhysicalChecks({ ...physicalChecks, sealCondition: { ...physicalChecks.sealCondition, status: e.target.value } })}
                className="form-control"
              >
                <option value="INTACT">INTACT (Previous lead wire seal intact)</option>
                <option value="BROKEN">BROKEN (Tampered / missing seal)</option>
                <option value="NEW_APPLIED">NEW_APPLIED (Initial stamping applied)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Manufacturer Nameplate & Markings</label>
              <select
                value={physicalChecks.manufacturerMarking.status}
                onChange={(e) => setPhysicalChecks({ ...physicalChecks, manufacturerMarking: { ...physicalChecks.manufacturerMarking, status: e.target.value } })}
                className="form-control"
              >
                <option value="LEGIBLE">LEGIBLE (Brand, Model, Serial, Capacity plate clear)</option>
                <option value="DEFACED">DEFACED (Partially scratched / unreadable)</option>
                <option value="MISSING">MISSING (No manufacturer plate found)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Level Bubble Indicator</label>
              <select
                value={physicalChecks.levelIndicator.status}
                onChange={(e) => setPhysicalChecks({ ...physicalChecks, levelIndicator: { ...physicalChecks.levelIndicator, status: e.target.value } })}
                className="form-control"
              >
                <option value="CENTRED">CENTRED (Spirit bubble properly aligned)</option>
                <option value="OFF_CENTRE">OFF_CENTRE (Instrument not level)</option>
                <option value="NA">Not Applicable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sealing, Recommendation & Remarks */}
        <div className="card mb-4">
          <div className="card-header">
            <h3 className="card-title">Stamping Seal & Final Determination</h3>
          </div>

          <div className="grid-3 mb-3">
            <div className="form-group">
              <label className="form-label">Officer Recommendation *</label>
              <select
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                className="form-control font-bold"
              >
                <option value="APPROVED">APPROVED (Issue Verification Certificate)</option>
                <option value="REJECTED">REJECTED (Non-Compliant / Exceeds Tolerance)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Stamping Quarter</label>
              <select
                value={sealingDetails.stampingQuarter}
                onChange={(e) => setSealingDetails({ ...sealingDetails, stampingQuarter: e.target.value })}
                className="form-control"
              >
                <option value="Q1">Q1 (Jan - Mar)</option>
                <option value="Q2">Q2 (Apr - Jun)</option>
                <option value="Q3">Q3 (Jul - Sep)</option>
                <option value="Q4">Q4 (Oct - Dec)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Stamping Year</label>
              <input
                type="number"
                value={sealingDetails.stampingYear}
                onChange={(e) => setSealingDetails({ ...sealingDetails, stampingYear: parseInt(e.target.value) })}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Inspecting Officer Remarks / Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. Verified with standard M1 class weights. Span calibration tested and legal seal applied."
              value={officerRemarks}
              onChange={(e) => setOfficerRemarks(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-actions-right mt-3">
            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              <Award size={18} /> {submitting ? 'Submitting Inspection...' : 'Complete & Record Inspection'}
            </button>
          </div>
        </div>
      </form>

      <style>{`
        .selected-inst-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          background: var(--slate-50);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-md);
          padding: 0.85rem 1rem;
          margin-top: 0.85rem;
        }
        .summary-lbl {
          font-size: 0.75rem;
          color: var(--slate-500);
          display: block;
        }
        .summary-val {
          font-size: 0.9rem;
          color: var(--slate-900);
        }
        .btn-icon {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
        }
        .form-actions-right {
          display: flex;
          justify-content: flex-end;
        }
        @media (max-width: 768px) {
          .selected-inst-summary { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
};
