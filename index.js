const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");

const userRoutes = require("./Routes/userRoutes");
const adminRoutes = require("./Routes/adminRoutes");
const moviesRoutes = require("./Routes/movieRoutes");
const bookingsRoutes = require("./Routes/bookingRoute");

const app = express();

app.use(express.json());
app.use(morgan("tiny"));
app.use(cors());

require("dotenv").config();
mongoose
  .connect(process.env.MONGO_URI)
  .then((value) => {
    console.log("connected to Database.");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/user", userRoutes);
app.use("/admin", adminRoutes);
app.use("/movies", moviesRoutes);
app.use("/bookings", bookingsRoutes);

app.listen(5000, () => {
  console.log("App Connected at 5000");
});
