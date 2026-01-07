import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyDateTimeData, dummyShowsData } from "../assets/assets";
import { Heart, PlayCircleIcon, StarIcon } from "lucide-react";
import timeFormat from "../lib/timeFormat";
import BlurCircle from "../components/BlurCircle";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/loading";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [show, setShow] = useState(null);

  const getShow = async () => {
    const foundShow = dummyShowsData.find(
      (item) => String(item._id) === id
    );

    if (foundShow) {
      setShow({
        movie: foundShow,
        dateTime: dummyDateTimeData,
      });
    }
  };

  useEffect(() => {
    getShow();
  }, [id]);

  if (!show) {
    return <Loading />;
  }

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-36 md:pt-44">
      {/* Blur */}
      <BlurCircle top="-220px" left="-220px" className="z-0" />

      <div className="relative z-10 flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        {/* Poster */}
        <img
          src={show.movie.poster_path}
          alt={show.movie.title}
          className="w-[260px] md:w-[300px] aspect-[2/3] rounded-xl object-cover max-md:mx-auto shadow-lg"
        />

        {/* Details */}
        <div className="flex flex-col gap-3">
          <p className="text-primary">ENGLISH</p>

          <h1 className="text-4xl font-semibold max-w-96 text-balance">
            {show.movie.title}
          </h1>

          <div className="flex items-center gap-2 text-gray-300">
            <StarIcon className="w-5 h-5 text-primary fill-primary" />
            {show.movie.vote_average.toFixed(1)}
          </div>

          <p className="text-gray-400 mt-2 text-sm leading-tight max-w-xl">
            {show.movie.overview}
          </p>

          <p className="text-sm text-gray-300">
            {timeFormat(show.movie.runtime)} •{" "}
            {show.movie.genres.map((g) => g.name).join(", ")} •{" "}
            {show.movie.release_date.split("-")[0]}
          </p>

          {/* Buttons */}
          <div className="flex items-center flex-wrap gap-4 mt-4">
            <button className="flex items-center gap-2 px-7 py-3 text-sm bg-purple-800 hover:bg-purple-900 transition rounded-md font-medium active:scale-95">
              <PlayCircleIcon className="w-5 h-5" />
              Watch Trailer
            </button>

            {/* IMPORTANT: no anchor tag */}
            <button
              onClick={() =>
                document
                  .getElementById("dateSelect")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-10 py-3 text-sm bg-purple-800 hover:bg-purple-900 transition rounded-md font-medium active:scale-95"
            >
              Buy Tickets
            </button>

            <button className="p-3 rounded-md bg-purple-800 hover:bg-pink-500 transition active:scale-95">
              <Heart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Cast */}
      <p className="text-lg font-medium mt-28">Cast</p>
      <div className="overflow-x-auto no-scrollbar mt-8 pb-4">
        <div className="flex items-center gap-6 w-max px-4">
          {show.movie.casts.slice(0, 12).map((cast, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <img
                src={cast.profile_path}
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

      <DateSelect dateTime={show.dateTime} id={id} />

      <p className="text-lg font-medium mt-20 mb-8">You May Also Like</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {dummyShowsData.slice(0, 4).map((movie, index) => (
          <MovieCard key={index} movie={movie} />
        ))}
      </div>

      <div className="flex justify-center mt-20">
        <button
          onClick={() => {
            navigate("/movies");
            scrollTo(0, 0);
          }}
          className="px-10 py-3 text-sm bg-purple-800 hover:bg-purple-900 transition rounded-md font-medium"
        >
          Show More
        </button>
      </div>
    </div>
  );
};

export default MovieDetails;
