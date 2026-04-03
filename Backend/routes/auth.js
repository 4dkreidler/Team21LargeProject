import express from "express";
import User from "../../models/user.js"; // adjust path if needed

const router = express.Router();


// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, password });

    // user not found
    if (!user) {
      return res.json({
        id: -1,
        firstName: "",
        lastName: "",
        error: "Invalid email/password"
      });
    }

    // success
    return res.json({
      id: user._id, // MongoDB ID
      firstName: user.firstName,
      lastName: user.lastName,
      error: ""
    });

    // FUTURE (JWT will go here)
    // const token = createJWT(...)
    // return res.json({ token })

  } catch (err) {
    return res.json({ error: err.toString() });
  }
});


// REGISTER
router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // check if user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ error: "User already exists" });
    }

    // create user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password
    });

    await newUser.save();

    return res.json({ error: "" });

    // FUTURE: return token here too

  } catch (err) {
    return res.json({ error: err.toString() });
  }
});

export default router;