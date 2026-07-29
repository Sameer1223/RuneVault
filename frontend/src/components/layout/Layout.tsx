import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import { useUserSync } from "../../hooks/useUserSync"
import { trackPageView } from "@/lib/analytics"

export default function Layout() {
  // Sync user with backend on login
  useUserSync();

  const location = useLocation();
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
