const express = require("express");
const Bookings = require("../Models/Bookings");
const { check, validationResult } = require("express-validator");
const Movies = require("../Models/Movies");
const User = require("../Models/User");
const { default: mongoose } = require("mongoose");
const { verifyUserToken } = require("../Middlewares/verifyJWTToken");
const decryptToken = require("../Middlewares/decryptToken");

const bookingsRoutes = express.Router();

bookingsRoutes.param("id", async (req, res, next, value) => {
  try {
    const booking = await Bookings.findById(value);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "No such booking found" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

bookingsRoutes.post(
  "/addBooking",
  [
    check("seatNumber", "Seat Number is required").not().isEmpty(),
    check("date", "Date is required").not().isEmpty(),
  ],
  verifyUserToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { movie, seatNumber, date } = req.body;

      let user = decryptToken(
        req.headers.authorization.split(" ")[1],
        process.env.JWT_SECRET_USER
      ).id;

      let existingMovie = await Movies.findById(movie);
      let existingUser = await User.findById(user);

      if (!existingMovie) {
        return res
          .status(404)
          .json({ success: false, message: "Movie not found" });
      }
      if (!existingUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      let newBooking = new Bookings({
        movie,
        seatNumber,
        date: new Date(`${date}`),
        user,
      });
      const session = await mongoose.startSession();
      session.startTransaction();
      newBooking = await newBooking.save();

      existingUser.bookings.push(newBooking);
      existingMovie.bookings.push(newBooking);

      await existingUser.save({ session });
      await existingMovie.save({ session });
      await newBooking.save({ session });
      session.commitTransaction();

      return res.status(200).json({ success: true, newBooking });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

bookingsRoutes.get("/getBookings", async (req, res) => {
  try {
    const bookings = await Bookings.find();
    if (!bookings || bookings.length == 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found",
      });
    }
    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

bookingsRoutes.get("/getBooking/:id", async (req, res) => {
  try {
    let booking = await Bookings.findById(req.params.id);
    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

bookingsRoutes.delete("/deleteBooking/:id", async (req, res) => {
  try {
    let booking = await Bookings.findByIdAndRemove(req.params.id).populate('user movie');
    const session=await mongoose.startSession();
    session.startTransaction();
    
    return res
      .status(200)
      .json({
        success: true,
        message: "Booking deleted successfully.",
        booking,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = bookingsRoutes;

//What is session in mongoose?