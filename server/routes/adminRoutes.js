import express from "express";
import { protectAdmin } from "../middleware/auth.js";
import {
  isAdmin,
  getDashboardData,
  getAllShows,
  getAllBookings,
} from "../controllers/adminController.js";

import { addShow } from "../controllers/showController.js";

const adminRouter = express.Router();

// auth check
adminRouter.get("/is-admin", protectAdmin, isAdmin);

// dashboard
adminRouter.get("/dashboard", protectAdmin, getDashboardData);

// shows
adminRouter.get("/shows", protectAdmin, getAllShows);
adminRouter.post("/add-show", protectAdmin, addShow);

// bookings
adminRouter.get("/bookings", protectAdmin, getAllBookings);

export default adminRouter;
