import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboardIcon,
  PlusSquareIcon,
  ListIcon,
  ListCollapseIcon,
} from "lucide-react";
import { assets } from "../../assets/assets";

const AdminSidebar = () => {
  const user = {
    firstName: "Admin",
    lastName: "User",
    imageUrl: assets.profile,
  };

  const adminNavLinks = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboardIcon },
    { name: "Add Shows", path: "/admin/add-shows", icon: PlusSquareIcon },
    { name: "List Shows", path: "/admin/list-shows", icon: ListIcon },
    { name: "List Bookings", path: "/admin/list-bookings", icon: ListCollapseIcon },
  ];

  return (
    <div className="h-full flex flex-col pt-6">
      {/* Profile */}
      <div className="flex flex-col items-center gap-2 mb-8">
        <img
          src={user.imageUrl}
          alt="Admin"
          className="w-14 h-14 rounded-full object-cover"
        />
        <p className="text-sm font-medium">
          {user.firstName} {user.lastName}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col">
        {adminNavLinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.path}
            className={({ isActive }) =>
              "relative flex items-center gap-3 px-6 py-2.5 text-sm " +
              "text-purple-300 hover:text-white transition " +
              (isActive ? "bg-primary/15 text-primary" : "")
            }
          >
            {({ isActive }) => (
              <>
                <link.icon className="w-5 h-5" />
                <span>{link.name}</span>

                <span
                  className={
                    "absolute right-0 w-1 h-10 rounded-l " +
                    (isActive ? "bg-primary" : "")
                  }
                />
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminSidebar;
