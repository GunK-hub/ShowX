import React, { useEffect, useState } from "react";
import Loading from "../components/loading";
import BlurCircle from "../components/BlurCircle";
import timeFormat from "../lib/timeFormat";
import { dateFormat } from "../lib/dateFormat";
import { useAppContext } from "../context/AppContext";

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const { axios, getToken, user, image_base_url } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getMyBookings = async () => {
    try {
      const { data } = await axios.get("/api/user/bookings", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 IMPORTANT: refetch after Stripe redirect
  useEffect(() => {
    if (!user) return;

    getMyBookings();

    // Stripe redirects instantly but webhook updates DB async
    const timer = setTimeout(() => {
      getMyBookings();
    }, 2000);

    return () => clearTimeout(timer);
  }, [user]);

  if (isLoading) return <Loading />;

  return (
    <div className="relative px-6 md:px-16 lg:px-40 pt-32 md:pt-40 min-h-[80vh]">
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />

      <h1 className="text-lg font-semibold mb-4 text-purple-100">
        My Bookings
      </h1>

      {bookings.length === 0 && (
        <p className="text-purple-300">No bookings found.</p>
      )}

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
          {/* Poster */}
          <img
            src={
              item.show?.movie?.poster_path
                ? image_base_url + item.show.movie.poster_path
                : "/placeholder.png"
            }
            alt={item.show?.movie?.title || "Movie"}
            className="w-20 h-28 object-cover rounded-md"
          />

          {/* Movie Info */}
          <div className="flex flex-col justify-center min-w-0">
            <p className="text-sm font-semibold text-purple-100 truncate">
              {item.show?.movie?.title || "Untitled Movie"}
            </p>

            <p className="text-xs text-purple-300">
              {timeFormat(item.show?.movie?.runtime)}
            </p>

            <p className="text-xs text-purple-400 mt-1">
              {dateFormat(item.show?.showDateTime)}
            </p>

            {/* Status badge */}
            <span
              className={`mt-1 text-xs font-medium ${
                item.isPaid ? "text-green-400" : "text-yellow-400"
              }`}
            >
              {item.isPaid ? "PAID" : "PAYMENT PENDING"}
            </span>
          </div>

          {/* Price + Action */}
          <div className="flex flex-col items-end text-right whitespace-nowrap">
            <p className="text-xl font-semibold text-purple-100">
              {currency}
              {item.amount}
            </p>

            {/* ✅ Pay Now only when REALLY unpaid */}
            {!item.isPaid && item.PaymentLink && (
              <a
                href={item.PaymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-2 px-4 py-1.5
                  text-sm font-medium rounded-full
                  bg-green-700/80 hover:bg-green-900
                  transition
                "
              >
                Pay Now
              </a>
            )}

            <div className="mt-2 text-xs text-purple-300">
              <p>Total Tickets: {item.bookedSeats?.length || 0}</p>
              <p>Seats: {item.bookedSeats?.join(", ")}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyBookings;
