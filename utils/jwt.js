const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

const signToken = (payload, options = {}) => {
  return jwt.sign(payload, SECRET, {
    expiresIn: "1h",
    ...options,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

module.exports = {
  signToken,
  verifyToken,
};