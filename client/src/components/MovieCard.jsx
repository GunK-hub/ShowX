import { StarIcon, Heart } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import timeFormat from "../lib/timeFormat";
import { useAppContext } from "../context/AppContext";

const MovieCard = ({ movie, readOnly = false }) => {
  const navigate = useNavigate();
  const { favoriteMovies, toggleFavoriteLocal } = useAppContext();

  // 🔑 Normalize movie vs show
  const data = movie.movie ? movie.movie : movie;

  const isFavorite = favoriteMovies.some(
    (m) => m._id === data?._id
  );

  return (
    <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300">
      {/* IMAGE */}
      <img
        onClick={() => {
          navigate(`/movies/${data?._id}`);
          scrollTo(0, 0);
        }}
        src={
          data?.backdrop_path
            ? `https://image.tmdb.org/t/p/w500${data.backdrop_path}`
            : "/placeholder.png"
        }
        alt={data?.title || "Movie"}
        className="rounded-lg h-52 w-full object-cover cursor-pointer"
      />

      {/* TITLE */}
      <p className="font-semibold mt-2 truncate">
        {data?.title || data?.name || "Untitled"}
      </p>

      {/* META */}
      <p className="text-sm text-gray-400 mt-2">
        {data?.release_date
          ? new Date(data.release_date).getFullYear()
          : "—"}{" "}
        •{" "}
        {data?.genres?.slice(0, 2).map((g) => g.name).join(" | ") || "Unknown"}{" "}
        • {timeFormat(data?.runtime)}
      </p>

      <div className="flex items-center justify-between mt-4 pb-3">
        {/* BUY BUTTON */}
        <button
          onClick={() => {
            navigate(`/movies/${data?._id}`);
            scrollTo(0, 0);
          }}
          className="px-4 py-2 text-xs bg-purple-400/90 rounded-full font-medium"
        >
          Buy tickets
        </button>

        <div className="flex items-center gap-3">
          {/* FAVORITE */}
          {!readOnly && (
            <button
              onClick={() => toggleFavoriteLocal(data)}
              className="hover:scale-110 transition"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorite
                    ? "fill-pink-500 text-pink-500"
                    : "text-gray-400"
                }`}
              />
            </button>
          )}

          {/* RATING */}
          <p className="flex items-center gap-1 text-sm text-gray-400">
            <StarIcon className="w-4 h-4 text-primary fill-primary" />
            {data?.vote_average
              ? data.vote_average.toFixed(1)
              : "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
