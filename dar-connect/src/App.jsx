import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Houses from './pages/Houses'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'

function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

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
        {/* Public routes */}
        <Route path="/" element={session ? <Navigate to="/home" replace /> : <Landing />} />
        <Route path="/login" element={session ? <Navigate to="/home" replace /> : <Login />} />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute session={session}>
              <Home session={session} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/houses"
          element={
            <ProtectedRoute session={session}>
              <Houses session={session} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute session={session}>
              <Dashboard session={session} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={session ? '/home' : '/'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}