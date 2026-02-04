import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import { useUserSync } from "../../hooks/useUserSync"

export default function Layout() {
  // Sync user with backend on login
  useUserSync();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
