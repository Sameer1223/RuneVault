import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <Navbar />
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
    </div>
  );
}
