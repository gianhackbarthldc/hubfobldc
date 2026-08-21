import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ROLE_COLORS = {
  admin:   'bg-blue-500/20 text-blue-300',
  gerente: 'bg-emerald-500/20 text-emerald-300',
  usuario: 'bg-slate-500/20 text-slate-400',
}

const IconBox = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
)

const IconSettings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function Layout() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const navBase = 'flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-lg text-sm ' +
    'text-slate-400 transition-colors duration-150 ' +
    'hover:bg-white/8 hover:text-slate-200'
  const navActive = '!bg-white/10 !text-white font-medium'

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="flex w-58 flex-col bg-[#1e293b] flex-shrink-0" style={{ width: '224px' }}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-5 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Hub FOB</p>
              <p className="text-[10px] text-slate-500 leading-tight">Embarques FOB</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-3 flex-1 space-y-0.5">
          <p className="px-6 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            Menu
          </p>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `${navBase} ${isActive ? navActive : ''}`}
          >
            <IconBox />
            Contratos
          </NavLink>
          {profile?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `${navBase} ${isActive ? navActive : ''}`}
            >
              <IconSettings />
              Administração
            </NavLink>
          )}
        </nav>

        {/* User info */}
        <div className="border-t border-white/8 px-5 py-4">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-slate-300">
              {(profile?.full_name || '?')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate leading-tight">{profile?.full_name}</p>
              <p className="text-[11px] text-slate-500 truncate leading-tight">{profile?.gerencias?.nome ?? '—'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`badge text-[10px] ${ROLE_COLORS[profile?.role] ?? 'bg-slate-500/20 text-slate-400'}`}>
              {profile?.role}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-400 transition-colors"
            >
              <IconLogout />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto bg-slate-50 p-7">
        <Outlet />
      </main>
    </div>
  )
}

