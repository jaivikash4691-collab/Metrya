import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  CheckCircle2,
  Sliders,
  Scale
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { instrumentService } from '../../services/instrumentService';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Modal } from '../../components/common/Modal';

export const RulesManagerPage = () => {
  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    accuracyClass: 'CLASS_III',
    minCapacity: 1,
    maxCapacity: 500,
    unit: 'kg',
    maxPermissibleErrorPercentage: 0.1,
    maxPermissibleErrorAbsolute: 0.05,
    description: ''
  });

  const loadRules = async () => {
    try {
      setLoading(true);
      const [rulesRes, catRes] = await Promise.all([
        adminService.getRules(),
        instrumentService.getCategories()
      ]);

      if (rulesRes.success) setRules(rulesRes.rules || []);
      if (catRes.success) setCategories(catRes.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleOpenCreate = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      category: categories[0]?._id || '',
      accuracyClass: 'CLASS_III',
      minCapacity: 1,
      maxCapacity: 500,
      unit: 'kg',
      maxPermissibleErrorPercentage: 0.1,
      maxPermissibleErrorAbsolute: 0.05,
      description: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      category: rule.category?._id || rule.category,
      accuracyClass: rule.accuracyClass || 'CLASS_III',
      minCapacity: rule.minCapacity,
      maxCapacity: rule.maxCapacity,
      unit: rule.unit || 'kg',
      maxPermissibleErrorPercentage: rule.maxPermissibleErrorPercentage,
      maxPermissibleErrorAbsolute: rule.maxPermissibleErrorAbsolute,
      description: rule.description || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await adminService.updateRule(editingRule._id, formData);
      } else {
        await adminService.createRule(formData);
      }
      setModalOpen(false);
      loadRules();
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  if (loading) return <LoadingSkeleton rows={6} />;

  return (
    <div className="rules-manager-page">
      <div className="section-header">
        <div>
          <h1 className="page-title">Legal Metrology Tolerance Rules</h1>
          <p className="page-subtitle">
            Configure dynamic Maximum Permissible Error (MPE) thresholds, accuracy classes & test criteria
          </p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          <Plus size={16} /> Add Verification Rule
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Category</th>
                <th>Accuracy Class</th>
                <th>Capacity Range</th>
                <th>Max Error (MPE %)</th>
                <th>Absolute MPE</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className="font-bold text-slate-900">{r.name}</div>
                    <div className="text-xs text-muted">{r.description}</div>
                  </td>
                  <td>{r.category?.name || 'All'}</td>
                  <td><span className="badge badge-info">{r.accuracyClass}</span></td>
                  <td className="code-font">{r.minCapacity} - {r.maxCapacity} {r.unit}</td>
                  <td className="code-font font-bold text-primary">±{r.maxPermissibleErrorPercentage}%</td>
                  <td className="code-font">±{r.maxPermissibleErrorAbsolute} {r.unit}</td>
                  <td><span className="badge badge-success">ACTIVE</span></td>
                  <td>
                    <button onClick={() => handleOpenEdit(r)} className="btn btn-secondary btn-sm">
                      <Edit2 size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Rule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRule ? 'Edit Verification Tolerance Rule' : 'Create New Legal Metrology Rule'}
        subtitle="Specify MPE limits used during automated inspection compliance calculation"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleSubmit} className="btn btn-primary">
              {editingRule ? 'Save Changes' : 'Create Rule'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Rule Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Class III Commercial Platform Scale Rule"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Instrument Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
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
              <label className="form-label">Accuracy Class</label>
              <select
                value={formData.accuracyClass}
                onChange={(e) => setFormData({ ...formData, accuracyClass: e.target.value })}
                className="form-control"
              >
                <option value="CLASS_I">Class I (Special)</option>
                <option value="CLASS_II">Class II (High)</option>
                <option value="CLASS_III">Class III (Medium)</option>
                <option value="CLASS_IIII">Class IIII (Ordinary)</option>
                <option value="GENERAL">General Standard</option>
                <option value="ALL">All Classes</option>
              </select>
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Min Capacity</label>
              <input
                type="number"
                value={formData.minCapacity}
                onChange={(e) => setFormData({ ...formData, minCapacity: parseFloat(e.target.value) })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Max Capacity</label>
              <input
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: parseFloat(e.target.value) })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Max Permissible Error (MPE %)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.maxPermissibleErrorPercentage}
                onChange={(e) => setFormData({ ...formData, maxPermissibleErrorPercentage: parseFloat(e.target.value) })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Absolute Error Limit</label>
              <input
                type="number"
                step="0.001"
                value={formData.maxPermissibleErrorAbsolute}
                onChange={(e) => setFormData({ ...formData, maxPermissibleErrorAbsolute: parseFloat(e.target.value) })}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Legal Authority Notes</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-control"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
