const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define(
  'User',
  {
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: 'users',
    defaultScope: { attributes: { exclude: ['password'] } },
    scopes: { withPassword: { attributes: { include: ['password'] } } },
  }
);

const Patient = sequelize.define(
  'Patient',
  {
    name: { type: DataTypes.STRING(100), allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: false },
    phone: { type: DataTypes.STRING(20) },
    address: { type: DataTypes.TEXT },
    medicalHistory: { type: DataTypes.TEXT },
  },
  { tableName: 'patients' }
);

const Doctor = sequelize.define(
  'Doctor',
  {
    name: { type: DataTypes.STRING(100), allowNull: false },
    specialization: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150) },
    phone: { type: DataTypes.STRING(20) },
    experienceYears: { type: DataTypes.INTEGER },
  },
  { tableName: 'doctors' }
);

const Mapping = sequelize.define(
  'Mapping',
  {},
  {
    tableName: 'patient_doctor_mappings',
    indexes: [{ unique: true, fields: ['patientId', 'doctorId'] }],
  }
);

// Ownership
User.hasMany(Patient, { foreignKey: { name: 'createdBy', allowNull: false }, onDelete: 'CASCADE' });
Patient.belongsTo(User, { foreignKey: 'createdBy' });
User.hasMany(Doctor, { foreignKey: { name: 'createdBy', allowNull: false }, onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'createdBy' });

// Mapping (deleting a patient/doctor removes its mappings)
Patient.hasMany(Mapping, { foreignKey: { name: 'patientId', allowNull: false }, onDelete: 'CASCADE' });
Mapping.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });
Doctor.hasMany(Mapping, { foreignKey: { name: 'doctorId', allowNull: false }, onDelete: 'CASCADE' });
Mapping.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });

module.exports = { sequelize, User, Patient, Doctor, Mapping };
