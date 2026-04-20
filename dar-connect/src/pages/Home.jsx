import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Home({ session }) {
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 })
  const [recentVisits, setRecentVisits] = useState([])
  const [featuredHouses, setFeaturedHouses] = useState([])
  const [loading, setLoading] = useState(true)

  const firstName = session?.user?.email?.split('@')[0] || 'there'

  useEffect(() => {
    const fetchData = async () => {
      const [visitsRes, housesRes] = await Promise.all([
        supabase
          .from('visits')
          .select('*, houses(title, location, price, image_url)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('houses')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3),
      ])

      if (!visitsRes.error) {
        const v = visitsRes.data || []
        setRecentVisits(v)
        setStats({
          total: v.length,
          pending: v.filter(x => x.status === 'pending').length,
          approved: v.filter(x => x.status === 'approved').length,
        })
      }

      if (!housesRes.error) setFeaturedHouses(housesRes.data || [])
      setLoading(false)
    }

    fetchData()
  }, [session.user.id])

  const STATUS_STYLES = {
    pending: 'bg-amber-500/15 text-amber-400',
    approved: 'bg-green-500/15 text-green-400',
    rejected: 'bg-red-500/15 text-red-400',
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">

      {/* Welcome banner */}
      <div className="relative bg-dark-card border border-dark-border rounded-2xl px-8 py-10 mb-10 overflow-hidden">
        <div className="absolute right-0 top-0 w-72 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path d="M100 10 L190 70 L190 170 L10 170 L10 70 Z" fill="#5578F5" />
          </svg>
        </div>
        <div className="relative">
          <p className="text-slate-400 text-sm mb-1">{greeting},</p>
          <h1 className="font-display font-bold text-3xl text-white mb-3">
            Welcome back, <span className="text-primary capitalize">{firstName}</span> 👋
          </h1>
          <p className="text-slate-400 max-w-lg mb-6">
            You have <span className="text-white font-medium">{stats.pending} pending</span> visit request{stats.pending !== 1 ? 's' : ''}. Browse new properties or check your dashboard.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/houses"
              className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-primary/30"
            >
              Browse Houses →
            </Link>
            <Link
              to="/dashboard"
              className="border border-dark-border hover:border-primary/40 text-slate-300 hover:text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all"
            >
              My Visits
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Requests', value: stats.total, color: 'text-white', icon: '📋' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-400', icon: '⏳' },
          { label: 'Approved', value: stats.approved, color: 'text-green-400', icon: '✅' },
        ].map((s) => (
          <div key={s.label} className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <span className="text-2xl">{s.icon}</span>
            <p className={`font-display font-bold text-3xl mt-2 ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-sm mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent visits */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-xl text-white">Recent Visits</h2>
            <Link to="/dashboard" className="text-primary text-sm hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-dark-card border border-dark-border rounded-xl p-4 animate-pulse flex gap-3">
                  <div className="w-14 h-14 rounded-lg bg-dark-border" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-dark-border rounded w-1/2" />
                    <div className="h-3 bg-dark-border rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentVisits.length === 0 ? (
            <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center text-slate-500">
              <p className="text-3xl mb-2">🏠</p>
              <p className="font-medium">No visits yet</p>
              <p className="text-sm mt-1">Browse houses and book your first visit</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentVisits.map((v) => (
                <div key={v.id} className="bg-dark-card border border-dark-border rounded-xl p-4 flex gap-3 hover:border-primary/30 transition-colors">
                  <img
                    src={v.houses?.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=80'}
                    alt={v.houses?.title}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=80'}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-white text-sm truncate">{v.houses?.title}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${STATUS_STYLES[v.status]}`}>
                        {v.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">{v.houses?.location}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(v.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-xl text-white">New Listings</h2>
            <Link to="/houses" className="text-primary text-sm hover:underline">View all</Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-dark-card border border-dark-border rounded-xl p-4 animate-pulse flex gap-3">
                  <div className="w-14 h-14 rounded-lg bg-dark-border" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-dark-border rounded w-1/2" />
                    <div className="h-3 bg-dark-border rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {featuredHouses.map((h) => (
                <div key={h.id} className="bg-dark-card border border-dark-border rounded-xl p-4 flex gap-3 hover:border-primary/30 transition-colors">
                  <img
                    src={h.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=80'}
                    alt={h.title}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=80'}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{h.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{h.location}</p>
                    <p className="text-primary font-semibold text-sm mt-1">
                      {Number(h.price).toLocaleString()} <span className="text-slate-500 font-normal text-xs">DZD/mo</span>
                    </p>
                  </div>
                  <Link
                    to="/houses"
                    className="flex-shrink-0 self-center text-xs bg-primary/15 hover:bg-primary/25 text-primary font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}