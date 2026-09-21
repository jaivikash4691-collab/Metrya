const VerificationRule = require('../models/VerificationRule');

/**
 * Calculates error and validates measurement compliance
 * Formula:
 * Error = Observed - Reference
 * % Error = ((Observed - Reference) / Reference) * 100
 */
const calculateMeasurement = (referenceValue, observedValue, tolerance, errorMethod = 'PERCENTAGE') => {
  const ref = parseFloat(referenceValue);
  const obs = parseFloat(observedValue);
  const tol = parseFloat(tolerance);

  const error = Number((obs - ref).toFixed(4));
  const percentageError = ref !== 0 ? Number((((obs - ref) / ref) * 100).toFixed(4)) : 0;

  let isPass = false;
  if (errorMethod === 'ABSOLUTE') {
    isPass = Math.abs(error) <= tol;
  } else {
    // Default percentage tolerance check
    isPass = Math.abs(percentageError) <= tol;
  }

  return {
    referenceValue: ref,
    observedValue: obs,
    error,
    percentageError,
    tolerance: tol,
    pass: isPass
  };
};

/**
 * Live evaluation of an entire test dataset against category/rule
 */
const evaluateInspection = async ({ categoryId, accuracyClass, capacity, measurements, physicalInspection }) => {
  let rule = null;
  if (categoryId) {
    rule = await VerificationRule.findOne({
      category: categoryId,
      $or: [{ accuracyClass }, { accuracyClass: 'ALL' }],
      minCapacity: { $lte: capacity },
      maxCapacity: { $gte: capacity },
      isActive: true
    });
  }

  const defaultTolerancePercentage = rule ? rule.maxPermissibleErrorPercentage : 0.1; // 0.1% default MPE
  const errorMethod = rule ? rule.errorCalculationMethod : 'PERCENTAGE';

  const evaluatedMeasurements = measurements.map((m) => {
    const tol = m.tolerance !== undefined && m.tolerance !== null ? m.tolerance : defaultTolerancePercentage;
    const calc = calculateMeasurement(m.referenceValue, m.observedValue, tol, errorMethod);
    return {
      testPointName: m.testPointName || 'Verification Point',
      unit: m.unit || 'kg',
      remarks: m.remarks || '',
      ...calc
    };
  });

  const allMeasurementsPassed = evaluatedMeasurements.every((m) => m.pass === true);

  // Check physical conditions
  let physicalPassed = true;
  if (physicalInspection) {
    if (physicalInspection.displayCondition && physicalInspection.displayCondition.status === 'FAIL') physicalPassed = false;
    if (physicalInspection.sealCondition && physicalInspection.sealCondition.status === 'BROKEN') physicalPassed = false;
    if (physicalInspection.calibrationCondition && physicalInspection.calibrationCondition.status === 'FAIL') physicalPassed = false;
    if (physicalInspection.manufacturerMarking && physicalInspection.manufacturerMarking.status === 'MISSING') physicalPassed = false;
    if (physicalInspection.serialNumberVisibility && physicalInspection.serialNumberVisibility.status === 'MISMATCH') physicalPassed = false;
    if (physicalInspection.safetyCondition && physicalInspection.safetyCondition.status === 'UNSAFE') physicalPassed = false;
  }

  const overallCompliance = allMeasurementsPassed && physicalPassed;

  return {
    evaluatedMeasurements,
    allMeasurementsPassed,
    physicalPassed,
    overallCompliance,
    appliedRule: rule ? { id: rule._id, name: rule.name, mpe: rule.maxPermissibleErrorPercentage } : null
  };
};

module.exports = {
  calculateMeasurement,
  evaluateInspection
};
