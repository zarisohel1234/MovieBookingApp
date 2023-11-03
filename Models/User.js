const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  phone: {
    type: Number,
    required: true,
  },
  bookings: [
    {
      type: mongoose.Types.ObjectId,
      ref: "bookings",
    },
  ],
});
module.exports = mongoose.model("user", UserSchema);
