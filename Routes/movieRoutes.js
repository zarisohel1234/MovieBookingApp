const express = require("express");
const Movies = require("../Models/Movies");
const { verifyAdminToken } = require("../Middlewares/verifyJWTToken");
const { check, validationResult } = require("express-validator");
const decryptToken = require("../Middlewares/decryptToken");
const mongoose = require("mongoose");
const Admin = require("../Models/Admin");

const moviesRoutes = express.Router();

moviesRoutes.param("id", async (req, res, next, value) => {
  try {
    const movie = await Movies.findById(value);
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "No such movie found" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

moviesRoutes.post(
  "/addMovie",
  [
    check("title", "Title is required").not().isEmpty(),
    check("description", "Description is required").not().isEmpty(),
    check("releaseDate", "Release Date is required").not().isEmpty(),
    check("posterUrl", "Poster Url is required").not().isEmpty(),
    check("featured", "Featured is required").not().isEmpty(),
  ],
  verifyAdminToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ success: false, errors: errors.array() });
      } else {
        const { title, description, releaseDate, posterUrl, featured } =
          req.body;

        let movieAdmin = decryptToken(
          req.headers.authorization.split(" ")[1],
          process.env.JWT_SECRET
        ).id;
        console.log(movieAdmin);

        let movie = new Movies({
          title,
          description,
          releaseDate: new Date(`${releaseDate}`),
          posterUrl,
          featured,
          admin: movieAdmin,
        });

        const session = await mongoose.startSession();
        let admin = await Admin.findById(movieAdmin);

        if (!admin) {
          return res
            .status(404)
            .json({ success: false, message: "Admin not found." });
        }

        session.startTransaction();
        await movie.save({ session });
        await admin.addedMovies.push(movie);
        await admin.save({ session });
        await session.commitTransaction();

        console.log(movie);
        if (!movie) {
          return res
            .status(400)
            .json({ success: false, message: "Some error occured" });
        }
        return res
          .status(201)
          .json({ success: true, movie, message: "Movie added Successfully." });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

moviesRoutes.delete("/deleteMovie/:id", verifyAdminToken, async (req, res) => {
  try {
    const id = req.params.id;
    const movie = await Movies.findByIdAndRemove(id);
    const session = await mongoose.startSession();
    let admin = await Admin.findById(movieAdmin);
    return res
      .status(202)
      .json({ success: true, message: "Movie deleted Successfully.", movie });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

moviesRoutes.get("/getMovies", async (req, res) => {
  try {
    const movies = await Movies.find();
    if (!movies || movies.length == 0) {
      return res.status(404).json({
        success: false,
        message: "No movies found",
      });
    }
    return res.status(200).json({ success: true, movies });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

moviesRoutes.get("/getMovie/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const movie = await Movies.findById(id);
    return res.status(200).json({ success: true, movie });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = moviesRoutes;
