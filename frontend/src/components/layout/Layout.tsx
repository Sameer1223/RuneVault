import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import { useUserSync } from "../../hooks/useUserSync"
import { trackPageView } from "@/lib/analytics"
import { getPageTitle } from "@/lib/pageTitles"

export default function Layout() {
  // Sync user with backend on login
  useUserSync();

  const location = useLocation();

  useEffect(() => {
    // Set the title first - trackPageView reports document.title to GA, so
    // updating it afterwards would report the *previous* route's title.
    document.title = getPageTitle(location.pathname);
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
