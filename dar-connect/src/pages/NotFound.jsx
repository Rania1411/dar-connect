import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-8">
          <div className="font-display font-extrabold text-[120px] leading-none text-dark-card select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#5578F5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
          </div>
        </div>
        <h1 className="font-display font-bold text-3xl text-white mb-3">Page not found</h1>
        <p className="text-slate-400 text-lg mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/home" className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30">
            Go Home
          </Link>
          <Link to="/houses" className="w-full sm:w-auto border border-dark-border hover:border-primary/40 text-slate-400 hover:text-white font-medium px-8 py-3 rounded-xl transition-all">
            Browse Houses
          </Link>
        </div>
      </div>
    </div>
  )
}