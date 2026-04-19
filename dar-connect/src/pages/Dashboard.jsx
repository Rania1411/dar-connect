import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

const STATUS_STYLES = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  approved: 'bg-green-500/15 text-green-400 border-green-500/20',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
}

export default function Dashboard({ session }) {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVisits = async () => {
      const { data, error } = await supabase
        .from('visits')
        .select(`
          *,
          houses (title, location, price, image_url)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (!error) setVisits(data || [])
      setLoading(false)
    }

    fetchVisits()
  }, [session.user.id])

  const stats = {
    total: visits.length,
    pending: visits.filter(v => v.status === 'pending').length,
    approved: visits.filter(v => v.status === 'approved').length,
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="font-display font-bold text-4xl text-white mb-2">
          My Dashboard
        </h1>
        <p className="text-slate-400">
          Welcome back, <span className="text-white font-medium">{session.user.email}</span>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Requests', value: stats.total, color: 'text-white' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-400' },
          { label: 'Approved', value: stats.approved, color: 'text-green-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <p className="text-slate-500 text-sm mb-2">{stat.label}</p>
            <p className={`font-display font-bold text-3xl ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="font-display font-semibold text-xl text-white mb-5">
        Visit Requests
      </h2>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-dark-card border border-dark-border rounded-2xl p-5 animate-pulse flex gap-4">
              <div className="w-20 h-20 rounded-xl bg-dark-border flex-shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-dark-border rounded w-1/3" />
                <div className="h-3 bg-dark-border rounded w-1/4" />
                <div className="h-3 bg-dark-border rounded w-1/5 mt-3" />
              </div>
            </div>
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-dark-card rounded-2xl border border-dark-border">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-40">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p className="font-medium text-lg">No visits requested yet</p>
          <p className="text-sm mt-1">Browse houses and book your first visit</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map((visit) => (
            <div
              key={visit.id}
              className="bg-dark-card border border-dark-border rounded-2xl p-5 flex gap-5 hover:border-primary/30 transition-colors"
            >
              <img
                src={visit.houses?.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80'}
                alt={visit.houses?.title}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=80'
                }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-display font-semibold text-white text-lg leading-snug">
                      {visit.houses?.title}
                    </h3>
                    <div className="flex items-center gap-1 text-slate-400 text-sm mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {visit.houses?.location}
                    </div>
                  </div>

                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize flex-shrink-0 ${STATUS_STYLES[visit.status] || STATUS_STYLES.pending}`}>
                    {visit.status}
                  </span>
                </div>

                <div className="flex items-center gap-5 mt-3 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {new Date(visit.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>

                  <span className="text-primary font-semibold font-display">
                    {Number(visit.houses?.price).toLocaleString()} DZD/mo
                  </span>

                  {visit.id_scan_url && (
                    <a
                      href={visit.id_scan_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-slate-500 hover:text-primary transition-colors"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      View ID
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}