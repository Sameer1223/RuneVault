import { useEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import { useUserSync } from "../../hooks/useUserSync"
import { initAnalytics, trackPageView } from "@/lib/analytics"

export default function Layout() {
  // Sync user with backend on login
  useUserSync();

  const location = useLocation();

  // Effects fire child-before-parent on mount, so initAnalytics() (previously
  // in the parent App component) could still be pending when the very first
  // trackPageView() call below fired, silently dropping the first page view.
  // Keeping init and tracking together here, in this order, guarantees gtag
  // is ready before it's ever called.
  useEffect(() => {
    initAnalytics();
  }, []);

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
