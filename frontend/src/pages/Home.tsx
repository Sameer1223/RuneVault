import { Link } from 'react-router-dom'
import { Progress } from "@/components/ui/progress"
import Holo from "@/components/Holo"

export default function Home() {
    return (
    <div className="flex min-h-screen items-center justify-center bg-black">
        <img src="leagueworld.jpg" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        
        <div className="relative z-10 flex flex-col items-center gap-10">
            <h1 className="font-raleway text-8xl font-light text-stone-200">
                R U N E V A U L T
            </h1>

            <div className="flex gap-5">
                <Link to="/decks">
                    <Holo name="Deck Builder" texture="ON-Volibear.avif" className="w-64 h-64"/>
                </Link>
                <Link to="/cards">
                    <Holo name="Cards" texture="ON-Ahri.avif" className="w-64 h-64" />
                </Link>
                <Link to="/collection">
                    <Holo name="Collection" texture="ON-Leesin.avif" className="w-64 h-64" />
                </Link>
            </div>

            <div className="flex flex-col justify-center items-center">
                <Progress value={70} className="w-100 [&>div]:bg-rose-600" />
                <p className="font-raleway mt-3 text-stone-200">You have collected 72% of Riftbound cards!</p>
            </div>
        </div>
      </div>
    )
  }