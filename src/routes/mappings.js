const router = require('express').Router();
const { Mapping, Patient, Doctor } = require('../models');
const auth = require('../middleware/auth');
const { validate, mappingSchema } = require('../middleware/validate');
const { HttpError, asyncHandler, idParam } = require('../utils/helpers');

router.use(auth);
router.param('id', idParam);
router.param('patient_id', idParam);

const ownedPatient = async (id, userId) => {
  const patient = await Patient.findOne({ where: { id, createdBy: userId } });
  if (!patient) throw new HttpError(404, 'Patient not found');
  return patient;
};

// Assign a doctor to one of the user's patients
router.post(
  '/',
  validate(mappingSchema),
  asyncHandler(async (req, res) => {
    const { patientId, doctorId } = req.body;
    await ownedPatient(patientId, req.user.id);
    if (!(await Doctor.findByPk(doctorId))) throw new HttpError(404, 'Doctor not found');

    const existing = await Mapping.findOne({ where: { patientId, doctorId } });
    if (existing) throw new HttpError(409, 'This doctor is already assigned to this patient');

    const mapping = await Mapping.create({ patientId, doctorId });
    res.status(201).json(mapping);
  })
);

// All mappings for the user's patients
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const mappings = await Mapping.findAll({
      include: [
        { model: Patient, as: 'patient', where: { createdBy: req.user.id }, required: true },
        { model: Doctor, as: 'doctor', required: true },
      ],
      order: [['id', 'ASC']],
    });
    res.json(mappings);
  })
);

// All doctors assigned to a specific patient
router.get(
  '/:patient_id',
  asyncHandler(async (req, res) => {
    const patient = await ownedPatient(req.params.patient_id, req.user.id);
    const mappings = await Mapping.findAll({
      where: { patientId: patient.id },
      include: [{ model: Doctor, as: 'doctor', required: true }],
      order: [['id', 'ASC']],
    });
    res.json({
      patient: { id: patient.id, name: patient.name },
      doctors: mappings.map((m) => ({ mappingId: m.id, ...m.doctor.toJSON() })),
    });
  })
);

// Remove a doctor from a patient (by mapping id)
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const mapping = await Mapping.findByPk(req.params.id, {
      include: [{ model: Patient, as: 'patient' }],
    });
    if (!mapping || mapping.patient.createdBy !== req.user.id) {
      throw new HttpError(404, 'Mapping not found');
    }
    await mapping.destroy();
    res.json({ message: 'Doctor removed from patient successfully' });
  })
);

module.exports = router;
