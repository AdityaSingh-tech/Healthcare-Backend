const router = require('express').Router();
const { Doctor } = require('../models');
const auth = require('../middleware/auth');
const { validate, doctorSchema } = require('../middleware/validate');
const { HttpError, asyncHandler, idParam } = require('../utils/helpers');

router.use(auth);
router.param('id', idParam);

// Any authenticated user can view doctors; only the creator can modify/delete.
const findById = async (id) => {
  const doctor = await Doctor.findByPk(id);
  if (!doctor) throw new HttpError(404, 'Doctor not found');
  return doctor;
};

const findOwned = async (id, userId) => {
  const doctor = await findById(id);
  if (doctor.createdBy !== userId) {
    throw new HttpError(403, 'You can only modify doctors you created');
  }
  return doctor;
};

router.post(
  '/',
  validate(doctorSchema(true)),
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(doctor);
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    res.json(await Doctor.findAll({ order: [['id', 'ASC']] }));
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(await findById(req.params.id));
  })
);

router.put(
  '/:id',
  validate(doctorSchema(false)),
  asyncHandler(async (req, res) => {
    const doctor = await findOwned(req.params.id, req.user.id);
    await doctor.update(req.body);
    res.json(doctor);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const doctor = await findOwned(req.params.id, req.user.id);
    await doctor.destroy();
    res.json({ message: 'Doctor deleted successfully' });
  })
);

module.exports = router;
