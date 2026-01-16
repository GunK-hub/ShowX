import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UsersIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { dummyDashboardData } from "../../assets/assets";
import Loading from "../../components/loading";
import Title from "../../components/admin/Title";
import BlurCircle from "../../components/BlurCircle";
import { dateFormat } from "../../lib/dateFormat";
import { useAppContext } from "../../context/AppContext";
import { toast } from "react-hot-toast"; // Add this import

const Dashboard = () => {

  const {axios, getToken, user, image_base_url} = useAppContext()

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
    try {
      const { data } = await axios.get("/api/admin/dashboard", {headers: {
        Authorization: `Bearer ${await getToken()}`}})
        
        console.log("Dashboard API Response:", data); // Debug log
        console.log("Image Base URL:", image_base_url); // Debug log
        
        if(data.success) {
          console.log("Active Shows Data:", data.dashboardData.activeShows); // Debug log
          
          // Log each show's movie data
          data.dashboardData.activeShows.forEach((show, index) => {
            console.log(`Show ${index}:`, {
              id: show._id,
              movie: show.movie,
              poster_path: show.movie?.poster_path,
              full_image_url: show.movie?.poster_path ? `${image_base_url}${show.movie.poster_path}` : 'No poster path'
            });
          });
          
          setDashboardData(data.dashboardData)
          setLoading(false)
        } else {
          toast.error(data.message)
        }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Error in fetching dashboard data")
      setLoading(false) // Set loading to false even on error
    }
  };
  
  useEffect(() => {
    if(user) {
      fetchDashboardData();
    }
  }, [user])


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

  {dashboardData.activeShows && dashboardData.activeShows.length > 0 ? (
    dashboardData.activeShows.map((show) => (
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
          src={show.movie?.poster_path ? `${image_base_url}${show.movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image'}
          alt={show.movie?.title || 'Movie poster'}
          className="h-64 w-full object-cover bg-gray-800"
          onError={(e) => {
            console.error("Image failed to load:", e.target.src);
            console.error("Show data:", show);
            e.target.src = 'https://via.placeholder.com/300x450?text=No+Image'; // Fallback image
          }}
        />

        <p className="font-medium p-2 truncate" title={show.movie?.title || 'Untitled'}>
          {show.movie?.title || 'Untitled Movie'}
        </p>

        <div className="flex items-center justify-between px-2">
          <p className="text-lg font-medium">
            {currency} {show.showPrice || 0}
          </p>

          <p className="flex items-center gap-1 text-sm text-gray-400">
            <StarIcon className="w-4 h-4 text-primary fill-primary" />
            {Number(show?.movie?.vote_average || 0).toFixed(1)}
          </p>
        </div>

        <p className="px-2 pt-2 pb-2 text-sm text-gray-500">
          {dateFormat(show.showDateTime)}
        </p>
      </div>
    ))
  ) : (
    <p className="col-span-full text-center text-gray-400 py-8">
      No active shows available
    </p>
  )}
</div>
</>
  ) : <Loading />
}

export default Dashboard