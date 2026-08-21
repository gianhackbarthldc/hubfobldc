import { useState, useMemo } from 'react'

// Deterministic palette based on status order
const PALETTE = ['#94a3b8', '#f59e0b', '#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ec4899']

function StatusBadge({ status, colorMap }) {
  if (!status) return <span className="badge bg-slate-100 text-slate-500">—</span>
  const bg = colorMap[status.id] ?? '#94a3b8'
  return (
    <span className="badge" style={{ backgroundColor: bg, color: '#fff' }}>
      {status.nome}
    </span>
  )
}

const COLS = [
  { key: 'cod_contrato',     label: 'Contrato'         },
  { key: 'fornecedor',       label: 'Fornecedor'        },
  { key: 'embarque',         label: 'Embarque'          },
  { key: 'saldo_a_embarcar', label: 'Saldo a Embarcar',
    render: (v) => v != null ? Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '—' },
  { key: 'data_entrega',     label: 'Entrega',
    render: (v) => v ? new Date(v + 'T00:00:00').toLocaleDateString('pt-BR') : '—' },
  { key: 'data_pagamento',   label: 'Pagamento',
    render: (v) => v ? new Date(v + 'T00:00:00').toLocaleDateString('pt-BR') : '—' },
  { key: 'gerencias',        label: 'Gerência',   render: (v) => v?.nome ?? '—' },
  { key: 'profiles',         label: 'Responsável', render: (v) => v?.full_name ?? '—' },
  { key: 'status_options',   label: 'Status',
    render: (v, row, extra) => <StatusBadge status={row.status_options} colorMap={extra.colorMap} /> },
]

export default function ContractTable({ contracts, statusOptions, loading, onRowDoubleClick }) {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Build id→color map from statusOptions ordered by ordem
  const colorMap = useMemo(() => {
    const sorted = [...statusOptions].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
    return Object.fromEntries(sorted.map((s, i) => [s.id, PALETTE[i % PALETTE.length]]))
  }, [statusOptions])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return contracts.filter(c => {
      const matchSearch = !q ||
        (c.cod_contrato ?? '').toLowerCase().includes(q) ||
        (c.fornecedor ?? '').toLowerCase().includes(q) ||
        (c.embarque ?? '').toLowerCase().includes(q) ||
        (c.gerencias?.nome ?? '').toLowerCase().includes(q) ||
        (c.profiles?.full_name ?? '').toLowerCase().includes(q)
      const matchStatus = !filterStatus || c.status_id === filterStatus
      return matchSearch && matchStatus
    })
  }, [contracts, search, filterStatus])

  return (
    <div className="card p-0 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <input
          className="input w-56"
          placeholder="Buscar contrato, fornecedor…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="input w-48"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          {statusOptions.map(s => (
            <option key={s.id} value={s.id}>{s.nome}</option>
          ))}
        </select>
        <span className="ml-auto text-xs text-slate-400">
          {filtered.length} / {contracts.length} contrato(s)
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>{COLS.map(c => <th key={c.key}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={COLS.length} className="py-16 text-center text-sm text-slate-400">
                  Carregando…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={COLS.length} className="py-16 text-center text-sm text-slate-400">
                  Nenhum contrato encontrado.
                </td>
              </tr>
            ) : filtered.map(row => (
              <tr
                key={row.id}
                className="cursor-pointer"
                onDoubleClick={() => onRowDoubleClick(row)}
                title="Duplo clique para editar"
              >
                {COLS.map(col => (
                  <td key={col.key}>
                    {col.render
                      ? col.render(row[col.key], row, { colorMap })
                      : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
