const express = require("express");
const User = require("../Models/User");
const userRouter = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const generateToken = require("../Middlewares/jwtGenerateToken");

//Get all users
userRouter.get("/", async (req, res) => {
  try {
    let users = await User.find({}, "name email phone bookings");
    if (!users || users.length == 0) {
      return res
        .status(404)
        .json({ success: false, message: "No users found" });
    }
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

//User SignUp
userRouter.post(
  "/signup",
  [
    check("name", "Valid name is required").isLength({ min: 3, max: 50 }),
    check("email", "Email is required").isEmail(),
    check("password", "Password must contain at least 6 letters").isLength({
      min: 6,
      max: 20,
    }),
    check("phone", "Mobile Number must be 10 digits")
      .isNumeric()
      .isLength({ min: 10, max: 10 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, errors: errors.array() });
      }
      let hashedPassword = bcrypt.hashSync(req.body.password);
      let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        phone: req.body.phone,
      });
      newUser = await newUser.save();
      if (!newUser) {
        return res
          .status(400)
          .json({ success: false, message: "Error occured " });
      }
      return res
        .status(201)
        .json({ success: true, newUser, message: " SignUp Successfull" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

userRouter.put(
  "/updateUser/:id",
  [
    check("name", "Valid name is required").isLength({ min: 3, max: 50 }),
    check("email", "Email is required").isEmail(),
    check("password", "Password must contain at least 6 letters").isLength({
      min: 6,
      max: 20,
    }),
    check("phone", "Mobile Number must be 10 digits")
      .isNumeric()
      .isLength({ min: 10, max: 10 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, errors: errors.array() });
      }
      const id = req.params.id;
      let user = await User.findById(id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      const hashedPassword = bcrypt.hashSync(req.body.password);
      let updatedUser = await User.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        phone: req.body.phone,
      });
      updatedUser = await updatedUser.save();
      if (!updatedUser) {
        return res
          .status(400)
          .json({ success: false, message: "Error occured " });
      }
      return res.status(201).json({
        success: true,
        updatedUser,
        message: "Your profile updated successfully.",
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

userRouter.delete("/deleteUser/:id", async (req, res) => {
  try {
    const id = req.params.id;
    let user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    let deletedUser = await User.findByIdAndRemove(id);
    if (!deletedUser) {
      return res.status(400).json({ success: false, message: "" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Profile successfully deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

//Login
userRouter.post(
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
      let user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Email not found .Please Signup",
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
          process.env.JWT_SECRET_USER
        );
        return res
          .status(200)
          .json({ success: true, user, token, message: "Successfully Login" });
      }
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);
module.exports = userRouter;
