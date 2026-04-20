import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function HouseDetail({ session }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [house, setHouse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [date, setDate] = useState('')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [alreadyBooked, setAlreadyBooked] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const [houseRes, visitRes] = await Promise.all([
        supabase.from('houses').select('*').eq('id', id).single(),
        supabase.from('visits').select('id').eq('house_id', id).eq('user_id', session.user.id).maybeSingle(),
      ])
      if (houseRes.error) { navigate('/houses'); return }
      setHouse(houseRes.data)
      setAlreadyBooked(!!visitRes.data)
      setLoading(false)
    }
    fetch()
  }, [id])

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!date || !file) { setError('Please select a date and upload your ID.'); return }
    setSubmitting(true); setError('')
    try {
      const ext = file.name.split('.').pop()
      const path = `${session.user.id}/${id}_${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('documents').upload(path, file)
      if (uploadErr) throw uploadErr
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)
      const { error: visitErr } = await supabase.from('visits').insert({
        user_id: session.user.id, house_id: id, date, status: 'pending', id_scan_url: publicUrl,
      })
      if (visitErr) throw visitErr
      setSuccess(true); setAlreadyBooked(true)
      setTimeout(() => { setModalOpen(false); setSuccess(false) }, 2500)
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="max-w-5xl mx-auto px-6 py-10 animate-pulse space-y-6">
      <div className="h-80 bg-dark-card rounded-2xl" />
      <div className="h-6 bg-dark-card rounded w-1/3" />
      <div className="h-4 bg-dark-card rounded w-1/4" />
    </div>
  )

  const amenities = ['Parking', 'Garden', 'Security', 'Elevator', 'Balcony', 'Modern Kitchen', 'Air Conditioning', 'Internet']

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/houses" className="hover:text-primary transition-colors">Houses</Link>
        <span>/</span>
        <span className="text-slate-300">{house.title}</span>
      </div>

      {/* Hero image */}
      <div className="relative rounded-2xl overflow-hidden h-80 sm:h-[420px] mb-8 border border-dark-border">
        <img
          src={house.image_url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80'}
          alt={house.title}
          className="w-full h-full object-cover"
          onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80'}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
        <div className="absolute top-4 left-4">
          <span className="bg-primary/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
            Available
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-white mb-2">{house.title}</h1>
            <div className="flex items-center gap-2 text-slate-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{house.location}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-display font-semibold text-xl text-white mb-3">About this property</h2>
            <p className="text-slate-400 leading-relaxed">
              This stunning property offers a perfect blend of modern design and comfortable living. 
              Located in one of the most desirable areas of {house.location}, it features spacious rooms, 
              high-quality finishes, and an ideal layout for families or professionals. 
              Natural light floods every room, creating a warm and welcoming atmosphere throughout the day.
            </p>
          </div>

          {/* Details grid */}
          <div>
            <h2 className="font-display font-semibold text-xl text-white mb-4">Property Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Type', value: 'Apartment' },
                { label: 'Surface', value: '120 m²' },
                { label: 'Rooms', value: '4 Rooms' },
                { label: 'Floor', value: '3rd Floor' },
                { label: 'Year Built', value: '2019' },
                { label: 'Status', value: 'Available' },
              ].map((d) => (
                <div key={d.label} className="bg-dark-card border border-dark-border rounded-xl p-4">
                  <p className="text-slate-500 text-xs mb-1">{d.label}</p>
                  <p className="text-white font-medium text-sm">{d.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="font-display font-semibold text-xl text-white mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <span key={a} className="flex items-center gap-1.5 bg-dark-card border border-dark-border text-slate-300 text-sm px-4 py-2 rounded-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {a}
                </span>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <h2 className="font-display font-semibold text-xl text-white mb-4">Location</h2>
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">{house.location}</p>
                <p className="text-slate-400 text-sm">Algeria</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: pricing card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-dark-card border border-dark-border rounded-2xl p-6 space-y-5">
            <div>
              <p className="text-slate-400 text-sm mb-1">Monthly Rent</p>
              <p className="font-display font-extrabold text-4xl text-primary">
                {Number(house.price).toLocaleString()}
                <span className="text-slate-400 text-lg font-normal"> DZD</span>
              </p>
              <p className="text-slate-500 text-sm">per month</p>
            </div>

            <div className="border-t border-dark-border pt-5 space-y-3 text-sm">
              {[
                { label: 'Security Deposit', value: `${(Number(house.price) * 2).toLocaleString()} DZD` },
                { label: 'Agency Fee', value: 'Free' },
                { label: 'Availability', value: 'Immediate' },
              ].map((r) => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-slate-400">{r.label}</span>
                  <span className="text-white font-medium">{r.value}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dark-border pt-5">
              {alreadyBooked ? (
                <div className="w-full bg-green-500/15 border border-green-500/20 text-green-400 font-semibold py-3 rounded-xl text-center text-sm">
                  ✓ Visit Already Requested
                </div>
              ) : (
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3.5 rounded-xl transition-all hover:shadow-xl hover:shadow-primary/30 text-sm"
                >
                  Request a Visit
                </button>
              )}
              <Link
                to="/houses"
                className="block w-full mt-3 border border-dark-border hover:border-primary/40 text-slate-400 hover:text-white font-medium py-3 rounded-xl transition-all text-center text-sm"
              >
                ← Back to Listings
              </Link>
            </div>

            <div className="border-t border-dark-border pt-4 text-center">
              <p className="text-slate-500 text-xs">Listed by DarConnect Agency</p>
              <p className="text-primary text-xs font-medium mt-0.5">Verified Property ✓</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-white text-xl">Request a Visit</h2>
                <p className="text-slate-400 text-sm mt-0.5">{house.title}</p>
              </div>
              <button onClick={() => { setModalOpen(false); setError('') }} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">✕</button>
            </div>
            {success ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="font-display font-semibold text-white">Visit Requested!</p>
                <p className="text-slate-400 text-sm">We'll confirm your visit shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">ID Scan / Passport</label>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-dark-border hover:border-primary/50 rounded-xl cursor-pointer transition-colors">
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} />
                    {file ? (
                      <div className="flex items-center gap-2 text-primary text-sm font-medium">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <span className="truncate max-w-48">{file.name}</span>
                      </div>
                    ) : (
                      <div className="text-center text-slate-500">
                        <svg className="mx-auto mb-1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
                        <p className="text-sm">Click to upload</p>
                        <p className="text-xs text-slate-600">PNG, JPG or PDF</p>
                      </div>
                    )}
                  </label>
                </div>
                {error && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-lg">{error}</p>}
                <button type="submit" disabled={submitting}
                  className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                  {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</> : 'Confirm Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  )
}