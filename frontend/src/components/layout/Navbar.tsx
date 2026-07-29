import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Menu, X, ChevronRight } from 'lucide-react'
import LoginButton from '../common/LoginButton'

const NAV_LINKS = [
  { to: '/decks', label: 'Decks' },
  { to: '/collection', label: 'Collection' },
  { to: '/riftboundle', label: 'Riftboundle' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const isActive = (to: string) => location.pathname.startsWith(to)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-zinc-800 bg-black/80 backdrop-blur-md">
      <div className="container mx-auto flex h-full items-center justify-between px-4 sm:px-6">
        <Link to="/" aria-label="RuneVault home" className="flex items-center transition-opacity hover:opacity-80">
          <img src="/RVlogo.png" alt="RuneVault" className="h-10 sm:h-12 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`group relative py-1.5 text-sm font-medium transition-colors ${
                isActive(link.to) ? 'text-[#caa368]' : 'text-zinc-300 hover:text-white'
              }`}
            >
              {link.label}
              <span
                className={`pointer-events-none absolute -bottom-0.5 left-0 h-[2px] bg-[#caa368] transition-all duration-200 ${
                  isActive(link.to) ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
              />
            </Link>
          ))}
          <LoginButton />
        </div>

        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <DialogPrimitive.Trigger asChild>
            <button
              className="md:hidden p-2 -mr-2 rounded-md text-zinc-300 hover:text-white hover:bg-zinc-900 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </DialogPrimitive.Trigger>

          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <DialogPrimitive.Content
              className="fixed top-0 right-0 z-50 h-full w-72 max-w-[80vw] bg-[#121418] border-l border-zinc-800
                flex flex-col gap-1 p-5 pt-6 shadow-2xl"
            >
              <DialogPrimitive.Title className="sr-only">Navigation menu</DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">Site navigation links</DialogPrimitive.Description>

              <div className="flex items-center justify-between mb-4">
                <img src="/RVlogo.png" alt="RuneVault" className="h-9 w-auto" />
                <DialogPrimitive.Close asChild>
                  <button
                    className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </DialogPrimitive.Close>
              </div>

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center justify-between py-3 border-b border-zinc-800 text-lg transition-colors ${
                    isActive(link.to) ? 'text-[#caa368]' : 'text-zinc-200 hover:text-[#caa368]'
                  }`}
                >
                  {link.label}
                  <ChevronRight className="w-4 h-4 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-[#caa368]" />
                </Link>
              ))}

              <div className="mt-4" onClick={() => setOpen(false)}>
                <LoginButton className="w-full" />
              </div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </nav>
  )
}
