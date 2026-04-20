import { Link } from 'react-router-dom'

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: 'Curated Listings',
    desc: 'Browse hand-picked premium properties across Algeria with verified details and real photos.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: 'Book Visits Instantly',
    desc: 'Schedule a property visit in seconds. No calls, no waiting — just pick a date and confirm.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: 'Secure & Verified',
    desc: 'Upload your ID once. Your documents are stored securely and linked to your visit requests.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.18 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.29 6.29l1.28-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
    title: 'Real-Time Updates',
    desc: 'Track your visit status — pending, approved, or rejected — directly from your dashboard.',
  },
]

const stats = [
  { value: '500+', label: 'Properties Listed' },
  { value: '2,000+', label: 'Happy Tenants' },
  { value: '48 Wilayas', label: 'Across Algeria' },
  { value: '< 24h', label: 'Visit Confirmation' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark overflow-hidden">

      {/* Navbar */}
      <header className="glass sticky top-0 z-50 border-b border-dark-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">
              Dar<span className="text-primary">Connect</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-primary/30"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Glow blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Algeria's #1 Real Estate Extranet
          </span>

          <h1 className="font-display font-extrabold text-5xl sm:text-6xl lg:text-7xl text-white leading-tight mb-6">
            Find Your Dream Home
            <br />
            <span className="text-primary">in Algeria</span>
          </h1>

          <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Browse premium listings, book visits instantly, and manage everything from one elegant platform. No agents. No hassle.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Browse Properties →
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto border border-dark-border hover:border-primary/40 text-slate-300 hover:text-white font-medium px-8 py-4 rounded-xl text-lg transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative mt-16 rounded-2xl overflow-hidden border border-dark-border shadow-2xl shadow-black/50">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80"
            alt="Luxury property"
            className="w-full h-80 sm:h-[480px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />

          {/* Floating badge */}
          <div className="absolute bottom-6 left-6 glass rounded-xl px-5 py-3 text-left">
            <p className="text-xs text-slate-400 mb-0.5">Featured Property</p>
            <p className="font-display font-semibold text-white">Modern Villa — Hydra, Alger</p>
            <p className="text-primary font-bold text-lg">85,000 DZD<span className="text-slate-400 text-sm font-normal">/mo</span></p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-dark-border bg-dark-card/50">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display font-extrabold text-4xl text-primary mb-1">{s.value}</p>
              <p className="text-slate-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="font-display font-bold text-4xl text-white mb-4">
            Everything you need to find your home
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            DarConnect simplifies every step — from discovery to move-in.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-dark-card border border-dark-border rounded-2xl p-6 hover:border-primary/40 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center mb-5">
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-dark-card/40 border-y border-dark-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-4xl text-white mb-4">How it works</h2>
            <p className="text-slate-400 text-lg">Three simple steps to your new home.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up for free in under a minute. No credit card required.' },
              { step: '02', title: 'Browse & choose', desc: 'Explore listings, filter by location and price, find your perfect match.' },
              { step: '03', title: 'Book & confirm', desc: 'Request a visit, upload your ID, and wait for confirmation.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-5">
                <div className="font-display font-extrabold text-5xl text-primary/20 leading-none flex-shrink-0 w-14">
                  {item.step}
                </div>
                <div className="pt-1">
                  <h3 className="font-display font-semibold text-white text-xl mb-2">{item.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="relative bg-dark-card border border-dark-border rounded-3xl px-8 py-16 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white mb-4">
              Ready to find your home?
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">
              Join thousands of tenants who found their perfect home through DarConnect.
            </p>
            <Link
              to="/login"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Get Started — It's Free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-border">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white">
              Dar<span className="text-primary">Connect</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm">© 2025 DarConnect. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}