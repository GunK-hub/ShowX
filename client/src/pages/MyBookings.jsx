import React, { useEffect, useState } from "react";
import { dummyBookingData } from "../assets/assets";
import Loading from "../components/loading";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getMyBookings = async () => {
    setBookings(dummyBookingData);
    setIsLoading(false);
  };

  useEffect(() => {
    getMyBookings();
  }, []);

  return !isLoading ? (
    <div className="relative px-6 md:px-16 lg:px-40 pt-32 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />

      <h1 className="text-lg font-semibold mb-4 text-purple-100">
        My bookings
      </h1>

      {bookings.map((item, index) => (
        <div
          key={index}
          className="
            grid grid-cols-[auto_1fr_auto]
            gap-6 items-center
            max-w-4xl
            bg-purple-500/10 backdrop-blur-md
            border border-purple-400/20
            rounded-lg p-4 mt-4
          "
        >
          {/* LEFT: Poster */}
          <img
            src={item.show.movie.poster_path}
            alt={item.show.movie.title}
            className="w-20 h-28 object-cover rounded-md"
          />

          {/* CENTER: Movie info */}
          <div className="flex flex-col justify-center min-w-0">
            <p className="text-sm font-semibold text-purple-100 truncate">
              {item.show.movie.title}
            </p>

            <p className="text-xs text-purple-300">
              {timeFormat(item.show.movie.runtime)}
            </p>

            <p className="text-xs text-purple-400 mt-1">
              {dateFormat(item.show.showDateTime)}
            </p>
          </div>

          {/* RIGHT: Price + CTA + Seats */}
          <div className="flex flex-col items-end text-right whitespace-nowrap">
            <p className="text-xl font-semibold text-purple-100">
              {currency}{item.amount}
            </p>

            {!item.isPaid && (
              <button
                className="
                  mt-2 px-4 py-1.5
                  text-sm font-medium rounded-full
                  bg-purple-600/80 hover:bg-purple-600
                  transition
                "
              >
                Pay Now
              </button>
            )}

            <div className="mt-2 text-xs text-purple-300">
              <p>Total Tickets: {item.bookedSeats.length}</p>
              <p>Seat Number: {item.bookedSeats.join(", ")}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <Loading />
  );
};

export default MyBookings;
