const jwt = require("jsonwebtoken");

const SECRET = "jwt_secret_key";

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