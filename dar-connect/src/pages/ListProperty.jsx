import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const WILAYAS = [
  'Adrar','Chlef','Laghouat','Oum El Bouaghi','Batna','Béjaïa','Biskra','Béchar',
  'Blida','Bouira','Tamanrasset','Tébessa','Tlemcen','Tiaret','Tizi Ouzou','Alger',
  'Djelfa','Jijel','Sétif','Saïda','Skikda','Sidi Bel Abbès','Annaba','Guelma',
  'Constantine','Médéa','Mostaganem','M\'Sila','Mascara','Ouargla','Oran','El Bayadh',
  'Illizi','Bordj Bou Arréridj','Boumerdès','El Tarf','Tindouf','Tissemsilt','El Oued',
  'Khenchela','Souk Ahras','Tipaza','Mila','Aïn Defla','Naâma','Aïn Témouchent',
  'Ghardaïa','Relizane',
]

const PROPERTY_TYPES = ['Apartment','Villa','Studio','House','Farm','Commercial','Land']

const STEPS = ['Basic Info', 'Details', 'Photo', 'Review']

export default function ListProperty({ session }) {
  const navigate = useNavigate()
  const fileInputRef = useRef()

  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  const [form, setForm] = useState({
    title: '',
    type: 'Apartment',
    price: '',
    wilaya: 'Alger',
    city: '',
    address: '',
    surface: '',
    rooms: '',
    floor: '',
    description: '',
    furnished: false,
    parking: false,
    garden: false,
    elevator: false,
    balcony: false,
    security: false,
  })

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleImageChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (!f || !f.type.startsWith('image/')) return
    setImageFile(f)
    setImagePreview(URL.createObjectURL(f))
  }

  const canNext = () => {
    if (step === 0) return form.title.trim() && form.price && form.wilaya && form.city.trim()
    if (step === 1) return form.surface && form.rooms
    if (step === 2) return imageFile !== null
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true); setError('')
    try {
      let imageUrl = ''
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `listings/${session.user.id}/${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage.from('documents').upload(path, imageFile)
        if (uploadErr) throw uploadErr
        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)
        imageUrl = publicUrl
      }

      const amenities = ['furnished','parking','garden','elevator','balcony','security']
        .filter(a => form[a]).join(',')

      const { error: insertErr } = await supabase.from('houses').insert({
        title: form.title.trim(),
        price: Number(form.price),
        location: `${form.city}, ${form.wilaya}`,
        image_url: imageUrl,
        owner_id: session.user.id,
        type: form.type,
        surface: Number(form.surface) || null,
        rooms: Number(form.rooms) || null,
        floor: form.floor || null,
        address: form.address || null,
        description: form.description || null,
        amenities: amenities || null,
      })
      if (insertErr) throw insertErr

      navigate('/home', { state: { listed: true } })
    } catch (err) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <Link to="/home" className="text-slate-500 hover:text-primary text-sm flex items-center gap-1 mb-4 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Home
        </Link>
        <h1 className="font-display font-bold text-4xl text-white mb-2">List Your Property</h1>
        <p className="text-slate-400">Reach thousands of verified tenants across Algeria.</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? 'bg-primary text-white' :
                i === step ? 'bg-primary text-white ring-4 ring-primary/20' :
                'bg-dark-card border border-dark-border text-slate-500'
              }`}>
                {i < step ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-white' : 'text-slate-500'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full ml-2 transition-all ${i < step ? 'bg-primary' : 'bg-dark-border'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-8">

        {/* STEP 0 — Basic Info */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-display font-semibold text-xl text-white mb-6">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Property Title <span className="text-red-400">*</span></label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Modern 3-Bedroom Apartment in Hydra"
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Property Type <span className="text-red-400">*</span></label>
                <select value={form.type} onChange={e => set('type', e.target.value)}
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors">
                  {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Monthly Rent (DZD) <span className="text-red-400">*</span></label>
                <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                  placeholder="e.g. 55000" min="0"
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Wilaya <span className="text-red-400">*</span></label>
                <select value={form.wilaya} onChange={e => set('wilaya', e.target.value)}
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary transition-colors">
                  {WILAYAS.map(w => <option key={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">City / District <span className="text-red-400">*</span></label>
                <input type="text" value={form.city} onChange={e => set('city', e.target.value)}
                  placeholder="e.g. Hydra, Ben Aknoun"
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Address <span className="text-slate-500 font-normal">(optional)</span></label>
              <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="Street name, building number..."
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
        )}

        {/* STEP 1 — Details */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-display font-semibold text-xl text-white mb-6">Property Details</h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Surface (m²) <span className="text-red-400">*</span></label>
                <input type="number" value={form.surface} onChange={e => set('surface', e.target.value)}
                  placeholder="120" min="1"
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Rooms <span className="text-red-400">*</span></label>
                <input type="number" value={form.rooms} onChange={e => set('rooms', e.target.value)}
                  placeholder="3" min="1"
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Floor</label>
                <input type="text" value={form.floor} onChange={e => set('floor', e.target.value)}
                  placeholder="3rd / Ground"
                  className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe your property — highlights, nearby amenities, transport links..."
                rows={4}
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Amenities</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: 'furnished', label: '🛋️ Furnished' },
                  { key: 'parking', label: '🚗 Parking' },
                  { key: 'garden', label: '🌿 Garden' },
                  { key: 'elevator', label: '🛗 Elevator' },
                  { key: 'balcony', label: '🏙️ Balcony' },
                  { key: 'security', label: '🔒 Security' },
                ].map(({ key, label }) => (
                  <button key={key} type="button"
                    onClick={() => set(key, !form[key])}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      form[key]
                        ? 'bg-primary/20 border-primary/50 text-white'
                        : 'bg-dark border-dark-border text-slate-400 hover:border-primary/30 hover:text-white'
                    }`}>
                    <span>{label}</span>
                    {form[key] && (
                      <svg className="ml-auto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5578F5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Photo */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-display font-semibold text-xl text-white mb-2">Property Photo</h2>
            <p className="text-slate-400 text-sm mb-6">Add a high-quality photo to attract more tenants.</p>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-dark-border">
                <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview('') }}
                  className="absolute top-4 right-4 w-9 h-9 bg-dark/80 rounded-xl flex items-center justify-center text-white hover:bg-red-500/80 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div className="absolute bottom-4 left-4 text-white text-sm font-medium">
                  ✓ Photo selected
                </div>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-dark-border hover:border-primary/50 rounded-2xl h-56 flex flex-col items-center justify-center cursor-pointer transition-all group hover:bg-primary/5">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <div className="w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5578F5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <p className="text-white font-medium mb-1">Click or drag & drop your photo</p>
                <p className="text-slate-500 text-sm">PNG, JPG up to 10MB</p>
              </div>
            )}

            <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 text-sm text-slate-400">
              <p className="font-medium text-white mb-1">📸 Photo tips</p>
              <ul className="space-y-1 text-xs">
                <li>• Use natural lighting — shoot during daytime</li>
                <li>• Show the main living area or facade</li>
                <li>• Landscape orientation works best</li>
              </ul>
            </div>
          </div>
        )}

        {/* STEP 3 — Review */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-display font-semibold text-xl text-white mb-2">Review & Publish</h2>
            <p className="text-slate-400 text-sm mb-6">Check your listing before publishing.</p>

            {imagePreview && (
              <div className="rounded-2xl overflow-hidden border border-dark-border h-48">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-3">
              {[
                { label: 'Title', value: form.title },
                { label: 'Type', value: form.type },
                { label: 'Price', value: `${Number(form.price).toLocaleString()} DZD/month` },
                { label: 'Location', value: `${form.city}, ${form.wilaya}` },
                { label: 'Surface', value: form.surface ? `${form.surface} m²` : '—' },
                { label: 'Rooms', value: form.rooms || '—' },
                { label: 'Floor', value: form.floor || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2.5 border-b border-dark-border last:border-0">
                  <span className="text-slate-400 text-sm">{label}</span>
                  <span className="text-white font-medium text-sm">{value}</span>
                </div>
              ))}
            </div>

            {(['furnished','parking','garden','elevator','balcony','security'].some(k => form[k])) && (
              <div>
                <p className="text-slate-400 text-sm mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {['furnished','parking','garden','elevator','balcony','security']
                    .filter(k => form[k])
                    .map(k => (
                      <span key={k} className="bg-primary/15 text-primary text-xs px-3 py-1 rounded-full capitalize font-medium">{k}</span>
                    ))}
                </div>
              </div>
            )}

            {form.description && (
              <div>
                <p className="text-slate-400 text-sm mb-2">Description</p>
                <p className="text-slate-300 text-sm leading-relaxed bg-dark rounded-xl p-4 border border-dark-border">{form.description}</p>
              </div>
            )}

            {error && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-xl">{error}</p>}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-border">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-dark-border text-slate-400 hover:text-white hover:border-primary/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30 text-sm">
              Continue
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold px-8 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30 text-sm">
              {submitting ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Publishing...</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Publish Listing</>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}