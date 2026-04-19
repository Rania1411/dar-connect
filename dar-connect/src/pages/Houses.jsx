import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import HouseCard from '../components/HouseCard'

export default function Houses({ session }) {
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchHouses = async () => {
      const { data, error } = await supabase
        .from('houses')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) setHouses(data || [])
      setLoading(false)
    }

    fetchHouses()
  }, [])

  const filtered = houses.filter(
    (h) =>
      h.title.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="font-display font-bold text-4xl text-white mb-2">
          Available Properties
        </h1>
        <p className="text-slate-400 text-lg">
          Discover premium homes across Algeria.
        </p>
      </div>

      <div className="relative mb-8 max-w-md">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search by title or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-dark-card border border-dark-border rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border animate-pulse">
              <div className="h-52 bg-dark-border" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-dark-border rounded w-3/4" />
                <div className="h-3 bg-dark-border rounded w-1/2" />
                <div className="h-8 bg-dark-border rounded-xl w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-40">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <p className="text-lg font-medium">No properties found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <>
          <p className="text-slate-500 text-sm mb-6">{filtered.length} properties found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((house) => (
              <HouseCard key={house.id} house={house} userId={session.user.id} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}