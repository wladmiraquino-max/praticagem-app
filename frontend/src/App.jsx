import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Questions from './pages/Questions'
import Simulados from './pages/Simulados'
import Materials from './pages/Materials'
import StudyTrail from './pages/StudyTrail'
import Tutor from './pages/Tutor'
import Network from './pages/Network'
import Performance from './pages/Performance'
import Preferences from './pages/Preferences'
import QuestionBooks from './pages/QuestionBooks'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Carregando...</div>
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/questions" element={<PrivateRoute><Questions /></PrivateRoute>} />
          <Route path="/simulados" element={<PrivateRoute><Simulados /></PrivateRoute>} />
          <Route path="/materials" element={<PrivateRoute><Materials /></PrivateRoute>} />
          <Route path="/trail" element={<PrivateRoute><StudyTrail /></PrivateRoute>} />
          <Route path="/tutor" element={<PrivateRoute><Tutor /></PrivateRoute>} />
          <Route path="/network" element={<PrivateRoute><Network /></PrivateRoute>} />
          <Route path="/performance" element={<PrivateRoute><Performance /></PrivateRoute>} />
          <Route path="/preferences" element={<PrivateRoute><Preferences /></PrivateRoute>} />
          <Route path="/question-books" element={<PrivateRoute><QuestionBooks /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
