import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { Menu, Search, TicketPlus, X } from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { user, isLoaded } = useUser(); // ✅ SAFE
  const { openSignIn } = useClerk();
  const navigate = useNavigate();

  const { favoriteMovies = [] } = useAppContext(); // ✅ SAFE

  return (
    <div className="fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-36 py-5">
      <Link to="/" className="max-md:flex-1">
        <img src={assets.logo2} alt="ShowX" className="w-36 h-auto" />
      </Link>

      {/* NAV LINKS */}
      <div
        className={`
          max-md:absolute max-md:top-16 max-md:left-1/2 max-md:-translate-x-1/2
          z-50 flex flex-col md:flex-row items-center
          gap-6 md:gap-8 px-8 py-3
          rounded-full
          bg-purple-900/40 backdrop-blur-md
          border border-white/10
          transition-all duration-300
          max-md:w-[90%]
          ${
            isOpen
              ? "max-md:opacity-100 max-md:scale-100"
              : "max-md:opacity-0 max-md:scale-95 max-md:pointer-events-none"
          }
        `}
      >
        <X
          className="md:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer"
          onClick={() => setIsOpen(false)}
        />

        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} to="/">
          Home
        </Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} to="/movies">
          Movies
        </Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} to="/">
          Theaters
        </Link>
        <Link onClick={() => { scrollTo(0, 0); setIsOpen(false); }} to="/">
          Releases
        </Link>

        {favoriteMovies.length > 0 && (
          <Link
            onClick={() => { scrollTo(0, 0); setIsOpen(false); }}
            to="/favorite"
          >
            Favorites
          </Link>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-8">
        <Search className="max-md:hidden w-6 h-6 cursor-pointer" />

        {!isLoaded ? null : !user ? (
          <button
            onClick={openSignIn}
            className="px-4 py-1 sm:px-7 sm:py-2 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer"
          >
            Login
          </button>
        ) : (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action
                label="My bookings"
                labelIcon={<TicketPlus width={15} />}
                onClick={() => navigate("/my-bookings")}
              />
            </UserButton.MenuItems>
          </UserButton>
        )}
      </div>

      <Menu
        className="max-md:ml-4 md:hidden w-8 h-8 cursor-pointer"
        onClick={() => setIsOpen(true)}
      />
    </div>
  );
};

export default Navbar;
