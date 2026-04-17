const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.createToken = function (user) {
  try {
    const accessToken = jwt.sign(
      {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        houseID: user.houseID || null
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "1h" }
    );

    return { accessToken };
  } catch (e) {
    return { error: e.message };
  }
};

exports.isExpired = function (token) {
  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return false;
  } catch (err) {
    return true;
  }
};

exports.refresh = function (token) {
  try {
    const decoded = jwt.decode(token);
    return exports.createToken(decoded);
  } catch (e) {
    return { error: e.message };
  }
};