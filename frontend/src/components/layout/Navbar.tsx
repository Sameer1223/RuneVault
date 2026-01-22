import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-700 bg-black/70 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
            <Link to="/" className="font-semibold text-lg">RuneVault</Link>
            <div className="flex gap-7">
            <Link to="/decks">Decks</Link>
            <Link to="/tournaments">Tournaments</Link>
            <Link to="/collection">Collection</Link>
            <Link to="/rules">Rules</Link>
        </div>
      </div>
    </nav>
  )
}