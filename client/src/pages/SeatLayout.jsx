import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { assets, dummyDateTimeData, dummyShowsData } from "../assets/assets";
import Loading from "../components/loading";
import { ArrowRightIcon, ClockIcon } from "lucide-react";
import isoTimeFormat from "../lib/isoTimeFormat";
import BlurCircle from "../components/BlurCircle";
import toast from "react-hot-toast";

const SeatLayout = () => {
  const groupRows = [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"], ["I", 'J']]
  const { id, date } = useParams();
  const navigate = useNavigate();

  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);

  const getShow = async () => {
    const foundShow = dummyShowsData.find((s) => s._id === id);
    if (foundShow) {
      setShow({
        movie: foundShow,
        dateTime: dummyDateTimeData,
      });
    }
  };

  const handleSeatClick = (seatId) => {
    if(!selectedTime) {
      return toast("Please select time first")
    }
    if(!selectedSeats.includes(seatId)&& selectedSeats.length > 4) {
      return toast("You can only select 5 seats")
    }
    setSelectedSeats(prev => prev.includes(seatId) ? prev.filter(seat => seat !== seatId): [...prev, seatId])
  }

  // seat renderer
const renderSeats = (row, count = 9) => {
  return (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          const isSelected = selectedSeats.includes(seatId);

          return (
           <button
  key={seatId}
  onClick={() => handleSeatClick(seatId)}
  className={`
    h-8 w-8 rounded-md text-xs font-semibold
    border transition-all duration-200
    flex items-center justify-center
    ${
      isSelected
        ? "bg-purple-600 border-purple-600 text-white scale-105"
        : "border-purple-400 text-white hover:bg-purple-600/20"
    }`}>
  {seatId}
</button>

          );
        })}
      </div>
    </div>
  );
};


  useEffect(() => {
    getShow();
  }, [id]);

  if (!show) return <Loading />;

  return (
    <div className="flex flex-col md:flex-row px-6 md:px-16 lg:px-40 pt-32 pb-20">

      {/* Available timings */}
      <div
        className="w-64 h-fit py-6 rounded-lg self-start
                  bg-purple-500/5 backdrop-blur-md
                  border border-purple-400/15
                  md:sticky md:top-24"
      >
      <p className="text-sm font-semibold tracking-wide px-6 mb-4 text-purple-100">
          Available Timings
      </p>

      <div className="flex flex-col gap-1 px-4">
          {show.dateTime[date]?.map((item) => {
            const isSelected = selectedTime?.time === item.time;

      return (
        <button
          key={item.time}
          onClick={() => setSelectedTime(item)}
          className={`
            flex items-center gap-3 px-4 py-2 rounded-md text-left
            text-sm font-medium
            transition-colors duration-150
            ${
              isSelected
                ? "bg-purple-500/15 text-purple-50"
                : "text-purple-200 hover:bg-purple-500/10"
            }
          `}
        >
          <ClockIcon className="w-4 h-4 opacity-70" />
          <span>{isoTimeFormat(item.time)}</span>
        </button>
      );
    })}
  </div>
</div>



      {/* Seats layout */}
      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <BlurCircle top="-100px" left="-100px"/>
        <BlurCircle bottom="0px" right="0px"/>
        <h1 className='text-2xl font-semibold mb-4'>Select Your Seat</h1>
        <img src={assets.screenImage}alt="screen"/>
        <p className='text-gray-400 text-sm mb-6'>EYES UP HERE</p>

        <div className='flex flex-col items-center mt-10 text-xs text-gray-300'>
          <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
            {groupRows[0].map(row => renderSeats(row))}
          </div>

          <div className="grid grid-cols-2 gap-11">
        {groupRows.slice(1).map((group, idx) => (
          <div key={idx}>
            {group.map((row) => renderSeats(row))}
          </div>
        ))}
      </div>
    </div> 
     <button onClick={() => navigate('/my-bookings')}className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95 bg-purple-600'>
      Proceed to Checkout
      <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
     </button>

      </div>
    </div>
  );
};

export default SeatLayout;
