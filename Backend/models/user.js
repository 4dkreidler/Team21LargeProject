import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  validated: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  verificationTokenExpires: { type: Date, default: null }
});

const User = mongoose.model("User", userSchema);

export default User;
