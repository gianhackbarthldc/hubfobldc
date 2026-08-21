import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

// Columns match migration_001_initial.sql exactly
const EMPTY = {
  cod_contrato:     '',
  fornecedor:       '',
  embarque:         '',
  saldo_a_embarcar: '',
  data_entrega:     '',
  data_pagamento:   '',
  status_id:        '',
  gerencia_id:      '',
  assigned_user_id: '',
  observacao:       '',
}

export default function ContractModal({ contract, isNew, statusOptions, gerencias, onSave, onClose }) {
  const { profile } = useAuth()
  const isUsuario = profile?.role === 'usuario'

  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isNew) {
      setForm({ ...EMPTY, gerencia_id: profile?.gerencia_id ?? '' })
    } else {
      setForm({
        cod_contrato:     contract.cod_contrato ?? '',
        fornecedor:       contract.fornecedor ?? '',
        embarque:         contract.embarque ?? '',
        saldo_a_embarcar: contract.saldo_a_embarcar ?? '',
        data_entrega:     contract.data_entrega ?? '',
        data_pagamento:   contract.data_pagamento ?? '',
        status_id:        contract.status_id ?? '',
        gerencia_id:      contract.gerencia_id ?? '',
        assigned_user_id: contract.assigned_user_id ?? '',
        observacao:       contract.observacao ?? '',
      })
    }
  }, [contract, isNew, profile])

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = isUsuario
        ? { status_id: form.status_id || null, observacao: form.observacao || null }
        : {
            cod_contrato:     form.cod_contrato || null,
            fornecedor:       form.fornecedor || null,
            embarque:         form.embarque || null,
            saldo_a_embarcar: form.saldo_a_embarcar !== '' ? Number(form.saldo_a_embarcar) : 0,
            data_entrega:     form.data_entrega || null,
            data_pagamento:   form.data_pagamento || null,
            status_id:        form.status_id || null,
            gerencia_id:      form.gerencia_id || null,
            assigned_user_id: form.assigned_user_id || null,
            observacao:       form.observacao || null,
          }
      await onSave(payload)
    } catch (err) {
      setError(err.message ?? 'Erro ao salvar contrato.')
    } finally {
      setSaving(false)
    }
  }

  const F = ({ label, id, type = 'text', disabled = false }) => (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input id={id} type={type} disabled={disabled}
        className="input" value={form[id] ?? ''}
        onChange={e => set(id, e.target.value)} />
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="card w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-800">
              {isNew ? 'Novo Contrato' : `Contrato ${contract.cod_contrato ?? '-'}`}
            </h2>
            {!isNew && <p className="text-xs text-slate-400 mt-0.5">Editar informacoes do embarque</p>}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            x
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {isUsuario && (
            <div className="alert-warning">
              Seu perfil permite alterar apenas <strong>Status</strong> e <strong>Observacao</strong>.
            </div>
          )}
          {error && <div className="alert-error">{error}</div>}

          <form id="contract-form" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <F label="Codigo do Contrato" id="cod_contrato"     disabled={isUsuario} />
              <F label="Fornecedor"          id="fornecedor"       disabled={isUsuario} />
              <div className="sm:col-span-2">
                <label className="label" htmlFor="embarque">Embarque</label>
                <input id="embarque" type="text" disabled={isUsuario} className="input"
                  value={form.embarque} onChange={e => set('embarque', e.target.value)} />
              </div>
              <F label="Saldo a Embarcar"    id="saldo_a_embarcar" type="number" disabled={isUsuario} />
              <div />
              <F label="Data de Entrega"     id="data_entrega"     type="date"   disabled={isUsuario} />
              <F label="Data de Pagamento"   id="data_pagamento"   type="date"   disabled={isUsuario} />

              <div>
                <label className="label" htmlFor="gerencia_id">Gerencia</label>
                <select id="gerencia_id" className="input" disabled={isUsuario}
                  value={form.gerencia_id} onChange={e => set('gerencia_id', e.target.value)}>
                  <option value="">- Selecione -</option>
                  {gerencias.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="status_id">Status *</label>
                <select id="status_id" className="input" required
                  value={form.status_id} onChange={e => set('status_id', e.target.value)}>
                  <option value="">- Selecione -</option>
                  {statusOptions.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="label" htmlFor="observacao">Observacao</label>
                <textarea id="observacao" rows={3} className="input resize-none"
                  value={form.observacao} onChange={e => set('observacao', e.target.value)} />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" form="contract-form" disabled={saving} className="btn-primary">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}
