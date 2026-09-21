const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const InstrumentCategory = require('../models/InstrumentCategory');
const Instrument = require('../models/Instrument');
const VerificationRule = require('../models/VerificationRule');
const VerificationApplication = require('../models/VerificationApplication');
const Schedule = require('../models/Schedule');
const Inspection = require('../models/Inspection');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

const { generateCertificateQRCode } = require('../services/qrService');
const { generateCertificatePDF } = require('../services/pdfGenerator');
const { ROLES, APPLICATION_STATUS, INSTRUMENT_STATUS, CERTIFICATE_STATUS } = require('../config/constants');

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/metrya');
    console.log('[Seed] Connected to MongoDB for seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await InstrumentCategory.deleteMany({});
    await Instrument.deleteMany({});
    await VerificationRule.deleteMany({});
    await VerificationApplication.deleteMany({});
    await Schedule.deleteMany({});
    await Inspection.deleteMany({});
    await Certificate.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    console.log('[Seed] Cleared existing data.');

    // 1. Create Users across all 4 roles
    const adminUser = await User.create({
      name: 'Dr. Vikram Malhotra',
      email: 'admin@demo.com',
      password: 'Password123!',
      role: ROLES.SUPER_ADMIN,
      phone: '+91 98110 00001',
      organization: 'Department of Legal Metrology, Central Authority',
      jurisdiction: 'National Headquarters - All Zones'
    });

    const lmoOfficer = await User.create({
      name: 'Rajesh Verma (LMO)',
      email: 'lmo@demo.com',
      password: 'Password123!',
      role: ROLES.LMO,
      phone: '+91 98220 00002',
      organization: 'State Directorate of Legal Metrology',
      jurisdiction: 'Zone 4 - Western Industrial District',
      officerBadgeNumber: 'LMO-DL-2024-089'
    });

    const gatcUser = await User.create({
      name: 'Apex Precision Metrology Lab',
      email: 'gatc@demo.com',
      password: 'Password123!',
      role: ROLES.GATC,
      phone: '+91 98330 00003',
      organization: 'National Accreditation Testing Laboratory',
      gatcCentreName: 'GATC Centre #04 - Western Regional Standards Lab',
      jurisdiction: 'Zone 4 - Industrial Corridor'
    });

    const businessOwner = await User.create({
      name: 'Ananya Enterprises Ltd.',
      email: 'user@demo.com',
      password: 'Password123!',
      role: ROLES.USER,
      phone: '+91 98440 00004',
      organization: 'Ananya Agro & Food Processing Ltd.',
      businessRegistrationNumber: 'GSTIN27AABCA1234F1Z5',
      address: {
        street: 'Plot 45, Sector 18, Phase II Industrial Area',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400705'
      }
    });

    const retailOwner = await User.create({
      name: 'Sunil Traders & Retail',
      email: 'retail@demo.com',
      password: 'Password123!',
      role: ROLES.USER,
      phone: '+91 98550 00005',
      organization: 'Sunil Supermarkets Pvt. Ltd.',
      businessRegistrationNumber: 'GSTIN07AAACR5566G1Z2',
      address: {
        street: 'Shop 12, Main Market Block C',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001'
      }
    });

    console.log('[Seed] Created Demo Users (Admin, LMO, GATC, Business Users).');

    // 2. Create Instrument Categories
    const categories = await InstrumentCategory.create([
      {
        name: 'Non-Automatic Weighing Instruments (NAWI)',
        code: 'NAWI',
        description: 'Electronic counter scales, platform scales, and analytical balances used in retail, trade, and industry.',
        standardVerificationFrequencyMonths: 12,
        applicableClasses: ['CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IIII'],
        standardTestPoints: [
          { percentage: 10, description: 'Min Verification Load' },
          { percentage: 25, description: 'Quarter Capacity' },
          { percentage: 50, description: 'Half Capacity' },
          { percentage: 75, description: 'Three-Quarter Capacity' },
          { percentage: 100, description: 'Maximum Rated Capacity' }
        ],
        icon: 'Scale'
      },
      {
        name: 'Fuel & Petroleum Dispensing Units',
        code: 'FUEL_DISP',
        description: 'Retail petrol, diesel, and CNG dispensing flow meters and volumetric measuring systems.',
        standardVerificationFrequencyMonths: 12,
        applicableClasses: ['CLASS_III', 'GENERAL'],
        standardTestPoints: [
          { percentage: 20, description: 'Low Flow Rate Test (5 Litres)' },
          { percentage: 50, description: 'Medium Flow Rate Test (10 Litres)' },
          { percentage: 100, description: 'Maximum Flow Delivery (20 Litres)' }
        ],
        icon: 'Fuel'
      },
      {
        name: 'Heavy Industrial Weighbridges',
        code: 'WEIGHBRIDGE',
        description: 'Electronic vehicle weighbridges and axle load weighing systems used in logistics and ports.',
        standardVerificationFrequencyMonths: 12,
        applicableClasses: ['CLASS_III', 'CLASS_IIII'],
        standardTestPoints: [
          { percentage: 10, description: 'Zero & Eccentricity Test' },
          { percentage: 50, description: 'Half Scale Load (25 Tonnes)' },
          { percentage: 100, description: 'Full Scale Test (50 Tonnes)' }
        ],
        icon: 'Truck'
      },
      {
        name: 'Precision Analytical & Medical Balances',
        code: 'PRECISION_BAL',
        description: 'High precision micro-balances and medical scales for pharmaceutical and assay trade.',
        standardVerificationFrequencyMonths: 12,
        applicableClasses: ['CLASS_I', 'CLASS_II'],
        standardTestPoints: [
          { percentage: 10, description: '10% Range Calibration' },
          { percentage: 50, description: '50% Range Linearity' },
          { percentage: 100, description: '100% Maximum Range' }
        ],
        icon: 'Activity'
      },
      {
        name: 'Liquid Flow Meters & Bulk Measuring',
        code: 'FLOW_METER',
        description: 'Electromagnetic, ultrasonic, and turbine bulk liquid meters for chemical and dairy processing.',
        standardVerificationFrequencyMonths: 24,
        applicableClasses: ['GENERAL'],
        standardTestPoints: [
          { percentage: 25, description: 'Minimum Flow Rate' },
          { percentage: 50, description: 'Nominal Flow Rate' },
          { percentage: 100, description: 'Maximum Flow Rate' }
        ],
        icon: 'Gauge'
      }
    ]);

    console.log('[Seed] Created Instrument Categories.');

    // 3. Create Verification Rules
    const nawiRule = await VerificationRule.create({
      name: 'Class III Commercial Non-Automatic Weighing Rule',
      category: categories[0]._id,
      accuracyClass: 'CLASS_III',
      minCapacity: 1,
      maxCapacity: 500,
      unit: 'kg',
      maxPermissibleErrorPercentage: 0.1, // 0.1% MPE
      maxPermissibleErrorAbsolute: 0.05,
      errorCalculationMethod: 'PERCENTAGE',
      description: 'Standard Legal Metrology MPE limits for commercial Class III retail and industrial platform scales.',
      mandatoryPhysicalChecks: [
        { key: 'seal', label: 'Calibration Seal Intact', isCritical: true },
        { key: 'display', label: '7-Segment / LCD Legibility', isCritical: true },
        { key: 'markings', label: 'Manufacturer Plate & Model Details', isCritical: true },
        { key: 'level', label: 'Spirit Level Bubble Centred', isCritical: true }
      ]
    });

    const fuelRule = await VerificationRule.create({
      name: 'Petroleum Dispensing Unit Verification Standard',
      category: categories[1]._id,
      accuracyClass: 'GENERAL',
      minCapacity: 1,
      maxCapacity: 100,
      unit: 'L',
      maxPermissibleErrorPercentage: 0.25, // +/- 0.25% or +/- 25ml per 10L
      maxPermissibleErrorAbsolute: 0.025,
      errorCalculationMethod: 'PERCENTAGE',
      description: 'Standard MPE tolerance for retail fuel dispensing pumps against standard 5L and 10L proving cans.',
      mandatoryPhysicalChecks: [
        { key: 'totalizer', label: 'Electronic Totalizer Functionality', isCritical: true },
        { key: 'hose', label: 'Delivery Hose & Nozzle Integrity', isCritical: true },
        { key: 'seal', label: 'Metering Unit Mechanical Seal', isCritical: true }
      ]
    });

    console.log('[Seed] Created Verification Rules.');

    // 4. Create Instruments
    const inst1 = await Instrument.create({
      instrumentId: 'INS-2026-000101',
      owner: businessOwner._id,
      category: categories[0]._id,
      instrumentType: 'Electronic Platform Weighing Scale',
      manufacturer: 'Essae-Teraoka Ltd.',
      model: 'DS-215 Heavy Duty',
      serialNumber: 'SN-ESSAE-982104',
      capacity: 150,
      accuracyClass: 'CLASS_III',
      unit: 'kg',
      leastCount: 0.02,
      location: {
        facilityName: 'Ananya Agro Warehouse Depot #2',
        address: 'Plot 45, Sector 18, Phase II Industrial Area',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400705'
      },
      purchaseDate: new Date('2024-03-15'),
      installationDate: new Date('2024-03-20'),
      verificationFrequencyMonths: 12,
      status: INSTRUMENT_STATUS.VERIFIED
    });

    const inst2 = await Instrument.create({
      instrumentId: 'INS-2026-000102',
      owner: businessOwner._id,
      category: categories[2]._id,
      instrumentType: 'Electronic Pitless Vehicle Weighbridge',
      manufacturer: 'Avery Weigh-Tronix',
      model: 'BridgeMaster Pro-60T',
      serialNumber: 'SN-AVERY-60T-8812',
      capacity: 60000,
      accuracyClass: 'CLASS_III',
      unit: 'kg',
      leastCount: 5,
      location: {
        facilityName: 'Ananya Agro Main Entrance Weighing Bay',
        address: 'Plot 45, Sector 18, Phase II Industrial Area',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400705'
      },
      purchaseDate: new Date('2023-08-10'),
      installationDate: new Date('2023-09-01'),
      verificationFrequencyMonths: 12,
      status: INSTRUMENT_STATUS.PENDING_VERIFICATION
    });

    const inst3 = await Instrument.create({
      instrumentId: 'INS-2026-000103',
      owner: retailOwner._id,
      category: categories[0]._id,
      instrumentType: 'Retail Price-Computing Counter Scale',
      manufacturer: 'Mettler Toledo',
      model: 'bPlus-T2 Commercial',
      serialNumber: 'SN-MT-COM-33109',
      capacity: 15,
      accuracyClass: 'CLASS_III',
      unit: 'kg',
      leastCount: 0.002,
      location: {
        facilityName: 'Sunil Supermarket Checkout Counter 1',
        address: 'Shop 12, Main Market Block C',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001'
      },
      purchaseDate: new Date('2024-01-10'),
      installationDate: new Date('2024-01-15'),
      verificationFrequencyMonths: 12,
      status: INSTRUMENT_STATUS.VERIFIED
    });

    const inst4 = await Instrument.create({
      instrumentId: 'INS-2026-000104',
      owner: retailOwner._id,
      category: categories[1]._id,
      instrumentType: 'Multi-Product Dual Nozzle Fuel Dispenser',
      manufacturer: 'Gilbarco Veeder-Root',
      model: 'Horizon High-Speed Dispenser',
      serialNumber: 'SN-GVR-FL-77215',
      capacity: 80,
      accuracyClass: 'GENERAL',
      unit: 'L',
      leastCount: 0.01,
      location: {
        facilityName: 'Express Highway Fuel Station Bay 3',
        address: 'NH-48 Outskirts',
        city: 'Gurugram',
        state: 'Haryana',
        pincode: '122001'
      },
      purchaseDate: new Date('2023-04-12'),
      installationDate: new Date('2023-05-01'),
      verificationFrequencyMonths: 12,
      status: INSTRUMENT_STATUS.REGISTERED
    });

    const inst5 = await Instrument.create({
      instrumentId: 'INS-2026-000105',
      owner: businessOwner._id,
      category: categories[3]._id,
      instrumentType: 'Precision Laboratory Micro-Balance',
      manufacturer: 'Sartorius AG',
      model: 'Cubis II Analytical Balance',
      serialNumber: 'SN-SART-CB-99401',
      capacity: 220,
      accuracyClass: 'CLASS_I',
      unit: 'g',
      leastCount: 0.0001,
      location: {
        facilityName: 'Central QC & Assurance Lab',
        address: 'Plot 45, Sector 18, Phase II',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400705'
      },
      purchaseDate: new Date('2023-01-10'),
      installationDate: new Date('2023-01-15'),
      verificationFrequencyMonths: 12,
      status: INSTRUMENT_STATUS.EXPIRED
    });

    console.log('[Seed] Created Instruments.');

    // 5. Create Verification Applications across various lifecycle stages

    // App 1: Completed & Certified
    const app1 = await VerificationApplication.create({
      applicationNumber: 'VER-2026-000101',
      applicant: businessOwner._id,
      instrument: inst1._id,
      applicationType: 'NEW_VERIFICATION',
      submissionDate: new Date('2026-01-10'),
      status: APPLICATION_STATUS.CERTIFICATE_GENERATED,
      priority: 'NORMAL',
      assignedOfficer: lmoOfficer._id,
      assignedGATC: gatcUser._id,
      approvalRemarks: 'Instrument calibrated and verified. Metrological deviation well within Class III permissible error limits.',
      statusHistory: [
        { status: 'SUBMITTED', changedBy: businessOwner._id, timestamp: new Date('2026-01-10'), comment: 'Submitted online' },
        { status: 'ASSIGNED', changedBy: adminUser._id, timestamp: new Date('2026-01-11'), comment: 'Assigned to Officer Rajesh Verma' },
        { status: 'SCHEDULED', changedBy: lmoOfficer._id, timestamp: new Date('2026-01-12'), comment: 'Inspection set for 15 Jan' },
        { status: 'INSPECTION_COMPLETED', changedBy: lmoOfficer._id, timestamp: new Date('2026-01-15'), comment: 'Inspection completed successfully' },
        { status: 'APPROVED', changedBy: lmoOfficer._id, timestamp: new Date('2026-01-15'), comment: 'Approved for certification' },
        { status: 'CERTIFICATE_GENERATED', changedBy: lmoOfficer._id, timestamp: new Date('2026-01-15'), comment: 'Digital certificate issued' }
      ]
    });

    // Schedule for App 1
    const sched1 = await Schedule.create({
      application: app1._id,
      officer: lmoOfficer._id,
      gatc: gatcUser._id,
      date: new Date('2026-01-15'),
      startTime: '10:00',
      endTime: '11:30',
      location: inst1.location,
      status: 'COMPLETED',
      notes: 'Initial annual verification on site.'
    });
    app1.schedule = sched1._id;

    // Inspection for App 1
    const insp1 = await Inspection.create({
      application: app1._id,
      instrument: inst1._id,
      inspector: lmoOfficer._id,
      inspectionDate: new Date('2026-01-15'),
      verificationRule: nawiRule._id,
      environmentalConditions: {
        temperatureCelsius: 23.4,
        relativeHumidityPercentage: 52,
        atmosphericPressureHpa: 1012.8
      },
      measurements: [
        { testPointName: 'Min Load (15kg)', referenceValue: 15.0, observedValue: 15.0, unit: 'kg', error: 0.0, percentageError: 0.0, tolerance: 0.1, pass: true },
        { testPointName: 'Quarter Load (37.5kg)', referenceValue: 37.5, observedValue: 37.51, unit: 'kg', error: 0.01, percentageError: 0.0267, tolerance: 0.1, pass: true },
        { testPointName: 'Half Load (75kg)', referenceValue: 75.0, observedValue: 75.02, unit: 'kg', error: 0.02, percentageError: 0.0267, tolerance: 0.1, pass: true },
        { testPointName: 'Full Load (150kg)', referenceValue: 150.0, observedValue: 150.03, unit: 'kg', error: 0.03, percentageError: 0.02, tolerance: 0.1, pass: true }
      ],
      physicalInspection: {
        displayCondition: { status: 'PASS', remarks: 'Bright 6-digit LED display clear from 5 metres.' },
        sealCondition: { status: 'INTACT', remarks: 'Previous wire lead seal intact.' },
        calibrationCondition: { status: 'PASS', remarks: 'Span calibration checked.' },
        manufacturerMarking: { status: 'LEGIBLE', remarks: 'Nameplate with model & serial number clearly readable.' },
        serialNumberVisibility: { status: 'VERIFIED', remarks: 'Matches physical invoice documents.' },
        safetyCondition: { status: 'SAFE', remarks: 'Grounding and level bubble verified.' },
        levelIndicator: { status: 'CENTRED', remarks: 'Spirit level centred.' }
      },
      overallCompliance: true,
      recommendation: 'APPROVED',
      officerRemarks: 'All test points compliant with Legal Metrology (General) Rules. Passed with high repeatability.',
      sealingDetails: {
        newSealNumber: 'LM-SEAL-2026-Q1-9921',
        stampingYear: 2026,
        stampingQuarter: 'Q1'
      }
    });
    app1.inspection = insp1._id;

    // Certificate for App 1
    const certNumber1 = 'MET-CERT-2026-000101';
    const { qrDataUrl: qr1, verifyUrl: vUrl1 } = await generateCertificateQRCode(certNumber1);

    const validFrom1 = new Date('2026-01-15');
    const validUntil1 = new Date('2027-01-14');

    const cert1 = await Certificate.create({
      certificateNumber: certNumber1,
      application: app1._id,
      instrument: inst1._id,
      owner: businessOwner._id,
      officer: lmoOfficer._id,
      gatc: gatcUser._id,
      inspection: insp1._id,
      issueDate: new Date('2026-01-15'),
      validFrom: validFrom1,
      validUntil: validUntil1,
      verificationDate: new Date('2026-01-15'),
      status: CERTIFICATE_STATUS.VALID,
      instrumentSnapshot: {
        instrumentId: inst1.instrumentId,
        categoryName: categories[0].name,
        instrumentType: inst1.instrumentType,
        manufacturer: inst1.manufacturer,
        model: inst1.model,
        serialNumber: inst1.serialNumber,
        capacity: inst1.capacity,
        unit: inst1.unit,
        accuracyClass: inst1.accuracyClass,
        location: inst1.location
      },
      verificationSummary: {
        maxObservedError: 0.03,
        maxPermissibleError: 0.1,
        sealNumber: 'LM-SEAL-2026-Q1-9921',
        stampingQuarter: 'Q1',
        stampingYear: 2026
      },
      qrCodeDataUrl: qr1,
      qrVerificationUrl: vUrl1,
      remarks: 'Complies with Legal Metrology Verification Standards. Seal applied.'
    });

    // Generate physical PDF file for cert1
    const pdfDir = path.join(__dirname, '../../uploads/certificates');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    const cert1PdfPath = path.join(pdfDir, `${certNumber1}.pdf`);
    const cert1Populated = await Certificate.findById(cert1._id)
      .populate('owner', 'name organization phone')
      .populate('officer', 'name officerBadgeNumber jurisdiction')
      .populate('gatc', 'name gatcCentreName')
      .populate('application', 'applicationNumber');

    await generateCertificatePDF(cert1Populated, cert1PdfPath);
    cert1.pdfPath = `/uploads/certificates/${certNumber1}.pdf`;
    await cert1.save();

    app1.certificate = cert1._id;
    await app1.save();

    inst1.currentCertificate = cert1._id;
    inst1.lastVerificationDate = validFrom1;
    inst1.nextVerificationDate = validUntil1;
    await inst1.save();

    // App 2: Scheduled Inspection
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const app2 = await VerificationApplication.create({
      applicationNumber: 'VER-2026-000102',
      applicant: businessOwner._id,
      instrument: inst2._id,
      applicationType: 'NEW_VERIFICATION',
      submissionDate: new Date(),
      status: APPLICATION_STATUS.SCHEDULED,
      priority: 'URGENT',
      assignedOfficer: lmoOfficer._id,
      assignedGATC: gatcUser._id,
      applicantNotes: 'New weighbridge installation ready for initial stamping test.',
      statusHistory: [
        { status: 'SUBMITTED', changedBy: businessOwner._id, timestamp: new Date(), comment: 'Application submitted' },
        { status: 'ASSIGNED', changedBy: adminUser._id, timestamp: new Date(), comment: 'Assigned to officer' },
        { status: 'SCHEDULED', changedBy: lmoOfficer._id, timestamp: new Date(), comment: 'Scheduled on site inspection' }
      ]
    });

    const sched2 = await Schedule.create({
      application: app2._id,
      officer: lmoOfficer._id,
      gatc: gatcUser._id,
      date: tomorrow,
      startTime: '14:30',
      endTime: '16:30',
      location: inst2.location,
      status: 'SCHEDULED',
      notes: 'Standard 20-tonne test weights mobile unit deployed.'
    });
    app2.schedule = sched2._id;
    await app2.save();

    // App 3: Retail scale - Approved & Certified
    const app3 = await VerificationApplication.create({
      applicationNumber: 'VER-2026-000103',
      applicant: retailOwner._id,
      instrument: inst3._id,
      applicationType: 'NEW_VERIFICATION',
      submissionDate: new Date('2026-02-01'),
      status: APPLICATION_STATUS.CERTIFICATE_GENERATED,
      priority: 'NORMAL',
      assignedOfficer: lmoOfficer._id,
      assignedGATC: gatcUser._id,
      approvalRemarks: 'Retail price computing scale checked for Class III accuracy.',
      statusHistory: [
        { status: 'SUBMITTED', changedBy: retailOwner._id, timestamp: new Date('2026-02-01'), comment: 'Submitted' },
        { status: 'CERTIFICATE_GENERATED', changedBy: lmoOfficer._id, timestamp: new Date('2026-02-05'), comment: 'Certified' }
      ]
    });

    const certNumber3 = 'MET-CERT-2026-000103';
    const { qrDataUrl: qr3, verifyUrl: vUrl3 } = await generateCertificateQRCode(certNumber3);

    const cert3 = await Certificate.create({
      certificateNumber: certNumber3,
      application: app3._id,
      instrument: inst3._id,
      owner: retailOwner._id,
      officer: lmoOfficer._id,
      gatc: gatcUser._id,
      issueDate: new Date('2026-02-05'),
      validFrom: new Date('2026-02-05'),
      validUntil: new Date('2027-02-04'),
      verificationDate: new Date('2026-02-05'),
      status: CERTIFICATE_STATUS.VALID,
      instrumentSnapshot: {
        instrumentId: inst3.instrumentId,
        categoryName: categories[0].name,
        instrumentType: inst3.instrumentType,
        manufacturer: inst3.manufacturer,
        model: inst3.model,
        serialNumber: inst3.serialNumber,
        capacity: inst3.capacity,
        unit: inst3.unit,
        accuracyClass: inst3.accuracyClass,
        location: inst3.location
      },
      verificationSummary: {
        maxObservedError: 0.002,
        maxPermissibleError: 0.1,
        sealNumber: 'LM-SEAL-2026-Q1-1044',
        stampingQuarter: 'Q1',
        stampingYear: 2026
      },
      qrCodeDataUrl: qr3,
      qrVerificationUrl: vUrl3,
      remarks: 'Verified for commercial checkout operations.'
    });

    const cert3PdfPath = path.join(pdfDir, `${certNumber3}.pdf`);
    const cert3Populated = await Certificate.findById(cert3._id)
      .populate('owner', 'name organization phone')
      .populate('officer', 'name officerBadgeNumber jurisdiction')
      .populate('gatc', 'name gatcCentreName')
      .populate('application', 'applicationNumber');

    await generateCertificatePDF(cert3Populated, cert3PdfPath);
    cert3.pdfPath = `/uploads/certificates/${certNumber3}.pdf`;
    await cert3.save();

    app3.certificate = cert3._id;
    await app3.save();

    inst3.currentCertificate = cert3._id;
    inst3.lastVerificationDate = new Date('2026-02-05');
    inst3.nextVerificationDate = new Date('2027-02-04');
    await inst3.save();

    // App 4: Fuel Dispenser Submitted
    const app4 = await VerificationApplication.create({
      applicationNumber: 'VER-2026-000104',
      applicant: retailOwner._id,
      instrument: inst4._id,
      applicationType: 'NEW_VERIFICATION',
      submissionDate: new Date(),
      status: APPLICATION_STATUS.SUBMITTED,
      priority: 'NORMAL',
      applicantNotes: 'New dispensing unit installed at retail petrol pump.',
      statusHistory: [
        { status: 'SUBMITTED', changedBy: retailOwner._id, timestamp: new Date(), comment: 'Application submitted online' }
      ]
    });

    // App 5: Expired Certificate demo for inst5
    const expiredPastDate = new Date('2025-01-10');
    const expiredUntilDate = new Date('2026-01-09'); // already expired

    const certNumber5 = 'MET-CERT-2025-000088';
    const { qrDataUrl: qr5, verifyUrl: vUrl5 } = await generateCertificateQRCode(certNumber5);

    const cert5 = await Certificate.create({
      certificateNumber: certNumber5,
      application: app1._id, // placeholder
      instrument: inst5._id,
      owner: businessOwner._id,
      officer: lmoOfficer._id,
      gatc: gatcUser._id,
      issueDate: expiredPastDate,
      validFrom: expiredPastDate,
      validUntil: expiredUntilDate,
      verificationDate: expiredPastDate,
      status: CERTIFICATE_STATUS.EXPIRED,
      instrumentSnapshot: {
        instrumentId: inst5.instrumentId,
        categoryName: categories[3].name,
        instrumentType: inst5.instrumentType,
        manufacturer: inst5.manufacturer,
        model: inst5.model,
        serialNumber: inst5.serialNumber,
        capacity: inst5.capacity,
        unit: inst5.unit,
        accuracyClass: inst5.accuracyClass,
        location: inst5.location
      },
      verificationSummary: {
        maxObservedError: 0.0001,
        maxPermissibleError: 0.05,
        sealNumber: 'LM-SEAL-2025-Q1-5510',
        stampingQuarter: 'Q1',
        stampingYear: 2025
      },
      qrCodeDataUrl: qr5,
      qrVerificationUrl: vUrl5,
      remarks: 'Past verification cycle. Expired.'
    });

    inst5.currentCertificate = cert5._id;
    inst5.lastVerificationDate = expiredPastDate;
    inst5.nextVerificationDate = expiredUntilDate;
    inst5.status = INSTRUMENT_STATUS.EXPIRED;
    await inst5.save();

    console.log('[Seed] Created Applications and Certificates.');

    // 6. Create Notifications
    await Notification.create([
      {
        recipient: businessOwner._id,
        title: '📜 Certificate Issued: MET-CERT-2026-000101',
        message: 'Your verification certificate for Electronic Platform Scale is now active and valid until 14 Jan 2027.',
        type: 'SUCCESS',
        category: 'CERTIFICATE',
        relatedEntityId: cert1._id,
        link: '/certificates',
        isRead: false
      },
      {
        recipient: businessOwner._id,
        title: '⏳ Inspection Scheduled for Tomorrow',
        message: 'Inspection for Weighbridge (VER-2026-000102) has been scheduled for tomorrow at 14:30.',
        type: 'INFO',
        category: 'INSPECTION',
        relatedEntityId: app2._id,
        link: `/applications/${app2._id}`,
        isRead: false
      },
      {
        recipient: businessOwner._id,
        title: '⚠️ Re-verification Required: INS-2026-000105',
        message: 'Verification certificate for Precision Laboratory Micro-Balance has expired. Please submit a re-verification application.',
        type: 'ALERT',
        category: 'EXPIRY',
        relatedEntityId: inst5._id,
        link: `/instruments/${inst5._id}`,
        isRead: false
      },
      {
        recipient: lmoOfficer._id,
        title: '📋 Inspection Assignment: VER-2026-000102',
        message: 'Weighbridge inspection scheduled at Ananya Agro on site.',
        type: 'INFO',
        category: 'APPLICATION',
        relatedEntityId: app2._id,
        link: `/applications/${app2._id}`,
        isRead: false
      }
    ]);

    // 7. Create Audit Logs
    await AuditLog.create([
      {
        user: adminUser._id,
        userName: adminUser.name,
        userEmail: adminUser.email,
        role: adminUser.role,
        action: 'SYSTEM_INITIALIZED',
        entityType: 'SYSTEM',
        description: 'Metrya Legal Metrology Verification System database initialized with baseline rules and categories.',
        timestamp: new Date('2026-01-01')
      },
      {
        user: businessOwner._id,
        userName: businessOwner.name,
        userEmail: businessOwner.email,
        role: businessOwner.role,
        action: 'APPLICATION_SUBMITTED',
        entityType: 'APPLICATION',
        entityId: app1._id.toString(),
        description: `Submitted application ${app1.applicationNumber} for ${inst1.instrumentType}`,
        timestamp: new Date('2026-01-10')
      },
      {
        user: lmoOfficer._id,
        userName: lmoOfficer.name,
        userEmail: lmoOfficer.email,
        role: lmoOfficer.role,
        action: 'CERTIFICATE_GENERATED',
        entityType: 'CERTIFICATE',
        entityId: cert1._id.toString(),
        description: `Generated digital certificate ${cert1.certificateNumber} with verified QR code`,
        timestamp: new Date('2026-01-15')
      }
    ]);

    console.log('[Seed] Database seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedDatabase();
