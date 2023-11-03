const express = require("express");
const Admin = require("../Models/Admin");
const bcrypt = require("bcryptjs");
const { check, validationResult } = require("express-validator");
const generateToken = require("../Middlewares/jwtGenerateToken");

const adminRoutes = express.Router();

adminRoutes.post(
  "/signup",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password must contain at least 6 letters").isLength({
      min: 6,
      max: 20,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, errors: errors.array() });
      }
      const { name, email, password } = req.body;
      let existing = await Admin.findOne({ email: email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Email already exists .Please Sign In",
        });
      }
      const hashedPassword = bcrypt.hashSync(password);
      let user = new Admin({
        name,
        email,
        password: hashedPassword,
      });
      user = user.save();
      if (!user) {
        return res.status(500).json({
          success: false,
          message: "Some error occured while creating admin",
        });
      }
      return res
        .status(201)
        .json({ success: true, message: "Admin SignUp successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

adminRoutes.post(
  "/login",
  [
    check("email", "Email is required").isEmail(),
    check("password", "Password must contain at least 6 letters").isLength({
      min: 6,
      max: 20,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, errors: errors.array() });
      }
      let user = await Admin.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No such Admin available .Please Signup",
        });
      } else {
        const isMatch = bcrypt.compareSync(req.body.password, user.password);
        if (!isMatch) {
          return res
            .status(400)
            .json({ success: false, message: "Invalid password" });
        }
        const token = generateToken(
          { id: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET
        );
        return res
          .status(200)
          .json({ success: true, user, message: "Successfully Login", token });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

adminRoutes.get("/getAllAdmins", async (req, res) => {
  try {
    let adminList = await Admin.find({}, "email addedMovies");
    if (!adminList || adminList.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "No admin present." });
    }
    return res.status(200).json({ success: true, adminList });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = adminRoutes;
