import React, { useEffect, useState } from "react";
import Loading from "../../components/loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";

const ListBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const { axios, getToken, user } = useAppContext();

  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAllBookings = async () => {
    try {
      const { data } = await axios.get("/api/admin/bookings", {
        headers: {
          Authorization: `Bearer ${await getToken()}`
        }
      });

      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) {
      getAllBookings();
    }
  }, [user]);

  return !isLoading ? (
    <>
      <Title text1="List" text2="Bookings" />

      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap bg-purple-950">
          <thead>
            <tr className="bg-primary/20 text-left text-white">
              <th className="p-2 pl-5">User Name</th>
              <th className="p-2">Movie Name</th>
              <th className="p-2">Show Time</th>
              <th className="p-2">Seats</th>
              <th className="p-2">Amount</th>
            </tr>
          </thead>

          <tbody className="text-sm font-light">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-400">
                  No bookings found
                </td>
              </tr>
            ) : (
              bookings.map((item, index) => (
                <tr
                  key={index}
                  className="
                    border-b border-purple-300/20
                    bg-purple-700
                    even:bg-purple-500/10
                    hover:bg-purple-400/15
                    transition
                  "
                >
                  <td className="p-2 pl-5">
                    {item.user?.name || "User"}
                  </td>

                  <td className="p-2">
                    {item.show?.movie?.title}
                  </td>

                  <td className="p-2">
                    {dateFormat(item.show?.showDateTime)}
                  </td>

                  <td className="p-2">
                    {item.seats.join(", ")}
                  </td>

                  <td className="p-2">
                    {currency} {item.amount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default ListBookings;
