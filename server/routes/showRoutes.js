import express from "express";
import {
  addShow,
  getShow,
  getShows,
  getNowPlayingMovies,
} from "../controllers/showController.js";
import { protectAdmin } from "../middleware/auth.js";

const showRouter = express.Router();

// 🎬 Admin – TMDB now playing
showRouter.get("/now-playing", protectAdmin, getNowPlayingMovies);

// 🎟 Admin – add show
showRouter.post("/add", protectAdmin, addShow);

// 📽 Public – all upcoming shows
showRouter.get("/all", getShows);

// 🎬 Public – single show by SHOW _id
showRouter.get("/:id", getShow);

export default showRouter;
