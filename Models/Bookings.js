const mongoose = require("mongoose");

const BookingScheema = mongoose.Schema({
  movie: {
    type: mongoose.Types.ObjectId,
    ref: "movies",
  },
  date: {
    type: Date,
    required: true,
  },
  seatNumber: {
    type: Number,
    required: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "users",
  },
});
module.exports = mongoose.model("bookings", BookingScheema);
