import { Navigate, Route, Routes } from 'react-router-dom'
import { Component } from 'react'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import ContractsPage from './pages/ContractsPage'
import AdminPage from './pages/AdminPage'
import Layout from './components/Layout'

// Catches render errors and shows them instead of blank screen
class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-8">
          <div className="card max-w-lg w-full p-6">
            <p className="text-base font-semibold text-red-600 mb-2">Erro na aplicação</p>
            <pre className="text-xs bg-slate-100 rounded p-3 overflow-auto text-slate-700 whitespace-pre-wrap">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <button className="btn-primary mt-4" onClick={() => window.location.reload()}>
              Recarregar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Carregando…</div>
  if (!user)   return <Navigate to="/login" replace />
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center text-slate-400">Carregando…</div>

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ContractsPage />} />
          <Route
            path="admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}
