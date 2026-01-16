import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { useAppContext } from "../../context/AppContext";

const Layout = () => {

  const {isAdmin, fetchIsAdmin} = useAppContext()

  useEffect(()=> {
    fetchIsAdmin()
  }, [])
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top navbar */}
      <AdminNavbar />

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/10">
          <AdminSidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
