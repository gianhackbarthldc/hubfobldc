import { useState } from 'react'
import UserManagement from '../components/admin/UserManagement'
import StatusManagement from '../components/admin/StatusManagement'
import AuditViewer from '../components/admin/AuditViewer'

const TABS = [
  { id: 'users',  label: 'Usuários'   },
  { id: 'status', label: 'Status'     },
  { id: 'audit',  label: 'Auditoria'  },
]

export default function AdminPage() {
  const [tab, setTab] = useState('users')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-slate-800">Administração</h1>
        <p className="text-xs text-slate-400 mt-0.5">Gestão de usuários, status e auditoria</p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={[
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'users'  && <UserManagement />}
      {tab === 'status' && <StatusManagement />}
      {tab === 'audit'  && <AuditViewer />}
    </div>
  )
}
