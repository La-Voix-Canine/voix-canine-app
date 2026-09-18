import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Plus, PawPrint } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { Field, TextInput, Select, PrimaryButton, SecondaryButton } from './ui'
import DogPanel from './DogPanel'

export default function DogsSection({ clientId, initialOpenId }) {
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [openId, setOpenId] = useState(initialOpenId || null)
  const [showNewForm, setShowNewForm] = useState(false)

  useEffect(() => {
    load()
  }, [clientId])

  async function load() {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data, error } = await supabase
        .from('dogs')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true })
      if (error) throw error
      setDogs(data || [])
    } catch {
      setErrorMsg('Impossible de charger les chiens. Vérifie ta connexion.')
    } finally {
      setLoading(false)
    }
  }

  function handleUpdated(updated) {
    setDogs((list) => list.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)))
  }

  function handleDeleted() {
    setOpenId(null)
    load()
  }

  return (
    <div className="flex flex-col gap-3">
      {loading && <p className="text-center text-gray-400 py-6">Chargement...</p>}

      {!loading && errorMsg && (
        <div className="text-center bg-red-50 border border-red-100 rounded-lg px-3 py-3">
          <p className="text-red-600 text-sm mb-2">{errorMsg}</p>
          <button onClick={load} className="text-sm font-medium text-brand-dark underline">Réessayer</button>
        </div>
      )}

      {!loading && !errorMsg && dogs.length === 0 && !showNewForm && (
        <p className="text-center text-gray-400 py-6 text-sm">Aucun chien enregistré pour ce client.</p>
      )}

      {dogs.map((dog) => {
        const open = openId === dog.id
        return (
          <div key={dog.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenId(open ? null : dog.id)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                  {dog.photo_url ? (
                    <img src={dog.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <PawPrint size={18} className="text-gray-400" />
                  )}
                </div>
                <div className="text-left">
                  <p className="font-medium">{dog.nom}</p>
                  {(dog.race || dog.sexe) && (
                    <p className="text-xs text-gray-400">
                      {dog.race}
                      {dog.race && dog.sexe ? ' · ' : ''}
                      {dog.sexe === 'male' ? 'Mâle' : dog.sexe === 'femelle' ? 'Femelle' : ''}
                    </p>
                  )}
                </div>
              </div>
              {open ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
            </button>
            {open && (
              <div className="border-t border-gray-100">
                <DogPanel dog={dog} onDogUpdated={handleUpdated} onDogDeleted={handleDeleted} />
              </div>
            )}
          </div>
        )
      })}

      {!showNewForm ? (
        <SecondaryButton type="button" onClick={() => setShowNewForm(true)} className="flex items-center justify-center gap-1.5">
          <Plus size={18} /> Ajouter un chien
        </SecondaryButton>
      ) : (
        <NewDogForm
          clientId={clientId}
          onCancel={() => setShowNewForm(false)}
          onCreated={(dog) => {
            setShowNewForm(false)
            setDogs((list) => [...list, dog])
            setOpenId(dog.id)
          }}
        />
      )}
    </div>
  )
}

function NewDogForm({ clientId, onCancel, onCreated }) {
  const [nom, setNom] = useState('')
  const [race, setRace] = useState('')
  const [sexe, setSexe] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nom.trim()) return
    setSaving(true)
    setError('')
    try {
      const { data, error } = await supabase
        .from('dogs')
        .insert([{ client_id: clientId, nom, race, sexe: sexe || null }])
        .select()
        .single()
      if (error) throw error
      onCreated(data)
    } catch {
      setError("Erreur lors de la création. Vérifie ta connexion.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 flex flex-col gap-3">
      <Field label="Nom du chien *">
        <TextInput value={nom} onChange={(e) => setNom(e.target.value)} required autoFocus />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Race">
          <TextInput value={race} onChange={(e) => setRace(e.target.value)} />
        </Field>
        <Field label="Sexe">
          <Select value={sexe} onChange={(e) => setSexe(e.target.value)}>
            <option value="">—</option>
            <option value="male">Mâle</option>
            <option value="femelle">Femelle</option>
          </Select>
        </Field>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <SecondaryButton type="button" onClick={onCancel} className="flex-1">Annuler</SecondaryButton>
        <PrimaryButton type="submit" disabled={saving} className="flex-1">
          {saving ? 'Création...' : 'Ajouter'}
        </PrimaryButton>
      </div>
    </form>
  )
}
