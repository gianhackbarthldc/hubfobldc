import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const EMPTY_FORM = { nome: '' }

export default function GerenciaManagement() {
  const [gerencias, setGerencias] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState(null)

  async function fetchGerencias() {
    setLoading(true)
    const { data, error } = await supabase.from('gerencias').select('*').order('nome')
    if (error) setError(error.message)
    else setGerencias(data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchGerencias() }, [])

  function openNew() {
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowModal(true)
  }

  function openEdit(g) {
    setForm({ id: g.id, nome: g.nome })
    setFormError(null)
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      if (form.id) {
        const { error } = await supabase.from('gerencias')
          .update({ nome: form.nome })
          .eq('id', form.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('gerencias')
          .insert({ nome: form.nome })
        if (error) throw error
      }
      setShowModal(false)
      await fetchGerencias()
    } catch (err) {
      setFormError(err.message ?? 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover esta gerência? Usuários e contratos vinculados perderão a referência.')) return
    const { error } = await supabase.from('gerencias').delete().eq('id', id)
    if (error) setError(error.message)
    else await fetchGerencias()
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="font-semibold text-slate-700">Gerências</h2>
        <button className="btn-primary" onClick={openNew}>+ Nova Gerência</button>
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}

      <div className="card p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={2} className="py-12 text-center text-sm text-slate-400">Carregando…</td></tr>
            ) : gerencias.length === 0 ? (
              <tr><td colSpan={2} className="py-12 text-center text-sm text-slate-400">Nenhuma gerência cadastrada.</td></tr>
            ) : gerencias.map(g => (
              <tr key={g.id}>
                <td className="font-medium">{g.nome}</td>
                <td className="flex gap-2 justify-end">
                  <button className="btn-secondary text-xs px-2.5 py-1" onClick={() => openEdit(g)}>Editar</button>
                  <button className="btn-danger text-xs px-2.5 py-1" onClick={() => handleDelete(g.id)}>Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-sm p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-slate-800">{form.id ? 'Editar Gerência' : 'Nova Gerência'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">✕</button>
            </div>
            {formError && <div className="alert-error mb-4">{formError}</div>}
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="label">Nome</label>
                <input className="input" required value={form.nome}
                  onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Salvando…' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
