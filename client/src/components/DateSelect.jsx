import React, { useState } from "react";
import BlurCircle from "./BlurCircle";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DateSelect = ({ dateTime, id }) => {
  const [activeDate, setActiveDate] = useState(null);
  const navigate = useNavigate();

  const handleBooking = () => {
    if (!activeDate) {
      toast.error("Please select a date");
      return;
    }

    navigate(`/movies/${id}/${activeDate}`);
  };

  return (
    <div id="dateSelect" className="pt-24">
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-10 p-8 bg-primary/10 border border-primary/20 rounded-xl overflow-hidden">

        {/* Blur effects */}
        <BlurCircle top="-120px" left="-120px" />
        <BlurCircle bottom="-120px" right="-120px" />

        {/* Date section */}
        <div className="w-full">
          <p className="text-lg font-semibold mb-4">Choose Date</p>

          <div className="flex items-center gap-4">
            {/* Left Arrow */}
            <button className="p-2 rounded-full hover:bg-white/10 transition">
              <ChevronLeftIcon size={26} />
            </button>

            {/* Dates */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:flex gap-4">
              {Object.keys(dateTime).map((date) => {
                const isActive = activeDate === date;

                return (
                  <button
                    key={date}
                    onClick={() => setActiveDate(date)}
                    className={`h-16 w-16 rounded-lg flex flex-col items-center justify-center border text-sm font-medium transition-all
                      ${
                        isActive
                          ? "bg-primary text-white border-primary scale-105"
                          : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                  >
                    <span className="text-lg font-semibold">
                      {new Date(date).getDate()}
                    </span>
                    <span className="uppercase text-xs">
                      {new Date(date).toLocaleDateString("en-US", {
                        month: "short",
                      })}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Arrow */}
            <button className="p-2 rounded-full hover:bg-white/10 transition">
              <ChevronRightIcon size={26} />
            </button>
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={handleBooking}
          className={`px-8 py-3 rounded-lg font-medium transition-all
            ${
              activeDate
                ? "bg-purple-800 text-white hover:bg-purple-900"
                : "bg-white/20 text-white/50 cursor-not-allowed"
            }`}
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default DateSelect;
