import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Navbar({ session }) {
  const location = useLocation()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="glass sticky top-0 z-50 border-b border-dark-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/houses" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="font-display font-700 text-lg text-white tracking-tight">
            Dar<span className="text-primary">Connect</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            to="/houses"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/houses')
                ? 'bg-primary/20 text-primary'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Houses
          </Link>
          <Link
            to="/dashboard"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive('/dashboard')
                ? 'bg-primary/20 text-primary'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Dashboard
          </Link>

          <div className="w-px h-5 bg-dark-border mx-2" />

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:block">
              {session?.user?.email?.split('@')[0]}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}