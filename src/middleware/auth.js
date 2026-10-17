const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { HttpError, asyncHandler } = require('../utils/helpers');

module.exports = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Authentication required. Use "Authorization: Bearer <token>"');
  }
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    throw new HttpError(401, 'Invalid or expired token');
  }
  const user = await User.findByPk(payload.id);
  if (!user) throw new HttpError(401, 'User no longer exists');
  req.user = user;
  next();
});
