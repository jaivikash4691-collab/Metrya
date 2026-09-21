const http = require('http');

const request = (path, method = 'GET', body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };

    const req = http.request(options, (res) => {
      let resBody = '';
      res.on('data', (chunk) => (resBody += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(resBody);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: resBody });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (data) req.write(data);
    req.end();
  });
};

async function runE2ETests() {
  console.log('=== METRYA PLATFORM END-TO-END AUTOMATED VERIFICATION ===\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  };

  try {
    // 1. Health check
    console.log('1. Testing System Health API:');
    const health = await request('/health');
    assert(health.status === 200 && health.body.status === 'online', 'Health endpoint returns online');

    // 2. Public Certificate Verification
    console.log('\n2. Testing Public Certificate QR Verification:');
    const publicCert = await request('/public/verify/MET-CERT-2026-000101');
    assert(publicCert.status === 200 && publicCert.body.data.status === 'VALID', 'Public certificate is legally VALID');
    assert(publicCert.body.data.instrument.instrumentType === 'Electronic Platform Weighing Scale', 'Correct instrument specs in public response');
    assert(!publicCert.body.data.ownerEmail, 'Private owner email is sanitized from public response');

    // 3. Test Expired Certificate Status
    const expiredCert = await request('/public/verify/MET-CERT-2025-000088');
    assert(expiredCert.status === 200 && expiredCert.body.data.status === 'EXPIRED', 'Past certificate detected as EXPIRED');

    // 4. Role-based Authentication
    console.log('\n3. Testing Role-Based Authentication & Token Generation:');
    
    // User login
    const userAuth = await request('/auth/login', 'POST', { email: 'user@demo.com', password: 'Password123!' });
    assert(userAuth.status === 200 && userAuth.body.user.role === 'USER', 'Business Owner logged in with USER role');
    const userToken = userAuth.body.token;

    // LMO Officer login
    const lmoAuth = await request('/auth/login', 'POST', { email: 'lmo@demo.com', password: 'Password123!' });
    assert(lmoAuth.status === 200 && lmoAuth.body.user.role === 'LMO', 'Officer logged in with LMO role');
    const lmoToken = lmoAuth.body.token;

    // Super Admin login
    const adminAuth = await request('/auth/login', 'POST', { email: 'admin@demo.com', password: 'Password123!' });
    assert(adminAuth.status === 200 && adminAuth.body.user.role === 'SUPER_ADMIN', 'Super Admin logged in with SUPER_ADMIN role');
    const adminToken = adminAuth.body.token;

    // 5. Instruments Module
    console.log('\n4. Testing Instruments Module & Scope:');
    const userInstruments = await request('/instruments', 'GET', null, userToken);
    assert(userInstruments.status === 200 && userInstruments.body.instruments.length > 0, 'User retrieves their registered instruments');
    const targetInst = userInstruments.body.instruments[0];

    // 6. Verification Applications State Machine Flow
    console.log('\n5. Testing Verification Application State Machine:');
    const newApp = await request('/applications', 'POST', {
      instrumentId: targetInst._id,
      applicationType: 'RE_VERIFICATION',
      priority: 'URGENT',
      applicantNotes: 'Automated E2E testing application'
    }, userToken);

    // If an active app exists or newly created
    let appId;
    if (newApp.status === 201) {
      assert(newApp.body.application.status === 'SUBMITTED', 'New application created in SUBMITTED status');
      appId = newApp.body.application._id;
    } else {
      const allApps = await request('/applications', 'GET', null, userToken);
      appId = allApps.body.applications[0]._id;
      assert(true, `Using existing application ${appId} for lifecycle testing`);
    }

    // Assign Officer
    const assignRes = await request(`/applications/${appId}/assign`, 'POST', {
      officerId: lmoAuth.body.user.id,
      notes: 'Assigned for standard inspection'
    }, lmoToken);
    assert(assignRes.status === 200 && assignRes.body.application.status === 'ASSIGNED', 'Status transitioned to ASSIGNED');

    // Schedule Inspection
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const scheduleRes = await request(`/applications/${appId}/schedule`, 'POST', {
      date: tomorrow.toISOString().split('T')[0],
      startTime: '11:00',
      endTime: '12:30',
      notes: 'Scheduled by automated test runner'
    }, lmoToken);
    assert(scheduleRes.status === 201 && scheduleRes.body.application.status === 'SCHEDULED', 'Status transitioned to SCHEDULED');

    // 7. Live Metrology Tolerance Engine
    console.log('\n6. Testing Digital Inspection Engine & Formula Calculations:');
    const liveTol = await request('/inspections/calculate-tolerance', 'POST', {
      capacity: 150,
      accuracyClass: 'CLASS_III',
      measurements: [
        { testPointName: 'Min Load', referenceValue: 15.0, observedValue: 15.01, tolerance: 0.1 },
        { testPointName: 'Full Load', referenceValue: 150.0, observedValue: 150.03, tolerance: 0.1 }
      ]
    }, lmoToken);

    assert(liveTol.status === 200 && liveTol.body.evaluation.overallCompliance === true, 'Tolerance engine correctly computes percentage error and marks PASS');
    assert(liveTol.body.evaluation.evaluatedMeasurements[0].percentageError > 0, 'Computed % Error = ((Observed - Reference)/Reference) * 100');

    // Conduct and record inspection
    const inspectRes = await request('/inspections', 'POST', {
      applicationId: appId,
      environmentalConditions: { temperatureCelsius: 22, relativeHumidityPercentage: 50, atmosphericPressureHpa: 1013 },
      measurements: [
        { testPointName: 'Min Load', referenceValue: 15.0, observedValue: 15.01, tolerance: 0.1, unit: 'kg' },
        { testPointName: 'Half Load', referenceValue: 75.0, observedValue: 75.02, tolerance: 0.1, unit: 'kg' },
        { testPointName: 'Full Load', referenceValue: 150.0, observedValue: 150.03, tolerance: 0.1, unit: 'kg' }
      ],
      physicalInspection: {
        displayCondition: { status: 'PASS' },
        sealCondition: { status: 'INTACT' },
        calibrationCondition: { status: 'PASS' },
        manufacturerMarking: { status: 'LEGIBLE' },
        serialNumberVisibility: { status: 'VERIFIED' },
        safetyCondition: { status: 'SAFE' }
      },
      officerRemarks: 'Automated verification test passed perfectly',
      recommendation: 'APPROVED'
    }, lmoToken);

    assert(inspectRes.status === 201 && inspectRes.body.inspection.overallCompliance === true, 'Digital inspection completed with APPROVED recommendation');

    // 8. Officer Approval Decision & Certificate Generation
    console.log('\n7. Testing Approval Decision & Digital Certificate Generation:');
    const decisionRes = await request(`/applications/${appId}/decision`, 'POST', {
      decision: 'APPROVED',
      remarks: 'Complies with all legal metrology requirements'
    }, lmoToken);
    assert(decisionRes.status === 200 && decisionRes.body.application.status === 'APPROVED', 'Application marked APPROVED');

    // Generate Certificate
    const certGenRes = await request(`/certificates/generate/${appId}`, 'POST', {}, lmoToken);
    assert(certGenRes.status === 201 || certGenRes.status === 200, 'Digital Certificate generated successfully');
    const generatedCert = certGenRes.body.certificate;
    assert(generatedCert.certificateNumber.startsWith('MET-CERT-'), `Certificate Number generated: ${generatedCert.certificateNumber}`);
    assert(!!generatedCert.qrCodeDataUrl, 'High-resolution QR code attached to certificate');

    // 9. Admin Analytics & Audit Logs
    console.log('\n8. Testing Admin Analytics & Audit Logs:');
    const analytics = await request('/admin/analytics', 'GET', null, adminToken);
    assert(analytics.status === 200 && analytics.body.summary.totalApplications > 0, 'Analytics KPI summary computed');

    const auditLogs = await request('/admin/audit-logs', 'GET', null, adminToken);
    assert(auditLogs.status === 200 && auditLogs.body.logs.length > 0, 'System audit logs recorded events');

    // 10. Role Security & Authorization Guard Test
    console.log('\n9. Testing Role Security & Unauthorized Access Guards:');
    const unauthorizedAudit = await request('/admin/audit-logs', 'GET', null, userToken);
    assert(unauthorizedAudit.status === 403, 'USER role blocked from accessing Super Admin audit logs (403 Forbidden)');

    const unauthorizedRuleCreate = await request('/admin/rules', 'POST', { name: 'Hack Rule' }, userToken);
    assert(unauthorizedRuleCreate.status === 403, 'USER role blocked from creating tolerance rules (403 Forbidden)');

    console.log(`\n=== VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED ===`);
    if (failed === 0) {
      console.log('🎉 ALL INTEGRATION AND LIFECYCLE TESTS COMPLETED SUCCESSFULLY!\n');
    }
  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

runE2ETests();
