import React, { Component } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'
import './index.css'

class RootErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#f8fafc' }}>
          <div style={{ maxWidth: 480, width: '100%', background: '#fff', borderRadius: 8, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,.12)' }}>
            <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: 8 }}>Erro ao inicializar a aplicação</p>
            <pre style={{ fontSize: 12, background: '#f1f5f9', borderRadius: 4, padding: 12, overflow: 'auto', whiteSpace: 'pre-wrap', color: '#475569' }}>
              {this.state.error.message}
            </pre>
            <button style={{ marginTop: 16, padding: '8px 16px', background: '#1e40af', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
              onClick={() => window.location.reload()}>Recarregar</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </RootErrorBoundary>
  </React.StrictMode>
)
