import React, { useEffect, useState } from "react";
import Loading from "../../components/loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";

const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY;
  const { axios, getToken, user } = useAppContext();

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => {
    try {
      const { data } = await axios.get("/api/admin/shows", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      setShows(data.shows);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getAllShows();
    }
  }, [user]);

  return !loading ? (
    <>
      <Title text1="List" text2="Shows" />

      <div className="max-w-4xl mt-6 overflow-x-auto">
        <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap bg-purple-800">
          <thead>
            <tr className="bg-purple-800 backdrop-blur-lg border border-purple-300/30 shadow-lg shadow-purple-900/30">
              <th className="p-2 font-medium pl-5">Movie</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Total Bookings</th>
              <th className="p-2 font-medium">Earnings</th>
            </tr>
          </thead>

          <tbody className="text-sm font-light">
            {shows?.length > 0 &&
              shows.map((show, index) => (
                <tr
                  key={index}
                  className="border-b border-purple-300/20 bg-purple-900 even:bg-purple-500/10 hover:bg-purple-400/15 transition"
                >
                  {/* MOVIE TITLE + IMAGE */}
                  <td className="p-2 pl-5 flex items-center gap-3 min-w-45">
                    <img
                      src={`https://image.tmdb.org/t/p/w92${show.movie?.poster_path}`}
                      alt={show.movie?.title}
                      className="w-10 h-14 rounded-md object-cover"
                    />
                    <span>{show.movie?.title}</span>
                  </td>

                  {/* SHOW TIME */}
                  <td className="p-2">
                    {dateFormat(show.showDateTime)}
                  </td>

                  {/* BOOKINGS */}
                  <td className="p-2">
                    {Object.keys(show.occupiedSeats || {}).length}
                  </td>

                  {/* EARNINGS */}
                  <td className="p-2">
                    {currency}{" "}
                    {Object.keys(show.occupiedSeats || {}).length *
                      show.showPrice}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <Loading />
  );
};

export default ListShows;
