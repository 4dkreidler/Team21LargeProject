// Login API

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const token = require('../utils/createJWT');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email, password: password });

    if (!user) {
      return res.status(200).json({ error: "Email/Password incorrect" });
    }

    let ret;
    try {
      ret = token.createToken(
        user.firstName,
        user.lastName,
        user.userID
      );
    } catch (e) {
      ret = { error: e.message };
    }

    res.status(200).json(ret);
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

module.exports = router;