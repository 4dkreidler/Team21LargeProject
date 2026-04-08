import express from "express";
import User from "../../models/user.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const router = express.Router();


// EMAIL TRANSPORT
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your_email@gmail.com",
    pass: "your_app_password" // use app password, NOT real password
  }
});


// =====================
// LOGIN
// =====================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.json({
        id: -1,
        firstName: "",
        lastName: "",
        error: "Invalid email/password"
      });
    }

    //  BLOCK if not verified
    if (!user.isVerified) {
      return res.json({
        id: -1,
        error: "Please verify your email before logging in"
      });
    }

    return res.json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      error: ""
    });

  } catch (err) {
    return res.json({ error: err.toString() });
  }
});


// =====================
// REGISTER
// =====================
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ error: "User already exists" });
    }

    //  Generate token
    const token = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      isVerified: false,
      verificationToken: token,
      verificationTokenExpires: Date.now() + 1000 * 60 * 30 // 30 mins
    });

    await newUser.save();

    //  Send email
    const verifyURL = `http://localhost:5173/verify?token=${token}`;

    await transporter.sendMail({
      to: email,
      subject: "Verify your email",
      html: `
        <h2>Email Verification</h2>
        <p>Click below to verify your account:</p>
        <a href="${verifyURL}">${verifyURL}</a>
      `
    });

    return res.json({ error: "" });

  } catch (err) {
    return res.json({ error: err.toString() });
  }
});


// =====================
// VERIFY EMAIL
// =====================
router.get("/verify", async (req, res) => {
  const { token } = req.query;

  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await user.save();

    return res.json({ success: true });

  } catch (err) {
    return res.status(500).json({ error: err.toString() });
  }
});

export default router;