const mongoose = require("mongoose");

const MoviesScheema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  posterUrl: {
    type: String,
    required: true,
  },
  featured: {
    type: Boolean,
  },
  actors: [
    {
      type: String,
      required: true,
    },
  ],
  bookings: [
    {
      type: mongoose.Types.ObjectId,
      ref: "bookings",
    },
  ],
  admin: {
    type: mongoose.Types.ObjectId,
    ref: "admins",
    required: true,
  },
});

module.exports = mongoose.model("movies", MoviesScheema);
