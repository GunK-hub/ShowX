import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UsersIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { dummyDashboardData } from "../../assets/assets";
import Loading from "../../components/loading";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { dateFormat } from "../../lib/dateFormat";

const Dashboard = () => {

  const currency = import.meta.env.VITE_CURRENCY

  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0,
    totalRevenue:0,
    activeShows: [],
    totalUser: 0
  });

  const [loading, setLoading] = useState(true);

  const dashboardCards = [
    {
      title: "Total Bookings",
      value: dashboardData.totalBookings || "0",
      icon: ChartLineIcon,
    },
    {
      title: "Total Revenue",
      value: currency + dashboardData.totalRevenue || "0",
      icon: CircleDollarSignIcon,
    },
    {
      title: "Active Shows",
      value: dashboardData.activeShows.length || "0",
      icon: PlayCircleIcon,
    },
    {
      title: "Total Users",
      value: dashboardData.totalUser || "0",
      icon: UsersIcon,
    },
  ]

  const fetchDashboardData = async () => {
    setDashboardData(dummyDashboardData)
    setLoading(false)
  };
  useEffect(() => {
    fetchDashboardData();
  }, [])


  return !loading ? (
    <>
        <Title text1="Admin" text2="Dashboard" />

    <div className="relative flex flex-wrap gap-4 mt-6 overflow-visible">
      {/* Blur background */}
      <BlurCircle top="-120px" left="-60px" />

      <div className="relative z-10 flex flex-wrap gap-4 w-full">
        {dashboardCards.map((card, index) => (
          <div
            key={index}
            className="
              flex items-center justify-between
              px-5 py-4
              bg-purple-500/10 backdrop-blur-md
              border border-purple-400/30
              rounded-md
              max-w-[220px] w-full
              shadow-lg shadow-purple-900/20
            "
          >
            <div>
              <h1 className="text-sm text-purple-300">
                {card.title}
              </h1>
              <p className="text-xl font-semibold text-purple-100 mt-1">
                {card.value}
              </p>
            </div>

            <card.icon className="w-6 h-6 text-purple-300" />
          </div>
        ))}
      </div>
    </div>
  

<p className="mt-10 text-lg font-medium">Active Shows</p>

<div className="relative grid gap-6 mt-4
                grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
  <BlurCircle top="100px" left="-10%" />

  {dashboardData.activeShows.map((show) => (
    <div
      key={show._id}
      className="
        rounded-lg overflow-hidden
        bg-primary/10
        border border-purple-300/30
        hover:-translate-y-1
        transition duration-300
        flex flex-col
      "
    >
      <img
        src={show.movie.poster_path}
        alt=""
        className="h-64 w-full object-cover"
      />

      <p className="font-medium p-2 truncate">
        {show.movie.title}
      </p>

      <div className="flex items-center justify-between px-2">
        <p className="text-lg font-medium">
          {currency} {show.showPrice}
        </p>

        <p className="flex items-center gap-1 text-sm text-gray-400">
          <StarIcon className="w-4 h-4 text-primary fill-primary" />
          {show.movie.vote_average.toFixed(1)}
        </p>
      </div>

      <p className="px-2 pt-2 text-sm text-gray-500">
        {dateFormat(show.showDateTime)}
      </p>
    </div>
  ))}
</div>
</>
  ) : <Loading />
}

export default Dashboard