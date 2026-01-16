import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

//api to get now playing movies from tmdb api
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
      headers: {Authorization : `Bearer ${process.env.TMDB_API_KEY}`}
    })

    const movies = data.results;
    res.json({ success: true, movies });
  } catch (error) {
    console.error(error)
    res.json({success:false, message: error.message})
  }
}

//api to add a new show to database

export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    let movie = await Movie.findOne({ tmdbId: movieId });

    if (!movie) {
      const [movieDetailsResponse, movieCreditsResponse] =
        await Promise.all([
          axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}`,
            {
              headers: {
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
              },
            }
          ),
          axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}/credits`,
            {
              headers: {
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
              },
            }
          ),
        ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      movie = await Movie.create({
        tmdbId: movieId,
        title: movieApiData.title,
        overview: movieApiData.overview,
        poster_path: movieApiData.poster_path, // ✅ FIXED
        backdrop_path: movieApiData.backdrop_path,
        genres: movieApiData.genres,
        casts: movieCreditsData.cast,
        release_date: movieApiData.release_date,
        original_language: movieApiData.original_language,
        tagline: movieApiData.tagline || "",
        vote_average: movieApiData.vote_average,
        runtime: movieApiData.runtime,
      });
    }

    const showsToCreate = [];

    showsInput.forEach((show) => {
      show.time.forEach((time) => {
        const dateTime = new Date(`${show.date}T${time}`);

        if (isNaN(dateTime.getTime())) {
          throw new Error("Invalid show date or time");
        }

        showsToCreate.push({
          movie: movie._id,
          showDateTime: dateTime,
          showPrice,
          occupiedSeats: {},
        });
      });
    });


    if (showsToCreate.length > 0) {
      await Show.insertMany(showsToCreate);
    }

    res.json({ success: true, message: "show added successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


// api to get all shows from the database

export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({
      showDateTime: { $gte: new Date() }
    })
      .populate("movie")
      .sort({ showDateTime: 1 });

    res.json({
      success: true,
      shows
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// api to get a single show from the database
export const getShow = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔴 FIX: find movie by MongoDB _id (NOT tmdbId)
    const movie = await Movie.findById(id);

    if (!movie) {
      return res.json({ success: false, message: "Movie not found" });
    }

    // get upcoming shows for this movie
    const shows = await Show.find({
      movie: movie._id,
      showDateTime: { $gte: new Date() },
    });

    const dateTime = {};

    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];

      if (!dateTime[date]) {
        dateTime[date] = [];
      }

      dateTime[date].push({
        time: show.showDateTime,
        showId: show._id,
      });
    });

    res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

