import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Profile({ session }) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [changingPw, setChangingPw] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [pwErr, setPwErr] = useState('')

  const email = session.user.email
  const initials = email?.slice(0, 2).toUpperCase()

  useEffect(() => {
    const meta = session.user.user_metadata || {}
    setFullName(meta.full_name || '')
    setPhone(meta.phone || '')
    setAvatarUrl(meta.avatar_url || '')
  }, [session])

  const handleAvatarChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setAvatarFile(f)
    setAvatarPreview(URL.createObjectURL(f))
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true); setProfileErr(''); setProfileMsg('')
    try {
      let uploadedUrl = avatarUrl
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `avatars/${session.user.id}.${ext}`
        const { error: upErr } = await supabase.storage.from('documents').upload(path, avatarFile, { upsert: true })
        if (upErr) throw upErr
        const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)
        uploadedUrl = publicUrl
      }
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, phone, avatar_url: uploadedUrl },
      })
      if (error) throw error
      setAvatarUrl(uploadedUrl)
      setProfileMsg('Profile updated successfully!')
    } catch (err) { setProfileErr(err.message) }
    finally { setSaving(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) { setPwErr('Passwords do not match.'); return }
    if (newPassword.length < 6) { setPwErr('Password must be at least 6 characters.'); return }
    setChangingPw(true); setPwErr(''); setPwMsg('')
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPwMsg('Password changed successfully!')
      setNewPassword(''); setConfirmPassword('')
    } catch (err) { setPwErr(err.message) }
    finally { setChangingPw(false) }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-10">
        <h1 className="font-display font-bold text-4xl text-white mb-2">My Profile</h1>
        <p className="text-slate-400">Manage your account information and security settings.</p>
      </div>

      {/* Profile card */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-8 mb-6">
        <h2 className="font-display font-semibold text-xl text-white mb-6">Personal Information</h2>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative">
            {avatarPreview || avatarUrl ? (
              <img src={avatarPreview || avatarUrl} alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-dark-border" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                <span className="font-display font-bold text-2xl text-primary">{initials}</span>
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-lg flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors shadow-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <p className="font-medium text-white text-lg">{fullName || email?.split('@')[0]}</p>
            <p className="text-slate-400 text-sm">{email}</p>
            <p className="text-slate-500 text-xs mt-1">Click the camera icon to change photo</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+213 0XX XXX XXXX"
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input type="email" value={email} disabled
              className="w-full bg-dark/50 border border-dark-border rounded-xl px-4 py-3 text-slate-500 text-sm cursor-not-allowed" />
            <p className="text-slate-600 text-xs mt-1">Email cannot be changed</p>
          </div>

          {profileErr && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-xl">{profileErr}</p>}
          {profileMsg && <p className="text-green-400 text-sm bg-green-400/10 px-4 py-3 rounded-xl">✓ {profileMsg}</p>}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving}
              className="bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-semibold px-8 py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30 flex items-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password card */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-8 mb-6">
        <h2 className="font-display font-semibold text-xl text-white mb-2">Change Password</h2>
        <p className="text-slate-400 text-sm mb-6">Use a strong password of at least 6 characters.</p>

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••" minLength={6}
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" minLength={6}
                className="w-full bg-dark border border-dark-border rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-primary transition-colors" required />
            </div>
          </div>

          {pwErr && <p className="text-red-400 text-sm bg-red-400/10 px-4 py-3 rounded-xl">{pwErr}</p>}
          {pwMsg && <p className="text-green-400 text-sm bg-green-400/10 px-4 py-3 rounded-xl">✓ {pwMsg}</p>}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={changingPw}
              className="bg-dark border border-dark-border hover:border-primary/40 text-white font-semibold px-8 py-3 rounded-xl transition-all flex items-center gap-2">
              {changingPw ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating...</> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Account info */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
        <h2 className="font-display font-semibold text-xl text-white mb-6">Account Info</h2>
        <div className="space-y-4">
          {[
            { label: 'Account ID', value: session.user.id.slice(0, 8).toUpperCase() + '...' },
            { label: 'Member Since', value: new Date(session.user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
            { label: 'Account Status', value: 'Active ✓', color: 'text-green-400' },
            { label: 'Email Verified', value: session.user.email_confirmed_at ? 'Verified ✓' : 'Not Verified', color: session.user.email_confirmed_at ? 'text-green-400' : 'text-amber-400' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-dark-border last:border-0">
              <span className="text-slate-400 text-sm">{item.label}</span>
              <span className={`text-sm font-medium ${item.color || 'text-white'}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}