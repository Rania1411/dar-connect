import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { getFavorites } from './Favorites'

const STATUS_STYLES = {
  pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  approved: 'bg-green-500/15 text-green-400 border border-green-500/20',
  rejected: 'bg-red-500/15 text-red-400 border border-red-500/20',
}

const Skeleton = () => (
  <div className="bg-dark-card border border-dark-border rounded-xl p-4 animate-pulse flex gap-3">
    <div className="w-16 h-16 rounded-xl bg-dark-border flex-shrink-0" />
    <div className="flex-1 space-y-2 py-1">
      <div className="h-3 bg-dark-border rounded w-3/5" />
      <div className="h-3 bg-dark-border rounded w-2/5" />
      <div className="h-3 bg-dark-border rounded w-1/4 mt-2" />
    </div>
  </div>
)

export default function Home({ session }) {
  const [visits, setVisits] = useState([])
  const [featuredHouses, setFeaturedHouses] = useState([])
  const [myListings, setMyListings] = useState([])
  const [totalHouses, setTotalHouses] = useState(0)
  const [loading, setLoading] = useState(true)

  const firstName = session?.user?.email?.split('@')[0] || 'there'
  const favCount = getFavorites().length
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    const load = async () => {
      const [visitsRes, featuredRes, myListingsRes, countRes] = await Promise.all([
        supabase
          .from('visits')
          .select('*, houses(title, location, price, image_url)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(4),
        supabase
          .from('houses')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4),
        supabase
          .from('houses')
          .select('*')
          .eq('owner_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase.from('houses').select('id', { count: 'exact', head: true }),
      ])

      if (!visitsRes.error) setVisits(visitsRes.data || [])
      if (!featuredRes.error) setFeaturedHouses(featuredRes.data || [])
      if (!myListingsRes.error) setMyListings(myListingsRes.data || [])
      if (!countRes.error) setTotalHouses(countRes.count || 0)
      setLoading(false)
    }
    load()
  }, [session.user.id])

  const stats = {
    total: visits.length,
    pending: visits.filter(v => v.status === 'pending').length,
    approved: visits.filter(v => v.status === 'approved').length,
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">

    
      <div className="relative bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
       
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-32 bottom-0 w-40 h-40 rounded-full bg-primary/5 blur-2xl" />
          <svg className="absolute right-0 top-0 h-full opacity-5" viewBox="0 0 400 300" fill="none">
            <path d="M200 20L380 130V280H20V130Z" fill="#5578F5"/>
            <path d="M150 280V180H250V280" fill="#5578F5"/>
          </svg>
        </div>

        <div className="relative px-8 py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <p className="text-slate-400 text-sm font-medium mb-1">{greeting} ☀️</p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white mb-3">
              Welcome back, <span className="text-primary capitalize">{firstName}</span>
            </h1>
            <p className="text-slate-400 max-w-lg leading-relaxed mb-6">
              {stats.pending > 0
                ? <>You have <span className="text-amber-400 font-semibold">{stats.pending} pending visit{stats.pending > 1 ? 's' : ''}</span> awaiting confirmation.</>
                : <>Browse <span className="text-white font-medium">{totalHouses} available properties</span> and book your next visit.</>
              }
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/houses" className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-primary/30">
                Browse Houses →
              </Link>
              <Link to="/list-property" className="border border-primary/40 hover:border-primary bg-primary/10 hover:bg-primary/20 text-primary font-semibold px-6 py-2.5 rounded-xl text-sm transition-all">
                + List Your Property
              </Link>
              <Link to="/dashboard" className="border border-dark-border hover:border-primary/40 text-slate-400 hover:text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-all">
                My Visits
              </Link>
            </div>
          </div>

          {/* Quick stats inline */}
          <div className="flex lg:flex-col gap-3 flex-shrink-0">
            {[
              { label: 'Visit Requests', value: stats.total, color: 'text-white' },
              { label: 'Pending', value: stats.pending, color: 'text-amber-400' },
              { label: 'Approved', value: stats.approved, color: 'text-green-400' },
            ].map((s) => (
              <div key={s.label} className="bg-dark/60 border border-dark-border rounded-xl px-5 py-3 text-center min-w-[100px]">
                <p className={`font-display font-bold text-2xl ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

  
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { to: '/houses', icon: '🏠', label: 'Browse Houses', sub: `${totalHouses} listings`, color: 'hover:border-primary/40' },
          { to: '/favorites', icon: '❤️', label: 'Saved', sub: `${favCount} saved`, color: 'hover:border-red-500/30' },
          { to: '/list-property', icon: '➕', label: 'List Property', sub: 'Earn from your home', color: 'hover:border-green-500/30' },
          { to: '/dashboard', icon: '📋', label: 'My Visits', sub: `${stats.total} total`, color: 'hover:border-amber-500/30' },
        ].map((a) => (
          <Link key={a.to} to={a.to}
            className={`bg-dark-card border border-dark-border ${a.color} rounded-2xl p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg`}>
            <span className="text-3xl block mb-2">{a.icon}</span>
            <p className="font-display font-semibold text-white text-sm">{a.label}</p>
            <p className="text-slate-500 text-xs mt-0.5">{a.sub}</p>
          </Link>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

        {/* Recent Visits — 3 cols */}
        <div className="lg:col-span-3 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-xl text-white">Recent Visit Requests</h2>
            <Link to="/dashboard" className="text-primary text-sm hover:underline font-medium">View all →</Link>
          </div>

          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} />)}</div>
          ) : visits.length === 0 ? (
            <div className="bg-dark-card border border-dark-border rounded-2xl p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5578F5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <p className="font-medium text-white mb-1">No visits yet</p>
              <p className="text-slate-500 text-sm mb-4">Find a house and request your first visit</p>
              <Link to="/houses" className="text-primary text-sm font-medium hover:underline">Browse properties →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {visits.map((v) => (
                <div key={v.id} className="bg-dark-card border border-dark-border rounded-xl p-4 flex gap-4 hover:border-primary/30 transition-all group">
                  <img
                    src={v.houses?.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=80'}
                    alt={v.houses?.title}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=80'}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-white text-sm truncate">{v.houses?.title}</p>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize flex-shrink-0 ${STATUS_STYLES[v.status]}`}>
                        {v.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs flex items-center gap-1">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {v.houses?.location}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-slate-500 text-xs">
                        📅 {new Date(v.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      <p className="text-primary font-semibold text-xs">{Number(v.houses?.price).toLocaleString()} DZD</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column — 2 cols */}
        <div className="lg:col-span-2 space-y-6">

          {/* New Listings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-xl text-white">New Listings</h2>
              <Link to="/houses" className="text-primary text-sm hover:underline font-medium">See all →</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} />)}</div>
            ) : (
              <div className="space-y-3">
                {featuredHouses.map((h) => (
                  <Link key={h.id} to={`/houses/${h.id}`}
                    className="flex gap-3 bg-dark-card border border-dark-border rounded-xl p-3 hover:border-primary/30 transition-all group">
                    <img
                      src={h.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=80'}
                      alt={h.title}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0 group-hover:scale-105 transition-transform"
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=80'}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate group-hover:text-primary transition-colors">{h.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{h.location}</p>
                      <p className="text-primary font-bold text-sm mt-1">{Number(h.price).toLocaleString()} <span className="text-slate-500 font-normal text-xs">DZD/mo</span></p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* My Listings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-xl text-white">My Listings</h2>
              <Link to="/list-property" className="text-primary text-sm hover:underline font-medium">+ Add</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} />)}</div>
            ) : myListings.length === 0 ? (
              <Link to="/list-property"
                className="flex flex-col items-center justify-center bg-dark-card border-2 border-dashed border-dark-border hover:border-primary/40 rounded-2xl p-8 text-center transition-all group">
                <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-3 transition-colors">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5578F5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
                <p className="font-medium text-white text-sm mb-0.5">List your property</p>
                <p className="text-slate-500 text-xs">Reach thousands of tenants</p>
              </Link>
            ) : (
              <div className="space-y-3">
                {myListings.map((h) => (
                  <div key={h.id} className="flex gap-3 bg-dark-card border border-dark-border rounded-xl p-3 hover:border-primary/30 transition-all">
                    <img
                      src={h.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=80'}
                      alt={h.title}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200&q=80'}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{h.title}</p>
                      <p className="text-slate-500 text-xs">{h.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-primary font-bold text-xs">{Number(h.price).toLocaleString()} DZD</span>
                        <span className="text-xs bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full">Active</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Link to="/list-property" className="block text-center text-primary text-xs hover:underline font-medium pt-1">+ Add another listing</Link>
              </div>
            )}
          </div>
        </div>
      </div>

    
      <div className="relative bg-dark-card border border-primary/20 rounded-2xl px-8 py-8 overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
        <div className="relative">
          <h3 className="font-display font-bold text-2xl text-white mb-1">Have a property to rent out?</h3>
          <p className="text-slate-400 text-sm">List it on DarConnect and connect with verified tenants instantly.</p>
        </div>
        <Link to="/list-property"
          className="relative flex-shrink-0 bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-xl hover:shadow-primary/30 text-sm whitespace-nowrap">
          List Your Property →
        </Link>
      </div>

    </main>
  )
}