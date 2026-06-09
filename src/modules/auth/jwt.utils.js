const jwt         = require('jsonwebtoken');
const { env }     = require('../../config/env');

const signToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiry,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = { signToken, verifyToken, decodeToken };