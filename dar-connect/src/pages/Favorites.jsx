import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const STORAGE_KEY = 'dar_favorites'

export function getFavorites() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
export function toggleFavorite(id) {
  const favs = getFavorites()
  const next = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
export function isFavorite(id) { return getFavorites().includes(id) }

export default function Favorites({ session }) {
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [favIds, setFavIds] = useState(getFavorites())

  useEffect(() => {
    const ids = getFavorites()
    setFavIds(ids)
    if (ids.length === 0) { setLoading(false); return }
    supabase.from('houses').select('*').in('id', ids).then(({ data }) => {
      setHouses(data || []); setLoading(false)
    })
  }, [])

  const handleRemove = (id) => {
    const next = toggleFavorite(id)
    setFavIds(next)
    setHouses(prev => prev.filter(h => h.id !== id))
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-display font-bold text-4xl text-white mb-2">Saved Properties</h1>
          <p className="text-slate-400">{favIds.length} {favIds.length === 1 ? 'property' : 'properties'} saved</p>
        </div>
        {houses.length > 0 && (
          <Link to="/houses" className="text-primary text-sm hover:underline">Browse more →</Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border animate-pulse">
              <div className="h-52 bg-dark-border" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-dark-border rounded w-3/4" />
                <div className="h-3 bg-dark-border rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : houses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 text-slate-500">
          <div className="w-20 h-20 rounded-2xl bg-dark-card border border-dark-border flex items-center justify-center mb-5">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </div>
          <p className="text-lg font-medium text-slate-300 mb-1">No saved properties yet</p>
          <p className="text-sm mb-6">Tap the heart icon on any listing to save it here.</p>
          <Link to="/houses" className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30 text-sm">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {houses.map((house) => (
            <div key={house.id} className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 group">
              <div className="relative overflow-hidden h-52">
                <img src={house.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'}
                  alt={house.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'} />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 to-transparent" />
                <button onClick={() => handleRemove(house.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 flex items-center justify-center transition-all group/btn"
                  title="Remove from favorites">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                  </svg>
                </button>
              </div>
              <div className="p-5">
                <h3 className="font-display font-semibold text-white text-lg leading-snug mb-1">{house.title}</h3>
                <div className="flex items-center gap-1 text-slate-400 text-sm mb-4">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {house.location}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-display font-bold text-primary">{Number(house.price).toLocaleString()}</span>
                    <span className="text-slate-500 text-sm ml-1">DZD/mo</span>
                  </div>
                  <Link to={`/houses/${house.id}`}
                    className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30">
                    View →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}