const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createToken = function (fn, ln, id) {
  try {
    const user = { userId: id, firstName: fn, lastName: ln };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

    return { accessToken };
  } catch (e) {
    return { error: e.message };
  }
};

exports.isExpired = function (token) {
  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return false;
  } catch {
    return true;
  }
};

exports.refresh = function (token) {
  const decoded = jwt.decode(token);
  return this.createToken(
    decoded.firstName,
    decoded.lastName,
    decoded.userId
  );
};