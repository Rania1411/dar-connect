import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Houses from './pages/Houses'
import HouseDetail from './pages/HouseDetail'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import ListProperty from './pages/ListProperty'
import NotFound from './pages/NotFound'
import Navbar from './components/Navbar'

function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      {session && <Navbar session={session} />}
      <Routes>
        <Route path="/" element={session ? <Navigate to="/home" replace /> : <Landing />} />
        <Route path="/login" element={session ? <Navigate to="/home" replace /> : <Login />} />

        <Route path="/home"         element={<ProtectedRoute session={session}><Home session={session} /></ProtectedRoute>} />
        <Route path="/houses"       element={<ProtectedRoute session={session}><Houses session={session} /></ProtectedRoute>} />
        <Route path="/houses/:id"   element={<ProtectedRoute session={session}><HouseDetail session={session} /></ProtectedRoute>} />
        <Route path="/dashboard"    element={<ProtectedRoute session={session}><Dashboard session={session} /></ProtectedRoute>} />
        <Route path="/profile"      element={<ProtectedRoute session={session}><Profile session={session} /></ProtectedRoute>} />
        <Route path="/favorites"    element={<ProtectedRoute session={session}><Favorites session={session} /></ProtectedRoute>} />
        <Route path="/list-property" element={<ProtectedRoute session={session}><ListProperty session={session} /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}