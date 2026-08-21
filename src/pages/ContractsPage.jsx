import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ContractTable from '../components/ContractTable'
import ContractModal from '../components/ContractModal'

export default function ContractsPage() {
  const { profile } = useAuth()
  const [contracts, setContracts] = useState([])
  const [statusOptions, setStatusOptions] = useState([])
  const [gerencias, setGerencias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedContract, setSelectedContract] = useState(null)  // null = modal closed
  const [isNew, setIsNew] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [
        { data: contratos, error: eContratos },
        { data: status,    error: eStatus },
        { data: gers,      error: eGerencias },
      ] = await Promise.all([
        supabase
          .from('contratos')
          .select('*, status_options(nome, ordem), gerencias(nome), profiles!assigned_user_id(full_name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('status_options')
          .select('*')
          .order('ordem'),
        supabase
          .from('gerencias')
          .select('*')
          .order('nome'),
      ])
      if (eContratos) throw eContratos
      if (eStatus)    throw eStatus
      if (eGerencias) throw eGerencias
      setContracts(contratos ?? [])
      setStatusOptions(status ?? [])
      setGerencias(gers ?? [])
    } catch (err) {
      setError(err.message ?? 'Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60_000)
    return () => clearInterval(interval)
  }, [fetchData])

  function openNew() {
    setIsNew(true)
    setSelectedContract({})
  }

  function openEdit(contract) {
    setIsNew(false)
    setSelectedContract(contract)
  }

  function closeModal() {
    setSelectedContract(null)
    setIsNew(false)
  }

  async function handleSave(formData) {
    if (profile.role === 'usuario') {
      const { error } = await supabase.rpc('update_contrato_usuario', {
        p_contrato_id: selectedContract.id,
        p_status_id:   formData.status_id,
        p_observacao:  formData.observacao,
      })
      if (error) throw error
    } else if (isNew) {
      // created_by is required — inject the current user's id
      const { error } = await supabase.from('contratos').insert({
        ...formData,
        created_by: profile.id,
      })
      if (error) throw error
    } else {
      // Never update created_by on edits
      const { created_by, ...updateData } = formData
      const { error } = await supabase.from('contratos').update(updateData).eq('id', selectedContract.id)
      if (error) throw error
    }
    closeModal()
    await fetchData()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Contratos</h1>
          <p className="text-xs text-slate-400 mt-0.5">Gestão de embarques FOB</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="btn-secondary" title="Atualizar lista">
            ↺ Atualizar
          </button>
          {(profile?.role === 'admin' || profile?.role === 'gerente') && (
            <button onClick={openNew} className="btn-primary">
              + Novo Contrato
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert-error mb-5">
          {error}
        </div>
      )}

      <ContractTable
        contracts={contracts}
        statusOptions={statusOptions}
        loading={loading}
        onRowDoubleClick={openEdit}
      />

      {selectedContract !== null && (
        <ContractModal
          contract={selectedContract}
          isNew={isNew}
          statusOptions={statusOptions}
          gerencias={gerencias}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
