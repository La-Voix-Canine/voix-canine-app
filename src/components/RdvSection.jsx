import { useEffect, useState } from 'react'
import { Plus, CalendarPlus, Check, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { downloadIcs } from '../lib/ics'
import { fetchLieux, resolveLieuSelection, computeLieuValue } from '../lib/lieux'
import LieuField from './LieuField'
import { Field, TextInput, Textarea, Select, TimeSelect, PrimaryButton, SecondaryButton, Toast } from './ui'

function lieuLabel(v) {
  return v || '—'
}

export default function RdvSection({ clientId, clientNom, dogs }) {
  const [rdvs, setRdvs] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingRdv, setEditingRdv] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    load()
  }, [clientId])

  async function load() {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data, error } = await supabase
        .from('rdv')
        .select('*')
        .eq('client_id', clientId)
        .order('date_rdv', { ascending: true })
      if (error) throw error
      setRdvs(data || [])
    } catch {
      setErrorMsg('Impossible de charger les rendez-vous. Vérifie ta connexion.')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const aVenir = rdvs.filter((r) => r.date_rdv >= today && !r.fait)
  const passes = rdvs.filter((r) => r.date_rdv < today || r.fait).reverse()

  function notify(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  async function toggleFait(rdv) {
    try {
      const { error } = await supabase.from('rdv').update({ fait: !rdv.fait }).eq('id', rdv.id)
      if (error) throw error
      load()
    } catch {
      notify('Erreur, réessaie.')
    }
  }

  async function handleDelete(rdv) {
    const label = new Date(rdv.date_rdv).toLocaleDateString('fr-FR')
    if (!window.confirm(`Supprimer le rendez-vous du ${label} ? Cette action est définitive.`)) return
    try {
      const { error } = await supabase.from('rdv').delete().eq('id', rdv.id)
      if (error) throw error
      notify('Rendez-vous supprimé.')
      load()
    } catch {
      notify('Erreur lors de la suppression.')
    }
  }

  function exportToAgenda(rdv) {
    const dogNom = dogs.find((d) => d.id === rdv.dog_id)?.nom
    downloadIcs({
      title: `Éducation canine — ${clientNom}${dogNom ? ' (' + dogNom + ')' : ''}`,
      description: rdv.notes || '',
      date: rdv.date_rdv,
      time: rdv.heure_rdv,
    })
    notify("Fichier ajouté aux téléchargements — ouvre-le pour l'ajouter à ton agenda.")
  }

  const formOpen = showForm || !!editingRdv

  return (
    <div className="flex flex-col gap-4">
      {aVenir[0] && (
        <div className="bg-brand-dark text-white rounded-xl p-4">
          <p className="text-xs text-white/70 mb-1">Prochain rendez-vous</p>
          <p className="font-medium">
            {new Date(aVenir[0].date_rdv).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            {aVenir[0].heure_rdv ? ` à ${aVenir[0].heure_rdv.slice(0, 5)}` : ''}
          </p>
          <p className="text-sm text-white/80">{lieuLabel(aVenir[0].lieu)}</p>
        </div>
      )}

      {!formOpen && (
        <PrimaryButton type="button" onClick={() => setShowForm(true)} className="flex items-center justify-center gap-1.5">
          <Plus size={18} /> Ajouter un rendez-vous
        </PrimaryButton>
      )}

      {formOpen && (
        <RdvForm
          clientId={clientId}
          dogs={dogs}
          rdv={editingRdv}
          onCancel={() => {
            setShowForm(false)
            setEditingRdv(null)
          }}
          onSaved={() => {
            setShowForm(false)
            setEditingRdv(null)
            notify(editingRdv ? 'Rendez-vous modifié.' : 'Rendez-vous ajouté.')
            load()
          }}
        />
      )}

      {loading && <p className="text-center text-gray-400 py-4">Chargement...</p>}

      {!loading && errorMsg && (
        <div className="text-center bg-red-50 border border-red-100 rounded-lg px-3 py-3">
          <p className="text-red-600 text-sm mb-2">{errorMsg}</p>
          <button onClick={load} className="text-sm font-medium text-brand-dark underline">Réessayer</button>
        </div>
      )}

      {!loading && !errorMsg && aVenir.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 mb-2">À venir</p>
          <div className="flex flex-col gap-2">
            {aVenir.map((r) => (
              <RdvRow
                key={r.id}
                rdv={r}
                dogs={dogs}
                onToggleFait={toggleFait}
                onExport={exportToAgenda}
                onEdit={() => setEditingRdv(r)}
                onDelete={() => handleDelete(r)}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && passes.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 mb-2 mt-2">Passés</p>
          <div className="flex flex-col gap-2">
            {passes.map((r) => (
              <RdvRow
                key={r.id}
                rdv={r}
                dogs={dogs}
                onToggleFait={toggleFait}
                onExport={exportToAgenda}
                onEdit={() => setEditingRdv(r)}
                onDelete={() => handleDelete(r)}
                muted
              />
            ))}
          </div>
        </div>
      )}

      {!loading && !errorMsg && rdvs.length === 0 && (
        <p className="text-center text-gray-400 py-4 text-sm">Aucun rendez-vous enregistré.</p>
      )}

      <Toast message={toast} />
    </div>
  )
}

function RdvRow({ rdv, dogs, onToggleFait, onExport, onEdit, onDelete, muted }) {
  const dogNom = dogs.find((d) => d.id === rdv.dog_id)?.nom
  return (
    <div className={'bg-white rounded-xl p-4 flex items-center justify-between gap-2 ' + (muted ? 'opacity-60' : '')}>
      <div className="min-w-0">
        <p className="font-medium text-sm">
          {new Date(rdv.date_rdv).toLocaleDateString('fr-FR')}{rdv.heure_rdv ? ` à ${rdv.heure_rdv.slice(0, 5)}` : ''}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {lieuLabel(rdv.lieu)}{dogNom ? ' · ' + dogNom : ''}
        </p>
        {rdv.notes && <p className="text-sm text-gray-600 mt-1 truncate">{rdv.notes}</p>}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onExport(rdv)}
          className="p-2 text-gray-400 hover:text-brand-dark"
          title="Ajouter à l'agenda du téléphone"
        >
          <CalendarPlus size={18} />
        </button>
        <button onClick={onEdit} className="p-2 text-gray-400 hover:text-brand-dark" title="Modifier">
          <Pencil size={16} />
        </button>
        <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-600" title="Supprimer">
          <Trash2 size={16} />
        </button>
        <button
          onClick={() => onToggleFait(rdv)}
          className={'p-2 rounded-full ' + (rdv.fait ? 'text-white bg-brand' : 'text-gray-300 border border-gray-300')}
          title="Marquer comme fait"
        >
          <Check size={16} />
        </button>
      </div>
    </div>
  )
}

function RdvForm({ clientId, dogs, rdv, onCancel, onSaved }) {
  const isEdit = !!rdv
  const [date, setDate] = useState(rdv?.date_rdv || '')
  const [heure, setHeure] = useState(rdv?.heure_rdv ? rdv.heure_rdv.slice(0, 5) : '')
  const [lieuId, setLieuId] = useState('')
  const [precision, setPrecision] = useState('')
  const [unresolved, setUnresolved] = useState('')
  const [lieuxOptions, setLieuxOptions] = useState([])
  const [lieuxLoaded, setLieuxLoaded] = useState(false)
  const [dogId, setDogId] = useState(rdv?.dog_id || '')
  const [notes, setNotes] = useState(rdv?.notes || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLieux()
      .then((list) => {
        setLieuxOptions(list)
        if (rdv?.lieu) {
          const resolved = resolveLieuSelection(rdv.lieu, list)
          setLieuId(resolved.lieuId)
          setPrecision(resolved.precision)
          setUnresolved(resolved.unresolved)
        } else if (list.length > 0) {
          setLieuId((prev) => prev || list[0].id)
        }
      })
      .catch(() => {})
      .finally(() => setLieuxLoaded(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!date) return
    setSaving(true)
    setError('')
    const lieuValue = computeLieuValue(lieuId, precision, lieuxOptions, unresolved)
    try {
      if (isEdit) {
        const { error } = await supabase
          .from('rdv')
          .update({
            dog_id: dogId || null,
            date_rdv: date,
            heure_rdv: heure || null,
            lieu: lieuValue,
            notes,
          })
          .eq('id', rdv.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('rdv').insert([
          {
            client_id: clientId,
            dog_id: dogId || null,
            date_rdv: date,
            heure_rdv: heure || null,
            lieu: lieuValue,
            notes,
          },
        ])
        if (error) throw error
      }
      onSaved()
    } catch {
      setError("Erreur lors de l'enregistrement. Vérifie ta connexion.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date *">
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <Field label="Heure">
          <TimeSelect value={heure} onChange={setHeure} />
        </Field>
      </div>
      <LieuField
        lieuxOptions={lieuxOptions}
        lieuxLoaded={lieuxLoaded}
        lieuId={lieuId}
        onLieuIdChange={setLieuId}
        precision={precision}
        onPrecisionChange={setPrecision}
        unresolved={unresolved}
      />
      {dogs.length > 0 && (
        <Field label="Chien concerné">
          <Select value={dogId} onChange={(e) => setDogId(e.target.value)}>
            <option value="">—</option>
            {dogs.map((d) => (
              <option key={d.id} value={d.id}>{d.nom}</option>
            ))}
          </Select>
        </Field>
      )}
      <Field label="Notes">
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <SecondaryButton type="button" onClick={onCancel} className="flex-1">Annuler</SecondaryButton>
        <PrimaryButton type="submit" disabled={saving} className="flex-1">
          {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Ajouter'}
        </PrimaryButton>
      </div>
    </form>
  )
}
