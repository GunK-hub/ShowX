import React, { useEffect } from "react";
import { useState } from "react";
import { dummyShowsData } from "../../assets/assets";
import Loading from "../../components/loading";
import Title from "../../components/admin/Title";
import { dateFormat } from "../../lib/dateFormat";
const ListShows = () => {
  const currency = import.meta.env.VITE_CURRENCY

  const[shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => {
    try {
      setShows([{
        movie:dummyShowsData[0],
        showDateTime: "2025-06-30T02:30:00.000Z",
        showPrice: 59,
        occupiedSeats: {
          A1: "user_1",
          B1: "user_2",
          C1: "user_3"
        }
      }]);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  }
  useEffect (() => {
    getAllShows();
  }, []);
  return!loading ? (
    <>
    <Title text1="List" text2="Shows"/>
    <div className="max-w-4xl mt-6 overflow-x-auto">
      <table className="w-full border-collapse rounded-md overflow-hidden text-nowrap bg-purple-800">
        <thead>
          <tr className="w-full border-collapse
            rounded-md overflow-hidden
            text-nowrap

            bg-purple-800
            backdrop-blur-lg
            border border-purple-300/30

            shadow-lg shadow-purple-900/30">
            <th className="p-2 font-medium pl-5">Movie Name</th>
            <th className="p-2 font-medium">Show Time</th>
            <th className="p-2 font-medium">Total Bookings</th>
            <th className="p-2 font-medium">Earnings</th>
          </tr>
        </thead>
        <tbody className="text-sm font-light">
          {shows.map((show, index) => (
            <tr
              key={index}
              className="
                border-b border-purple-300/20
                bg-purple-900
                even:bg-purple-500/10
                hover:bg-purple-400/15
                transition
              "
            >
              <td className="p-2 min-w-45 pl-5">
                {show.movie.title}
              </td>

              <td className="p-2">
                {dateFormat(show.showDateTime)}
              </td>

              <td className="p-2">
                {Object.keys(show.occupiedSeats).length}
              </td>

              <td className="p-2">
                {currency}{" "}
                {Object.keys(show.occupiedSeats).length * show.showPrice}
              </td>
            </tr>
          ))}
        </tbody>

      </table>
    </div>
    </>
  ) : <Loading/>
}

export default ListShows