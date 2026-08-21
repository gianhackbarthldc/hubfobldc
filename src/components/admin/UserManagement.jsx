import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const ROLES = ['admin', 'gerente', 'usuario']
const EMPTY_FORM = { full_name: '', role: 'usuario', gerencia_id: '' }

export default function UserManagement() {
  const [users, setUsers]       = useState([])
  const [gerencias, setGerencias] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState(null)

  async function fetchAll() {
    setLoading(true)
    setError(null)
    const [
      { data: profs, error: eProfs },
      { data: gers,  error: eGers  },
    ] = await Promise.all([
      supabase.from('profiles').select('*, gerencias(nome)').order('full_name'),
      supabase.from('gerencias').select('*').order('nome'),
    ])
    if (eProfs) setError(eProfs.message)
    else        setUsers(profs ?? [])
    if (!eGers) setGerencias(gers ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  function openNew() {
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowModal(true)
  }

  function openEdit(user) {
    setForm({
      id:          user.id,
      full_name:   user.full_name ?? '',
      role:        user.role ?? 'usuario',
      gerencia_id: user.gerencia_id ?? '',
    })
    setFormError(null)
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      if (form.id) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name:   form.full_name,
            role:        form.role,
            gerencia_id: form.gerencia_id || null,
          })
          .eq('id', form.id)
        if (error) throw error
      } else {
        // New users must be created via Supabase Auth (admin SDK or invite flow).
        // Here we use the admin.createUser API — requires service_role key on the client.
        const { data, error: eSignup } = await supabase.auth.admin.createUser({
          email:         form.email,
          password:      form.password,
          email_confirm: true,
          user_metadata: { full_name: form.full_name },
        })
        if (eSignup) throw eSignup
        const { error: eProf } = await supabase.from('profiles').update({
          full_name:   form.full_name,
          role:        form.role,
          gerencia_id: form.gerencia_id || null,
        }).eq('id', data.user.id)
        if (eProf) throw eProf
      }
      setShowModal(false)
      await fetchAll()
    } catch (err) {
      setFormError(err.message ?? 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="font-semibold text-slate-700">Usuários</h2>
        <button className="btn-primary" onClick={openNew}>+ Novo Usuário</button>
      </div>

      {error && <div className="alert-error mb-4">{error}</div>}

      <div className="card p-0 overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>

              <th>Perfil</th>
              <th>Gerência</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center text-sm text-slate-400">Carregando…</td></tr>
            ) : users.map(u => (
              <tr key={u.id}>
                <td className="font-medium">{u.full_name}</td>
                <td><span className="badge bg-slate-100 text-slate-600">{u.role}</span></td>
                <td>{u.gerencias?.nome ?? '—'}</td>
                <td>
                  <button className="btn-secondary text-xs px-2.5 py-1" onClick={() => openEdit(u)}>
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">{form.id ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            {formError && <div className="mb-3 text-sm text-red-600">{formError}</div>}
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="label">Nome Completo</label>
                <input className="input" required value={form.full_name}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Perfil</label>
                <select className="input" value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Gerência</label>
                <select className="input" value={form.gerencia_id}
                  onChange={e => setForm(p => ({ ...p, gerencia_id: e.target.value }))}>
                  <option value="">— Nenhuma —</option>
                  {gerencias.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
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
