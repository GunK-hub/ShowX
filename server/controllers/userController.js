// api controller function to get user bookings

import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js";
import Movie from "../models/Movie.js";

export const getUserBookings = async (req, res) => {
  try {
    const user = req.auth().userId;

    const bookings = await Booking.find({user}).populate({
      path: "show",
      populate: {path: "movie"}
    }).sort({createdAt: -1})
    res.json({success: true, bookings})
  } catch (error) {
    console.error(error.message);
    res.json({success: false, message: error.message});
  }
}

//api controller function to update favorite movie in clerk metadata
export const updateFavorite = async (req, res) => {
  try {
    const {movieId} = req.body
    const userId = req.auth().userId;

    const user = await clerkClient.users.getUser(userId)
    if(!user.privateMetadata.favorites) {
      user.privateMetadata.favorites = []
    }

    if(!user.privateMetadata.favorites.includes(movieId)){
      user.privateMetadata.favorites.push(movieId)
    } else {
      user.privateMetadata.favorites = user.privateMetadata.favorites.filter(item => item !== movieId)
    }

    await clerkClient.users.updateUserMetadata(userId, {privateMetadata:user.privateMetadata})
    res.json({success:true, message: "favorite movies updated"})
  }
  
  catch (error) {
    console.error(error.message);
    res.json({success: false, message: error.message});
  }
}

export const getFavorites = async(req, res) => {
  try {
    const user = await clerkClient.users.getUser(req.auth().userId)
    const favorites = user.privateMetadata.favorites;

    // getting movies from database

    const movies = await Movie.find({
    tmdbId: { $in: favorites }
    })
    res.json({success: true, movies})
  } catch (error) {
    console.error(error.message);
    res.json({success: false, message: error.message});
  }
}