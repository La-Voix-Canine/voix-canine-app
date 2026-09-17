import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { BackHeader, TabBar } from '../components/ui'
import ClientInfoForm from '../components/ClientInfoForm'
import DogsSection from '../components/DogsSection'
import RdvSection from '../components/RdvSection'
import ReglementSection from '../components/ReglementSection'

const TABS = [
  { value: 'infos', label: 'Infos' },
  { value: 'chiens', label: 'Chiens' },
  { value: 'rdv', label: 'RDV' },
  { value: 'reglement', label: 'Règlement' },
]

export default function ClientDetailPage() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()

  const [client, setClient] = useState(null)
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [loadError, setLoadError] = useState('')
  const [tab, setTab] = useState('infos')

  useEffect(() => {
    if (isNew) {
      setClient(null)
      setLoading(false)
      setTab('infos')
      return
    }
    load()
  }, [id])

  async function load() {
    setLoading(true)
    setLoadError('')
    try {
      const { data: clientData, error: clientError } = await supabase.from('clients').select('*').eq('id', id).single()
      if (clientError) throw clientError
      const { data: dogsData, error: dogsError } = await supabase.from('dogs').select('*').eq('client_id', id).order('created_at')
      if (dogsError) throw dogsError
      setClient(clientData)
      setDogs(dogsData || [])
    } catch {
      setLoadError("Impossible de charger cette fiche. Vérifie ta connexion et réessaie.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Chargement...</div>
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-red-600 text-sm">{loadError}</p>
        <button onClick={load} className="text-sm font-medium text-brand-dark underline">
          Réessayer
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-10">
      <BackHeader title={isNew ? 'Nouveau client' : client?.nom} subtitle={isNew ? undefined : 'Fiche client'} />
      {!isNew && <TabBar tabs={TABS} value={tab} onChange={setTab} />}

      <main className="px-4 mt-4">
        {tab === 'infos' && (
          <ClientInfoForm
            client={client}
            isNew={isNew}
            onSaved={(updated) => setClient((c) => ({ ...c, ...updated }))}
            onDeleted={() => navigate('/', { replace: true })}
          />
        )}
        {!isNew && tab === 'chiens' && <DogsSection clientId={id} />}
        {!isNew && tab === 'rdv' && <RdvSection clientId={id} clientNom={client?.nom} dogs={dogs} />}
        {!isNew && tab === 'reglement' && <ReglementSection clientId={id} dogs={dogs} />}
      </main>
    </div>
  )
}
