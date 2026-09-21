import React from 'react';
import {
  FileSpreadsheet,
  Download,
  FileCheck2,
  Award,
  Scale,
  ShieldCheck
} from 'lucide-react';
import { adminService } from '../../services/adminService';

export const ReportsPage = () => {
  return (
    <div className="reports-page">
      <div className="section-header">
        <div>
          <h1 className="page-title">Reports & Data Exports</h1>
          <p className="page-subtitle">
            Generate and download official CSV datasets for compliance audits and ministry reviews
          </p>
        </div>
      </div>

      <div className="grid-3 mb-4">
        {/* Applications Report Card */}
        <div className="card report-card">
          <div className="report-icon-box bg-blue">
            <FileCheck2 size={24} />
          </div>
          <h3 className="report-title">Verification Applications Report</h3>
          <p className="report-desc">
            Full export of all verification applications, submission timestamps, applicant details, assigned officers, and lifecycle statuses.
          </p>
          <a
            href={adminService.exportReportUrl('applications')}
            download
            className="btn btn-primary btn-sm mt-auto"
          >
            <Download size={14} /> Download Applications (CSV)
          </a>
        </div>

        {/* Certificates Report Card */}
        <div className="card report-card">
          <div className="report-icon-box bg-emerald">
            <Award size={24} />
          </div>
          <h3 className="report-title">Issued Certificates & Stamping Ledger</h3>
          <p className="report-desc">
            Complete compliance registry of valid, expired, and revoked digital certificates, validity periods, seal numbers, and officers.
          </p>
          <a
            href={adminService.exportReportUrl('certificates')}
            download
            className="btn btn-success btn-sm mt-auto"
          >
            <Download size={14} /> Download Certificates (CSV)
          </a>
        </div>

        {/* Instruments Registry Report Card */}
        <div className="card report-card">
          <div className="report-icon-box bg-purple">
            <Scale size={24} />
          </div>
          <h3 className="report-title">Instrument Registry Dataset</h3>
          <p className="report-desc">
            Comprehensive catalog of registered weighing machines, fuel dispensers, platform scales, serial numbers, and locations.
          </p>
          <a
            href={adminService.exportReportUrl('instruments')}
            download
            className="btn btn-primary btn-sm mt-auto"
          >
            <Download size={14} /> Download Instruments (CSV)
          </a>
        </div>
      </div>

      <style>{`
        .report-card {
          display: flex;
          flex-direction: column;
          padding: 1.75rem;
        }
        .report-icon-box {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
        }
        .report-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--slate-900);
          margin-bottom: 0.5rem;
        }
        .report-desc {
          font-size: 0.85rem;
          color: var(--slate-600);
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }
        .mt-auto {
          margin-top: auto;
        }
      `}</style>
    </div>
  );
};
