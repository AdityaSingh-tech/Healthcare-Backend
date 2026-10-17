const router = require('express').Router();
const { Patient } = require('../models');
const auth = require('../middleware/auth');
const { validate, patientSchema } = require('../middleware/validate');
const { HttpError, asyncHandler, idParam } = require('../utils/helpers');

router.use(auth);
router.param('id', idParam);

const findOwned = async (id, userId) => {
  const patient = await Patient.findOne({ where: { id, createdBy: userId } });
  if (!patient) throw new HttpError(404, 'Patient not found');
  return patient;
};

router.post(
  '/',
  validate(patientSchema(true)),
  asyncHandler(async (req, res) => {
    const patient = await Patient.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(patient);
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const patients = await Patient.findAll({
      where: { createdBy: req.user.id },
      order: [['id', 'ASC']],
    });
    res.json(patients);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await findOwned(req.params.id, req.user.id));
  })
);

router.put(
  '/:id',
  validate(patientSchema(false)),
  asyncHandler(async (req, res) => {
    const patient = await findOwned(req.params.id, req.user.id);
    await patient.update(req.body);
    res.json(patient);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const patient = await findOwned(req.params.id, req.user.id);
    await patient.destroy();
    res.json({ message: 'Patient deleted successfully' });
  })
);

module.exports = router;
