import { Link } from 'react-router-dom'
import LoginButton from '../common/LoginButton'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-gray-700 bg-black/70 backdrop-blur-md">
        <div className="container mx-auto flex h-full items-center justify-between px-6">
            <Link to="/" aria-label="RuneVault home" className="flex items-center">
              <img src="/RVlogo.png" alt="RuneVault" className="h-12 w-auto" />
            </Link>
            <div className="flex gap-7">
            <Link to="/decks">Decks</Link>
            <Link to="/collection">Collection</Link>
            <Link to="/riftboundle">Games</Link>
            <LoginButton />
        </div>
      </div>
    </nav>
  )
}