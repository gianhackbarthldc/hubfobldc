import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const PALETTE = ['#94a3b8', '#f59e0b', '#3b82f6', '#f97316', '#10b981', '#8b5cf6', '#ec4899']

export default function StatusManagement() {
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState({ id: null, nome: '' })
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState(null)
  const dragIndex = useRef(null)

  async function fetchStatuses() {
    setLoading(true)
    const { data, error } = await supabase.from('status_options').select('*').order('ordem')
    if (error) setError(error.message)
    else setStatuses(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchStatuses() }, [])

  function openNew() {
    setForm({ id: null, nome: '' })
    setFormError(null)
    setShowModal(true)
  }

  function openEdit(s) {
    setForm({ id: s.id, nome: s.nome })
    setFormError(null)
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      if (form.id) {
        const { error } = await supabase.from('status_options')
          .update({ nome: form.nome })
          .eq('id', form.id)
        if (error) throw error
      } else {
        const maxOrdem = statuses.length > 0 ? Math.max(...statuses.map(s => s.ordem ?? 0)) : 0
        const { error } = await supabase.from('status_options')
          .insert({ nome: form.nome, ordem: maxOrdem + 1 })
        if (error) throw error
      }
      setShowModal(false)
      await fetchStatuses()
    } catch (err) {
      setFormError(err.message ?? 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover este status? Contratos com este status perderao a referencia.')) return
    const { error } = await supabase.from('status_options').delete().eq('id', id)
    if (error) setError(error.message)
    else await fetchStatuses()
  }

  function onDragStart(e, index) {
    dragIndex.current = index
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDragOver(e, index) {
    e.preventDefault()
    if (dragIndex.current === null || dragIndex.current === index) return
    const reordered = [...statuses]
    const [moved] = reordered.splice(dragIndex.current, 1)
    reordered.splice(index, 0, moved)
    dragIndex.current = index
    setStatuses(reordered)
  }

  async function onDragEnd() {
    dragIndex.current = null
    const updates = statuses.map((s, i) =>
      supabase.from('status_options').update({ ordem: i + 1 }).eq('id', s.id)
    )
    await Promise.all(updates)
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-slate-700">Status de Embarque</h2>
          <p className="text-xs text-slate-400 mt-0.5">Arraste as linhas para reordenar</p>
        </div>
        <button className="btn-primary" onClick={openNew}>+ Novo Status</button>
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}

      <div className="card p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr><th></th><th>Ordem</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center text-sm text-slate-400">Carregando...</td></tr>
            ) : statuses.map((s, i) => (
              <tr
                key={s.id}
                draggable
                onDragStart={e => onDragStart(e, i)}
                onDragOver={e => onDragOver(e, i)}
                onDragEnd={onDragEnd}
                className="cursor-grab active:cursor-grabbing"
              >
                <td className="text-slate-300 select-none w-8">&#8285;</td>
                <td className="text-slate-400 w-12">{i + 1}</td>
                <td>
                  <span className="badge" style={{ backgroundColor: PALETTE[i % PALETTE.length], color: '#fff' }}>
                    {s.nome}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button className="btn-secondary text-xs px-2.5 py-1" onClick={() => openEdit(s)}>
                      Editar
                    </button>
                    <button className="text-xs px-2 py-1 text-red-500 hover:text-red-700 transition-colors"
                      onClick={() => handleDelete(s.id)}>
                      Remover
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="card w-full max-w-sm shadow-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">{form.id ? 'Editar Status' : 'Novo Status'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">x</button>
            </div>
            {formError && <div className="alert-error mb-3">{formError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Nome</label>
                <input className="input" required value={form.nome}
                  onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
