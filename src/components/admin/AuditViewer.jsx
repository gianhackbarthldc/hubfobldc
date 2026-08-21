import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const PAGE_SIZE = 50

export default function AuditViewer() {
  const [logs, setLogs]       = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [filterUser, setFilterUser] = useState('')
  const [filterAction, setFilterAction] = useState('')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('audit_log')
        .select('*, profiles!user_id(full_name)', { count: 'exact' })
        .order('ts', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      if (filterUser)   query = query.ilike('profiles.full_name', `%${filterUser}%`)
      if (filterAction) query = query.ilike('acao', `%${filterAction}%`)

      const { data, error, count } = await query
      if (error) throw error
      setLogs(data ?? [])
      setTotal(count ?? 0)
    } catch (err) {
      setError(err.message ?? 'Erro ao carregar auditoria.')
    } finally {
      setLoading(false)
    }
  }, [page, filterUser, filterAction])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const totalPages = Math.ceil(total / PAGE_SIZE)

  function renderDiff(log) {
    if (!log.campo_alterado) return '—'
    if (log.valor_anterior == null && log.valor_novo == null) return log.campo_alterado
    return `${log.campo_alterado}: ${log.valor_anterior ?? '∅'} → ${log.valor_novo ?? '∅'}`
  }

  return (
    <div>
      <h2 className="mb-4 font-semibold text-gray-700">Log de Auditoria</h2>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input className="input w-44" placeholder="Filtrar por usuário"
          value={filterUser} onChange={e => { setPage(0); setFilterUser(e.target.value) }} />
        <input className="input w-44" placeholder="Filtrar por ação"
          value={filterAction} onChange={e => { setPage(0); setFilterAction(e.target.value) }} />
        <button className="btn-secondary" onClick={() => { setPage(0); fetchLogs() }}>
          ↺ Atualizar
        </button>
        <span className="ml-auto self-center text-xs text-gray-400">
          {total} registro(s)
        </span>
      </div>

      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table text-xs">
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Usuário</th>
                <th>Ação</th>
                <th>Campo</th>
                <th>Alteração</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">Carregando…</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">Nenhum registro.</td></tr>
              ) : logs.map(log => (
                <tr key={log.id}>
                  <td className="whitespace-nowrap">
                    {new Date(log.ts).toLocaleString('pt-BR')}
                  </td>
                  <td>{log.profiles?.full_name ?? log.user_id?.slice(0, 8) ?? '—'}</td>
                  <td>
                    <span className={`badge ${
                      log.acao === 'CREATE' ? 'bg-green-100 text-green-700' :
                      log.acao === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                      log.acao === 'DELETE' ? 'bg-red-100 text-red-700' :
                      log.acao === 'ASSIGN' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {log.acao}
                    </span>
                  </td>
                  <td className="text-slate-500">{log.campo_alterado ?? '—'}</td>
                  <td className="max-w-xs truncate text-slate-500" title={renderDiff(log)}>
                    {renderDiff(log)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100">
            <button className="btn-secondary text-xs" disabled={page === 0}
              onClick={() => setPage(p => p - 1)}>
              ← Anterior
            </button>
            <span className="text-xs text-gray-500">
              Página {page + 1} de {totalPages}
            </span>
            <button className="btn-secondary text-xs" disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}>
              Próximo →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
