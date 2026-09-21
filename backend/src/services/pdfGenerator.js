const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateCertificatePDF = (certificate, resOrFilePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Certificate-${certificate.certificateNumber}`,
          Author: 'Metrya Legal Metrology Verification System',
          Subject: 'Digital Verification Certificate'
        }
      });

      let stream;
      if (typeof resOrFilePath === 'string') {
        stream = fs.createWriteStream(resOrFilePath);
        doc.pipe(stream);
      } else {
        doc.pipe(resOrFilePath);
      }

      const primaryColor = '#1e3a8a'; // Navy Blue
      const secondaryColor = '#0f172a'; // Slate
      const accentGreen = '#059669'; // Emerald
      const textMuted = '#475569';
      const borderLine = '#cbd5e1';

      // Outer Decorative Double Border
      doc.rect(20, 20, 555, 802).lineWidth(2).stroke(primaryColor);
      doc.rect(24, 24, 547, 794).lineWidth(0.75).stroke(borderLine);

      // Certificate Header Banner
      doc.rect(25, 25, 545, 80).fill('#f8fafc');

      doc.fillColor(primaryColor)
         .fontSize(22)
         .font('Helvetica-Bold')
         .text('METRYA', 45, 42, { align: 'center', characterSpacing: 2 });

      doc.fillColor(secondaryColor)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('LEGAL METROLOGY VERIFICATION & DIGITAL CERTIFICATE', { align: 'center' });

      doc.fillColor(textMuted)
         .fontSize(8)
         .font('Helvetica')
         .text('Issued under Standards of Weights and Measures Verification Protocol', { align: 'center' });

      // Certificate Top Metadata
      doc.moveDown(2);
      const topY = 120;

      doc.rect(40, topY, 515, 45).fill('#f1f5f9');
      doc.fillColor(secondaryColor).fontSize(9).font('Helvetica-Bold');
      doc.text('CERTIFICATE NO:', 55, topY + 10);
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold');
      doc.text(certificate.certificateNumber, 160, topY + 9);

      doc.fillColor(secondaryColor).fontSize(9).font('Helvetica-Bold');
      doc.text('APPLICATION REF:', 55, topY + 26);
      doc.fillColor(textMuted).fontSize(9).font('Helvetica');
      doc.text(certificate.application?.applicationNumber || 'N/A', 160, topY + 26);

      // Status Badge
      const statusX = 400;
      doc.rect(statusX, topY + 8, 140, 28).fill(accentGreen);
      doc.fillColor('#ffffff').fontSize(11).font('Helvetica-Bold').text('STATUS: VERIFIED', statusX, topY + 16, { width: 140, align: 'center' });

      // Owner & Applicant Details
      const ownerY = 175;
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('1. INSTRUMENT OWNER / ENTERPRISE DETAILS', 40, ownerY);
      doc.moveTo(40, ownerY + 15).lineTo(555, ownerY + 15).lineWidth(1).stroke(borderLine);

      doc.fillColor(secondaryColor).fontSize(9).font('Helvetica-Bold').text('Owner / Business Name:', 45, ownerY + 25);
      doc.font('Helvetica').fillColor(textMuted).text(certificate.owner?.name || certificate.owner?.organization || 'Registered Owner', 180, ownerY + 25);

      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Organization:', 45, ownerY + 40);
      doc.font('Helvetica').fillColor(textMuted).text(certificate.owner?.organization || 'N/A', 180, ownerY + 40);

      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Installation Location:', 45, ownerY + 55);
      const loc = certificate.instrumentSnapshot?.location;
      const locationStr = loc ? `${loc.facilityName || ''} ${loc.address || ''}, ${loc.city || ''} - ${loc.pincode || ''}` : 'On-Site Registered Facility';
      doc.font('Helvetica').fillColor(textMuted).text(locationStr, 180, ownerY + 55, { width: 360 });

      // Instrument Details Table
      const instY = 250;
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('2. VERIFIED INSTRUMENT SPECIFICATIONS', 40, instY);
      doc.moveTo(40, instY + 15).lineTo(555, instY + 15).lineWidth(1).stroke(borderLine);

      const tableTop = instY + 25;
      const col1 = 45;
      const col2 = 160;
      const col3 = 300;
      const col4 = 420;

      doc.fontSize(8.5);

      // Row 1
      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Instrument ID:', col1, tableTop);
      doc.font('Helvetica').fillColor(textMuted).text(certificate.instrumentSnapshot?.instrumentId || 'N/A', col2, tableTop);
      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Category:', col3, tableTop);
      doc.font('Helvetica').fillColor(textMuted).text(certificate.instrumentSnapshot?.categoryName || 'Weighing Instrument', col4, tableTop);

      // Row 2
      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Instrument Type:', col1, tableTop + 18);
      doc.font('Helvetica').fillColor(textMuted).text(certificate.instrumentSnapshot?.instrumentType || 'N/A', col2, tableTop + 18);
      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Manufacturer:', col3, tableTop + 18);
      doc.font('Helvetica').fillColor(textMuted).text(certificate.instrumentSnapshot?.manufacturer || 'N/A', col4, tableTop + 18);

      // Row 3
      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Model:', col1, tableTop + 36);
      doc.font('Helvetica').fillColor(textMuted).text(certificate.instrumentSnapshot?.model || 'N/A', col2, tableTop + 36);
      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Serial Number:', col3, tableTop + 36);
      doc.font('Helvetica').fillColor(textMuted).text(certificate.instrumentSnapshot?.serialNumber || 'N/A', col4, tableTop + 36);

      // Row 4
      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Rated Capacity:', col1, tableTop + 54);
      doc.font('Helvetica').fillColor(textMuted).text(`${certificate.instrumentSnapshot?.capacity || ''} ${certificate.instrumentSnapshot?.unit || 'kg'}`, col2, tableTop + 54);
      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Accuracy Class:', col3, tableTop + 54);
      doc.font('Helvetica').fillColor(textMuted).text(certificate.instrumentSnapshot?.accuracyClass || 'CLASS_III', col4, tableTop + 54);

      // Verification Findings & Validity Period
      const findingsY = 345;
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('3. METROLOGICAL VERIFICATION FINDINGS', 40, findingsY);
      doc.moveTo(40, findingsY + 15).lineTo(555, findingsY + 15).lineWidth(1).stroke(borderLine);

      const fTop = findingsY + 25;
      doc.rect(40, fTop, 515, 60).fill('#f8fafc');

      doc.fontSize(8.5);
      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Verification Date:', 55, fTop + 10);
      doc.font('Helvetica').fillColor(textMuted).text(new Date(certificate.verificationDate).toLocaleDateString('en-GB'), 160, fTop + 10);

      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Validity Period:', 300, fTop + 10);
      doc.font('Helvetica-Bold').fillColor(accentGreen).text(
        `${new Date(certificate.validFrom).toLocaleDateString('en-GB')}  TO  ${new Date(certificate.validUntil).toLocaleDateString('en-GB')}`,
        390,
        fTop + 10
      );

      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Verification Seal No:', 55, fTop + 32);
      doc.font('Helvetica').fillColor(textMuted).text(certificate.verificationSummary?.sealNumber || 'LM-SEAL-VERIFIED', 160, fTop + 32);

      doc.font('Helvetica-Bold').fillColor(secondaryColor).text('Compliance Determination:', 300, fTop + 32);
      doc.font('Helvetica-Bold').fillColor(accentGreen).text('PASSED (Within Legal MPE Limit)', 435, fTop + 32);

      // QR Code and Authentication Section
      const qrSectionY = 440;
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('4. DIGITAL VERIFICATION & AUTHENTICATION', 40, qrSectionY);
      doc.moveTo(40, qrSectionY + 15).lineTo(555, qrSectionY + 15).lineWidth(1).stroke(borderLine);

      // Embed QR image if available
      if (certificate.qrCodeDataUrl) {
        const base64Data = certificate.qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
        const qrBuffer = Buffer.from(base64Data, 'base64');
        doc.image(qrBuffer, 50, qrSectionY + 30, { width: 110, height: 110 });
      }

      const authTextX = 180;
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(secondaryColor);
      doc.text('Scan QR Code to Verify Authenticity Online', authTextX, qrSectionY + 35);
      doc.font('Helvetica').fillColor(textMuted).text('This digital certificate is cryptographically registered in the Metrya Verification Registry. Anyone can scan this QR code or visit the public verification portal to confirm the certificate validity in real-time.', authTextX, qrSectionY + 52, { width: 360, lineGap: 3 });

      doc.font('Helvetica-Bold').fillColor(primaryColor).text('Public Verification URL:', authTextX, qrSectionY + 105);
      doc.font('Helvetica').fillColor(primaryColor).text(certificate.qrVerificationUrl || `http://localhost:5173/verify/${certificate.certificateNumber}`, authTextX, qrSectionY + 120, { width: 360 });

      // Signatures & Endorsement Box
      const sigY = 610;
      doc.rect(40, sigY, 245, 95).stroke(borderLine);
      doc.rect(310, sigY, 245, 95).stroke(borderLine);

      // Officer Box
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(secondaryColor).text('VERIFYING LMO OFFICER', 50, sigY + 10);
      doc.font('Helvetica').fillColor(textMuted).text(`Name: ${certificate.officer?.name || 'Authorized Officer'}`, 50, sigY + 28);
      doc.text(`Badge No: ${certificate.officer?.officerBadgeNumber || 'LMO-IND-098'}`, 50, sigY + 42);
      doc.text(`Jurisdiction: ${certificate.officer?.jurisdiction || 'Regional Metrology Office'}`, 50, sigY + 56);
      doc.font('Helvetica-Bold').fillColor(accentGreen).text('[ Digitally Signed & Stamped ]', 50, sigY + 75);

      // GATC Centre Box
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(secondaryColor).text('GATC / TESTING CENTRE', 320, sigY + 10);
      doc.font('Helvetica').fillColor(textMuted).text(`Centre: ${certificate.gatc?.gatcCentreName || certificate.gatc?.name || 'Govt Approved Test Centre'}`, 320, sigY + 28);
      doc.text(`Verification Ref: ${certificate.certificateNumber}`, 320, sigY + 42);
      doc.text(`Date of Issue: ${new Date(certificate.issueDate).toLocaleDateString('en-GB')}`, 320, sigY + 56);
      doc.font('Helvetica-Bold').fillColor(accentGreen).text('[ Verified Standard Compliant ]', 320, sigY + 75);

      // Footer Metrology Disclaimer
      doc.fontSize(7.5).font('Helvetica').fillColor('#64748b');
      doc.text('Note: Metrya is an advanced digital verification platform prototype inspired by Legal Metrology SIH workflows. Certificates are electronically generated and verifiable on the public ledger.', 40, 770, { align: 'center', width: 515 });

      doc.end();

      if (stream) {
        stream.on('finish', () => resolve(resOrFilePath));
        stream.on('error', (err) => reject(err));
      } else {
        resolve();
      }
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateCertificatePDF };
