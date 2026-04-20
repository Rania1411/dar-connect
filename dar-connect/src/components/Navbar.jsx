import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getFavorites } from '../pages/Favorites'

export default function Navbar({ session }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const favCount = getFavorites().length

  const handleLogout = async () => { await supabase.auth.signOut() }
  const isActive = (path) => location.pathname === path

  const navLinks = [
    { to: '/home',          label: 'Home' },
    { to: '/houses',        label: 'Houses' },
    { to: '/favorites',     label: 'Saved', badge: favCount > 0 ? favCount : null },
    { to: '/dashboard',     label: 'Dashboard' },
    { to: '/list-property', label: '+ List Property', highlight: true },
  ]

  return (
    <nav className="glass sticky top-0 z-50 border-b border-dark-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/home" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">
            Dar<span className="text-primary">Connect</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            link.highlight ? (
              <Link key={link.to} to={link.to}
                className="ml-1 bg-primary/15 hover:bg-primary/25 border border-primary/30 hover:border-primary/60 text-primary text-sm font-semibold px-4 py-2 rounded-xl transition-all">
                {link.label}
              </Link>
            ) : (
              <Link key={link.to} to={link.to}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.to) ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                {link.label}
                {link.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            )
          ))}
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-2">
          <div className="w-px h-5 bg-dark-border mx-1" />
          <Link to="/profile"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${isActive('/profile') ? 'bg-primary/20' : 'hover:bg-white/5'}`}>
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="font-display font-bold text-xs text-primary">
                {session?.user?.email?.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <span className="text-sm text-slate-400 hover:text-white transition-colors max-w-[100px] truncate">
              {session?.user?.email?.split('@')[0]}
            </span>
          </Link>
          <button onClick={handleLogout}
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
          {menuOpen
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          }
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-dark-border bg-dark-card px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                link.highlight
                  ? 'bg-primary/15 border border-primary/30 text-primary'
                  : isActive(link.to)
                    ? 'bg-primary/20 text-primary'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}>
              {link.label}
              {link.badge && <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">{link.badge}</span>}
            </Link>
          ))}
          <Link to="/profile" onClick={() => setMenuOpen(false)}
            className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            Profile
          </Link>
          <button onClick={handleLogout}
            className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}