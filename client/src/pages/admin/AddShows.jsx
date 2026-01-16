import React, { useEffect } from "react";
import { useState } from "react";
import { dummyShowsData } from "../../assets/assets";
import Loading from "../../components/loading";
import Title from "../../components/admin/Title";
import { CheckIcon, StarIcon } from "lucide-react";
import { kConverter } from "../../lib/kConverters";
import { DeleteIcon } from "lucide-react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const AddShows = () => {
  const {axios, getToken, user, image_base_url} = useAppContext()
  const currency = import.meta.env.VITE_CURRENCY

  const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [showPrice, setShowPrice] = useState("");
  const [addingShow, setAddingShow] = useState(false)

  const fetchNowPlayingMovies = async () => {
  try {
    const { data } = await axios.get("/api/show/now-playing", {
      headers: {
        Authorization: `Bearer ${await getToken()}`,
      },
    });

    if (data.success) {
      setNowPlayingMovies(data.movies);
    }
  } catch (error) {
    console.error("error fetching movies: ", error);
  }
};


  const handleDateTimeAdd = () => {
  if (!dateTimeInput) return;
  const [date, time] = dateTimeInput.split("T");
  if (!date || !time) return;
  setDateTimeSelection((prev) => {
    const times = prev[date] || [];

    if (!times.includes(time)) {
      return {
        ...prev,
        [date]: [...times, time],
      };
    }

    return prev;
  });
  setDateTimeInput(""); // optional: reset input
};


  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filteredTimes = prev[date].filter((t)=>t !== time);
      if(filteredTimes.length === 0) {
        const {[date]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev, 
        [date] : filteredTimes,
      };
    });
  };
const handleSubmit = async () => {
  try {
    setAddingShow(true);

    if (
      !selectedMovie ||
      !showPrice ||
      Object.keys(dateTimeSelection).length === 0
    ) {
      setAddingShow(false);
      return toast.error("Missing required fields");
    }

    const payload = {
      movieId: selectedMovie,
      showPrice: Number(showPrice),
      showsInput: Object.entries(dateTimeSelection).map(
        ([date, times]) => ({
          date,
          time: times,
        })
      ),
    };

    const { data } = await axios.post(
      "/api/admin/add-show",
      payload,
      {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      }
    );

    if (data.success) {
      toast.success(data.message);
      setSelectedMovie(null);
      setDateTimeSelection({});
      setShowPrice("");
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error("An error occurred, please try again");
    console.error(error);
  } finally {
    setAddingShow(false);
  }
};


  useEffect(()=>{
    if(user){
      fetchNowPlayingMovies();
    }
  }, [user]);

  return nowPlayingMovies.length > 0 ?(
    <>
    <Title text1="Add" text2="Shows"/>
    <p className="mt-10 text-lg font-medium">Now Playing Movies</p>
    <div className="overflow-x-auto pb-4">
      <div className="group flex flex-wrap gap-4 mt-4 w-max">
        {nowPlayingMovies.map((movie)=>(
          <div key={movie.id} className={`relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300`} onClick={()=>setSelectedMovie(movie.id)}>
            <div className="relative rounded-lg overflow-hidden">
              <img src={image_base_url + movie.poster_path} alt="" className="w-full object-cover brightness-90"/>
              <div className="text-sm flex items-center justify-between p-2 bg-black/70 w-full absolute bottom-0 left-0">

              <p className="flex items-center gap-1 text-gray-400">
                <StarIcon className="w-4 h-4 text-purple-400 fill-purple-400 "/>
                {movie.vote_average.toFixed(1)}
              </p>
              <p className="text-gray-300">{kConverter(movie.vote_count)} Votes</p>
              </div>
            </div>
            {selectedMovie === movie.id && (
              <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
                <CheckIcon className="w-4 h-4 text-white bg-purple-800" strokeWidth={2.5}/>
              </div>
            )}
            <p className="font-medium truncate">{movie.title}</p>
            <p className="text-gray-400 text-sm">{movie.release_date}</p>
          </div>
        ))}
      </div>
    </div>

  {/*show price input*/}
  <div className="mt-8">
  <label className="block text-sm font-medium mb-2">
    Show Price
  </label>
  <div className="inline-flex items-center gap-2 border border-gray-600 px-3 py-2 rounded-md">
    <p className="text-gray-400 text-sm">
      {currency}
    </p>

    <input
      min={0}
      type="number"
      value={showPrice}
      onChange={(e) => setShowPrice(e.target.value)}
      placeholder="Enter show price"
      className="outline-none bg-transparent text-sm"/>
  </div>
</div>

{/* Date & Time Selection */}
  <div className="mt-6">
  <label className="block text-sm font-medium mb-2 text-gray-300">
    Select Date and Time
  </label>

  <div
    className="
      inline-flex items-center gap-4
      rounded-xl px-4 py-2
      border border-purple-400/40
      bg-purple-500/10 backdrop-blur-md
      shadow-lg
    ">
    <input
      type="datetime-local"
      value={dateTimeInput}
      onChange={(e) => setDateTimeInput(e.target.value)}
      className="
        bg-transparent outline-none
        text-sm text-white
        cursor-pointer
        [color-scheme:dark]
      "/>
      <button
      onClick={handleDateTimeAdd}
      className="
        bg-purple-500/80 text-white
        px-4 py-2 text-sm
        rounded-lg
        hover:bg-purple-500
        transition
      ">
      Add Time
    </button>
  </div>
</div>

{/*display selected times*/}
{Object.keys(dateTimeSelection).length > 0 && (
  <div className="mt-6">
    <h2 className="mb-2 text-sm font-medium text-gray-300">
      Selected Date & Time
    </h2>

    <ul className="space-y-3">
      {Object.entries(dateTimeSelection).map(([date, times]) => (
        <li key={date}>
          <div className="font-medium text-sm text-purple-300">
            {date}
          </div>

          <div className="flex flex-wrap gap-2 mt-1 text-sm">
            {times.map((time) => (
              <div
                key={time}
                className="
                  flex items-center gap-2
                  px-3 py-1
                  rounded-md
                  border border-purple-400/40
                  bg-purple-500/10
                  text-white
                ">
                <span>{time}</span>
                <DeleteIcon
                onClick={() => handleRemoveTime(date, time)}
                width={15}
                className="
                  cursor-pointer
                  text-red-500
                  hover:text-red-700
                "/>
              </div>
            ))}
          </div>
        </li>
      ))}
    </ul>
  </div>
)}
  <button onClick={handleSubmit} disabled={addingShow} className="bg-primary text-white px-8 py-2 mt-6 rounded hover:bg-primary/90 transition-all cursor-pointer bg-purple-900">
    Add Show
  </button>
</>
  ) : <Loading/>
}

export default AddShows