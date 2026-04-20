import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { toggleFavorite, isFavorite } from '../pages/Favorites'

export default function HouseCard({ house, userId }) {
  const [isOpen, setIsOpen] = useState(false)
  const [date, setDate] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [fav, setFav] = useState(isFavorite(house.id))

  const handleToggleFav = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const next = toggleFavorite(house.id)
    setFav(next.includes(house.id))
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!date || !file) { setError('Please select a date and upload your ID scan.'); return }
    setLoading(true); setError('')
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${house.id}_${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(fileName)
      const { error: visitError } = await supabase.from('visits').insert({
        user_id: userId, house_id: house.id, date, status: 'pending', id_scan_url: publicUrl,
      })
      if (visitError) throw visitError
      setSuccess(true)
      setTimeout(() => { setIsOpen(false); setSuccess(false); setDate(''); setFile(null) }, 2000)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <>
      <div className="bg-dark-card rounded-2xl overflow-hidden border border-dark-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 group">
        <div className="relative overflow-hidden h-52">
          <Link to={`/houses/${house.id}`}>
            <img src={house.image_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'}
              alt={house.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80'} />
          </Link>
          <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 to-transparent pointer-events-none" />
          <div className="absolute top-3 left-3">
            <span className="bg-primary/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">Available</span>
          </div>
          <button onClick={handleToggleFav}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-sm border flex items-center justify-center transition-all ${fav ? 'bg-red-500/20 border-red-500/30' : 'bg-black/30 border-white/10 hover:bg-red-500/20 hover:border-red-500/30'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill={fav ? '#ef4444' : 'none'} stroke={fav ? '#ef4444' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>
        </div>
        <div className="p-5">
          <Link to={`/houses/${house.id}`}>
            <h3 className="font-display font-semibold text-white text-lg leading-snug mb-1 hover:text-primary transition-colors">{house.title}</h3>
          </Link>
          <div className="flex items-center gap-1 text-slate-400 text-sm mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {house.location}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-display font-bold text-primary">{Number(house.price).toLocaleString()}</span>
              <span className="text-slate-500 text-sm ml-1">DZD/mo</span>
            </div>
            <div className="flex gap-2">
              <Link to={`/houses/${house.id}`}
                className="border border-dark-border hover:border-primary/40 text-slate-400 hover:text-white text-sm font-medium px-3 py-2.5 rounded-xl transition-all">
                Details
              </Link>
              <button onClick={() => setIsOpen(true)}
                className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30">
                Book
              </button>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-semibold text-white text-xl">Request a Visit</h2>
                <p className="text-slate-400 text-sm mt-0.5">{house.title}</p>
              </div>
              <button onClick={() => { setIsOpen(false); setError('') }} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">✕</button>
            </div>
            {success ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <p className="font-display font-semibold text-white">Visit Requested!</p>
                <p className="text-slate-400 text-sm">We'll confirm your visit soon.</p>
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
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-dark-border hover:border-primary/50 rounded-xl cursor-pointer transition-colors group">
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files[0])} />
                    {file ? (
                      <div className="flex items-center gap-2 text-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <span className="text-sm font-medium truncate max-w-48">{file.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-500 group-hover:text-slate-400 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
                        <span className="text-sm">Click to upload</span>
                        <span className="text-xs text-slate-600">PNG, JPG, PDF</span>
                      </div>
                    )}
                  </label>
                </div>
                {error && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2">
                  {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</> : 'Confirm Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}