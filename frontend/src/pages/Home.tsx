import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Progress } from "@/components/ui/progress"
import Holo from "@/components/Holo"
import { useUserId } from '@/hooks/useUserId'
import { useAuthFetch } from '@/hooks/useAuthFetch'
import cardData from "@/data/cards.json"
import { API_BASE_URL } from '@/lib/constants'

export default function Home() {
    const { isAuthenticated } = useAuth0()
    const { userId } = useUserId()
    const authFetch = useAuthFetch()
    const [percentage, setPercentage] = useState(0)
    const [loading, setLoading] = useState(false)

    // Calculate total cards excluding alt art
    const totalCards = cardData.filter((card) => card.rarity !== 'Alternate Art').length

    useEffect(() => {
        if (!isAuthenticated || !userId) return

        const fetchCollectionPercentage = async () => {
            try {
                setLoading(true)
                const res = await authFetch(`${API_BASE_URL}/api/collection/${encodeURIComponent(userId)}`)
                if (!res.ok) throw new Error('Failed to fetch collection')
                
                const data = await res.json()
                
                // Get collection items
                const collectionItems = data.collection || {}
                
                // Count how many non-alt art cards are collected
                const collectedNonAltArt = Object.keys(collectionItems).filter((cardId) => {
                    const card = cardData.find((c) => c.cardId === cardId)
                    return card && card.rarity !== 'Alternate Art'
                }).length
                
                const calc = Math.round((collectedNonAltArt / totalCards) * 100)
                setPercentage(calc)
            } catch (err) {
                console.error('Error fetching collection:', err)
                setPercentage(0)
            } finally {
                setLoading(false)
            }
        }

        fetchCollectionPercentage()
    }, [isAuthenticated, userId])

    return (
    <div className="flex min-h-screen items-center justify-center bg-black">
        <img src="leagueworld.jpg" className="absolute inset-0 h-full w-full object-cover opacity-30" />
        
        <div className="relative z-10 flex flex-col items-center gap-10">
            <h1 className="font-raleway text-8xl font-light text-stone-200">
                R U N E V A U I T
            </h1>

            <div className="flex gap-5">
                <Link to="/riftboundle">
                    <Holo name="Riftboundle" texture="ON-Ahri.avif" className="w-64 h-64" />
                </Link>
                <Link to="/decks">
                    <Holo name="Deck Builder" texture="ON-Volibear.avif" className="w-64 h-64"/>
                </Link>
                <Link to="/collection">
                    <Holo name="Collection" texture="ON-Leesin.avif" className="w-64 h-64" />
                </Link>
            </div>

            {isAuthenticated ? (
                <div className="flex flex-col justify-center items-center">
                    <Progress value={percentage} className="w-100 [&>div]:bg-rose-600" />
                    <p className="font-raleway mt-3 text-stone-200">
                        {loading ? 'Loading...' : `You have collected ${percentage}% of Riftbound cards!`}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col justify-center items-center bg-slate-900/50 rounded-lg px-4 py-2 border border-slate-700/50 backdrop-blur-sm">
                    <p className="font-raleway text-stone-200 text-center mb-1.5 text-sm">Sign up to track your collection progress!</p>
                    <Link to="/decks" className="text-blue-400 hover:text-blue-300 text-xs font-medium transition">
                        Login →
                    </Link>
                </div>
            )}
        </div>
      </div>
    )
  }