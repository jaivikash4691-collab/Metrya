const Instrument = require('../models/Instrument');
const InstrumentCategory = require('../models/InstrumentCategory');
const VerificationApplication = require('../models/VerificationApplication');
const { generateInstrumentId } = require('../utils/idGenerator');
const { logAuditEvent } = require('../utils/auditLogger');
const { ROLES, INSTRUMENT_STATUS } = require('../config/constants');

// @desc    Get all instruments (with filter, search, pagination)
// @route   GET /api/instruments
// @access  Private
const getInstruments = async (req, res, next) => {
  try {
    const { category, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    // Scope for business owners
    if (req.user.role === ROLES.USER) {
      query.owner = req.user._id;
    }

    if (category) query.category = category;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { instrumentId: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { instrumentType: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Instrument.countDocuments(query);

    const instruments = await Instrument.find(query)
      .populate('category', 'name code icon standardVerificationFrequencyMonths')
      .populate('owner', 'name email organization phone')
      .populate('currentCertificate', 'certificateNumber validFrom validUntil status qrCodeDataUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: instruments.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      instruments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single instrument by ID
// @route   GET /api/instruments/:id
// @access  Private
const getInstrumentById = async (req, res, next) => {
  try {
    const instrument = await Instrument.findById(req.params.id)
      .populate('category')
      .populate('owner', 'name email organization phone businessRegistrationNumber address')
      .populate('currentCertificate');

    if (!instrument) {
      return res.status(404).json({
        success: false,
        message: 'Instrument not found'
      });
    }

    // Role ownership check
    if (req.user.role === ROLES.USER && instrument.owner._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this instrument.'
      });
    }

    // Fetch verification history for this instrument
    const applications = await VerificationApplication.find({ instrument: instrument._id })
      .populate('assignedOfficer', 'name email jurisdiction')
      .populate('assignedGATC', 'name gatcCentreName')
      .populate('certificate', 'certificateNumber validFrom validUntil status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      instrument,
      verificationHistory: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new instrument
// @route   POST /api/instruments
// @access  Private (USER, SUPER_ADMIN)
const createInstrument = async (req, res, next) => {
  try {
    const {
      category,
      instrumentType,
      manufacturer,
      model,
      serialNumber,
      capacity,
      accuracyClass,
      unit,
      leastCount,
      facilityName,
      address,
      city,
      state,
      pincode,
      purchaseDate,
      installationDate,
      verificationFrequencyMonths
    } = req.body;

    // Check duplicate serial number within manufacturer
    const existingSerial = await Instrument.findOne({
      manufacturer: { $regex: new RegExp(`^${manufacturer}$`, 'i') },
      serialNumber: { $regex: new RegExp(`^${serialNumber}$`, 'i') }
    });

    if (existingSerial) {
      return res.status(400).json({
        success: false,
        message: `An instrument with serial number "${serialNumber}" by manufacturer "${manufacturer}" is already registered.`
      });
    }

    const instrumentId = generateInstrumentId();

    // Handle document file uploads if provided
    let documents = {};
    if (req.files) {
      if (req.files.instrumentPhoto && req.files.instrumentPhoto[0]) {
        documents.instrumentPhoto = `/uploads/${req.files.instrumentPhoto[0].filename}`;
      }
      if (req.files.previousCertificate && req.files.previousCertificate[0]) {
        documents.previousCertificate = `/uploads/${req.files.previousCertificate[0].filename}`;
      }
      if (req.files.invoiceDocument && req.files.invoiceDocument[0]) {
        documents.invoiceDocument = `/uploads/${req.files.invoiceDocument[0].filename}`;
      }
    }

    const instrument = await Instrument.create({
      instrumentId,
      owner: req.user._id,
      category,
      instrumentType,
      manufacturer,
      model,
      serialNumber,
      capacity: Number(capacity),
      accuracyClass: accuracyClass || 'CLASS_III',
      unit: unit || 'kg',
      leastCount: leastCount ? Number(leastCount) : 1,
      location: {
        facilityName,
        address,
        city,
        state,
        pincode
      },
      purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
      installationDate: installationDate ? new Date(installationDate) : undefined,
      verificationFrequencyMonths: verificationFrequencyMonths ? Number(verificationFrequencyMonths) : 12,
      status: INSTRUMENT_STATUS.REGISTERED,
      documents
    });

    await logAuditEvent({
      req,
      user: req.user,
      action: 'INSTRUMENT_REGISTERED',
      entityType: 'INSTRUMENT',
      entityId: instrument._id,
      description: `Registered instrument ${instrument.instrumentId} (${instrument.instrumentType} - ${instrument.serialNumber})`
    });

    const populatedInstrument = await Instrument.findById(instrument._id).populate('category');

    res.status(201).json({
      success: true,
      message: 'Instrument registered successfully',
      instrument: populatedInstrument
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update instrument details
// @route   PUT /api/instruments/:id
// @access  Private
const updateInstrument = async (req, res, next) => {
  try {
    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) {
      return res.status(404).json({ success: false, message: 'Instrument not found' });
    }

    if (req.user.role === ROLES.USER && instrument.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this instrument.' });
    }

    const {
      instrumentType,
      manufacturer,
      model,
      capacity,
      accuracyClass,
      unit,
      leastCount,
      facilityName,
      address,
      city,
      state,
      pincode
    } = req.body;

    if (instrumentType) instrument.instrumentType = instrumentType;
    if (manufacturer) instrument.manufacturer = manufacturer;
    if (model) instrument.model = model;
    if (capacity) instrument.capacity = Number(capacity);
    if (accuracyClass) instrument.accuracyClass = accuracyClass;
    if (unit) instrument.unit = unit;
    if (leastCount) instrument.leastCount = Number(leastCount);

    if (facilityName || address || city || state || pincode) {
      instrument.location = {
        facilityName: facilityName || instrument.location?.facilityName,
        address: address || instrument.location?.address,
        city: city || instrument.location?.city,
        state: state || instrument.location?.state,
        pincode: pincode || instrument.location?.pincode
      };
    }

    await instrument.save();

    res.json({
      success: true,
      message: 'Instrument updated successfully',
      instrument
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete instrument
// @route   DELETE /api/instruments/:id
// @access  Private
const deleteInstrument = async (req, res, next) => {
  try {
    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) {
      return res.status(404).json({ success: false, message: 'Instrument not found' });
    }

    if (req.user.role === ROLES.USER && instrument.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this instrument.' });
    }

    // Check if active verification application exists
    const activeApp = await VerificationApplication.findOne({
      instrument: instrument._id,
      status: { $in: ['SUBMITTED', 'UNDER_REVIEW', 'ASSIGNED', 'SCHEDULED', 'INSPECTION_IN_PROGRESS'] }
    });

    if (activeApp) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete instrument with an active verification application in progress.'
      });
    }

    await Instrument.findByIdAndDelete(req.params.id);

    await logAuditEvent({
      req,
      user: req.user,
      action: 'INSTRUMENT_DELETED',
      entityType: 'INSTRUMENT',
      entityId: req.params.id,
      description: `Deleted instrument ${instrument.instrumentId}`
    });

    res.json({
      success: true,
      message: 'Instrument deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get instrument categories
// @route   GET /api/instruments/categories
// @access  Public / Authenticated
const getCategories = async (req, res, next) => {
  try {
    const categories = await InstrumentCategory.find({ isActive: true }).sort({ name: 1 });
    res.json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create instrument category (Admin)
// @route   POST /api/instruments/categories
// @access  Private (SUPER_ADMIN)
const createCategory = async (req, res, next) => {
  try {
    const { name, code, description, standardVerificationFrequencyMonths, applicableClasses, icon } = req.body;

    const category = await InstrumentCategory.create({
      name,
      code: code.toUpperCase(),
      description,
      standardVerificationFrequencyMonths: standardVerificationFrequencyMonths || 12,
      applicableClasses: applicableClasses || ['CLASS_III'],
      icon: icon || 'Scale'
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInstruments,
  getInstrumentById,
  createInstrument,
  updateInstrument,
  deleteInstrument,
  getCategories,
  createCategory
};
