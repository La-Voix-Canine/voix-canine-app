import { useEffect, useState } from 'react'
import { Plus, Trash2, MapPin } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { BackHeader, TextInput, Checkbox, PrimaryButton, Toast } from '../components/ui'

export default function ParametresPage() {
  const [lieux, setLieux] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [nom, setNom] = useState('')
  const [necessitePrecision, setNecessitePrecision] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data, error } = await supabase
        .from('lieux')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      setLieux(data || [])
    } catch {
      setErrorMsg('Impossible de charger tes lieux. Vérifie ta connexion.')
    } finally {
      setLoading(false)
    }
  }

  function notify(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  async function handleAdd(e) {
    e.preventDefault()
    const value = nom.trim()
    if (!value) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('lieux')
        .insert([{ nom: value, necessite_precision: necessitePrecision }])
      if (error) throw error
      setNom('')
      setNecessitePrecision(false)
      load()
    } catch {
      notify("Erreur lors de l'ajout. Réessaie.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      const { error } = await supabase.from('lieux').delete().eq('id', id)
      if (error) throw error
      load()
    } catch {
      notify('Erreur lors de la suppression. Réessaie.')
    }
  }

  return (
    <div className="min-h-screen pb-10">
      <BackHeader title="Paramètres" subtitle="Tes lieux de séances / rendez-vous" />

      <main className="px-4 mt-4 flex flex-col gap-4">
        <p className="text-sm text-gray-500">
          Ce sont les lieux que tu retrouveras dans la liste, quand tu ajoutes une séance ou un rendez-vous
          (par exemple "À domicile", le nom de ton centre, "En ville"...). Ajoute ou supprime-les librement.
        </p>

        <form onSubmit={handleAdd} className="bg-white rounded-xl p-4 flex flex-col gap-3">
          <TextInput
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom du lieu (ex. À domicile, En ville...)"
          />
          <Checkbox
            checked={necessitePrecision}
            onChange={setNecessitePrecision}
            label="Demander une précision à chaque utilisation (ex. le nom de la ville pour « En ville »)"
          />
          <PrimaryButton type="submit" disabled={saving || !nom.trim()} className="flex items-center justify-center gap-1.5">
            <Plus size={18} /> Ajouter ce lieu
          </PrimaryButton>
        </form>

        {loading && <p className="text-center text-gray-400 py-6">Chargement...</p>}

        {!loading && errorMsg && (
          <div className="text-center bg-red-50 border border-red-100 rounded-lg px-3 py-3">
            <p className="text-red-600 text-sm mb-2">{errorMsg}</p>
            <button onClick={load} className="text-sm font-medium text-brand-dark underline">Réessayer</button>
          </div>
        )}

        {!loading && !errorMsg && lieux.length === 0 && (
          <p className="text-center text-gray-400 py-6 text-sm">
            Aucun lieu pour l'instant. Ajoute-en un ci-dessus pour commencer.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {lieux.map((l) => (
            <li key={l.id} className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm">
              <div className="min-w-0">
                <span className="text-sm">{l.nom}</span>
                {l.necessite_precision && (
                  <span className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <MapPin size={11} /> demande une précision à chaque fois
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(l.id)}
                className="p-2 text-gray-400 hover:text-red-600 shrink-0"
                aria-label={`Supprimer ${l.nom}`}
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      </main>

      <Toast message={toast} />
    </div>
  )
}
