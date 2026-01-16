import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import timeFormat from "../lib/timeFormat";
import BlurCircle from "../components/BlurCircle";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/loading";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    shows,
    axios,
    getToken,
    user,
    favoriteMovies,
    toggleFavoriteLocal,
    image_base_url,
  } = useAppContext();

  // 🔹 Fetch single show
  const fetchShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`);
      if (data?.success) {
        setShow(data);
      } else {
        toast.error("Movie not found");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load movie");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShow();
  }, [id]);

  if (loading || !show || !show.movie) {
    return <Loading />;
  }

  const movie = show.movie;

  const isFavorite = favoriteMovies?.some(
    (fav) => fav._id === movie._id
  );

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-36 md:pt-44">
      <BlurCircle top="-220px" left="-220px" className="z-0" />

      {/* MOVIE INFO */}
      <div className="relative z-10 flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        {/* Poster */}
        <img
          src={
            movie.poster_path
              ? image_base_url + movie.poster_path
              : "/placeholder.png"
          }
          alt={movie.title}
          className="w-[260px] md:w-[300px] aspect-[2/3] rounded-xl object-cover max-md:mx-auto shadow-lg"
        />

        {/* Details */}
        <div className="flex flex-col gap-3">
          <p className="text-primary uppercase">
            {movie.original_language || "EN"}
          </p>

          <h1 className="text-4xl font-semibold max-w-96">
            {movie.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {movie.vote_average?.toFixed(1) || "N/A"}
          </div>

          <p className="text-gray-400 mt-2 text-sm max-w-xl">
            {movie.overview}
          </p>

          <p className="text-sm text-gray-300">
            {timeFormat(movie.runtime)} •{" "}
            {movie.genres?.map((g) => g.name).join(", ")} •{" "}
            {movie.release_date?.split("-")[0]}
          </p>

          {/* Buttons */}
          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 bg-purple-800 hover:bg-purple-900 rounded-md">
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("dateSelect")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-10 py-3 bg-purple-800 hover:bg-purple-900 rounded-md"
            >
              Buy Tickets
            </button>

            {/* ❤️ Favorite */}
            <button
              onClick={() => {
                if (!user) return toast.error("Login required");
                toggleFavoriteLocal(movie);
              }}
              className="p-3 rounded-md bg-purple-800 hover:bg-pink-500 transition"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite ? "fill-pink-500 text-pink-500" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* CAST */}
      {movie.casts?.length > 0 && (
        <>
          <p className="text-lg font-medium mt-28">Cast</p>
          <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
            <div className="flex gap-6 w-max px-4">
              {movie.casts.slice(0, 12).map((cast, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
                  <img
                    src={
                      cast.profile_path
                        ? image_base_url + cast.profile_path
                        : "/avatar.png"
                    }
                    alt={cast.name}
                    className="rounded-full h-20 w-20 object-cover"
                  />
                  <p className="mt-2 text-xs max-w-[80px] truncate">
                    {cast.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* DATE SELECT */}
      <DateSelect dateTime={show.dateTime} id={id} />

      {/* YOU MAY ALSO LIKE */}
      <p className="text-lg font-medium mt-20 mb-8">
        You May Also Like
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {shows
          .filter((item) => item && item.movie)
          .slice(0, 4)
          .map((item) => (
            <MovieCard key={item._id} movie={item} />
          ))}
      </div>

      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 bg-purple-800 hover:bg-purple-900 rounded-md"
        >
          Show More
        </button>
      </div>
    </div>
  );
};

export default MovieDetails;
