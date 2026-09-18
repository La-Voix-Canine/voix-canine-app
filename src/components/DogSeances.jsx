import { useEffect, useMemo, useState } from 'react'
import { Plus, X, Check, Circle, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { fetchLieux, resolveLieuSelection, computeLieuValue } from '../lib/lieux'
import LieuField from './LieuField'
import { Field, TextInput, Textarea, PrimaryButton, SecondaryButton, Toast } from './ui'

function lieuLabel(v) {
  return v || '—'
}

export default function DogSeances({ dogId }) {
  const [seances, setSeances] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSeance, setEditingSeance] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    load()
  }, [dogId])

  async function load() {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data, error } = await supabase
        .from('seances')
        .select('*')
        .eq('dog_id', dogId)
        .order('date_seance', { ascending: false })
      if (error) throw error
      setSeances(data || [])
    } catch {
      setErrorMsg('Impossible de charger les séances. Vérifie ta connexion.')
    } finally {
      setLoading(false)
    }
  }

  // Vue d'ensemble : pour chaque exercice (par nom), garde le statut de la séance la plus récente
  const resume = useMemo(() => {
    const byName = new Map()
    // seances est trié du plus récent au plus ancien : on ne réécrit pas si déjà vu
    for (const s of seances) {
      for (const ex of s.exercices || []) {
        if (!ex.nom) continue
        if (!byName.has(ex.nom)) {
          byName.set(ex.nom, { nom: ex.nom, maitrise: !!ex.maitrise, date: s.date_seance })
        }
      }
    }
    return Array.from(byName.values())
  }, [seances])

  const aTravailler = resume.filter((r) => !r.maitrise)
  const maitrises = resume.filter((r) => r.maitrise)

  function notify(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  async function handleDelete(seance) {
    const label = new Date(seance.date_seance).toLocaleDateString('fr-FR')
    if (!window.confirm(`Supprimer la séance du ${label} ? Cette action est définitive.`)) return
    try {
      const { error } = await supabase.from('seances').delete().eq('id', seance.id)
      if (error) throw error
      notify('Séance supprimée.')
      load()
    } catch {
      notify('Erreur lors de la suppression.')
    }
  }

  const formOpen = showForm || !!editingSeance

  return (
    <div className="flex flex-col gap-4">
      {resume.length > 0 && (
        <div className="bg-white rounded-xl p-4">
          <h2 className="font-medium mb-2">Vue d'ensemble des exercices</h2>
          {aTravailler.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-accent mb-1.5">À retravailler</p>
              <div className="flex flex-wrap gap-1.5">
                {aTravailler.map((r) => (
                  <span key={r.nom} className="flex items-center gap-1 text-sm bg-orange-50 text-orange-700 border border-orange-100 rounded-full px-2.5 py-1">
                    <Circle size={12} /> {r.nom}
                  </span>
                ))}
              </div>
            </div>
          )}
          {maitrises.length > 0 && (
            <div>
              <p className="text-xs font-medium text-brand mb-1.5">Maîtrisés</p>
              <div className="flex flex-wrap gap-1.5">
                {maitrises.map((r) => (
                  <span key={r.nom} className="flex items-center gap-1 text-sm bg-green-50 text-green-700 border border-green-100 rounded-full px-2.5 py-1">
                    <Check size={12} /> {r.nom}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!formOpen && (
        <PrimaryButton type="button" onClick={() => setShowForm(true)} className="flex items-center justify-center gap-1.5">
          <Plus size={18} /> Ajouter une séance
        </PrimaryButton>
      )}

      {formOpen && (
        <SeanceForm
          dogId={dogId}
          seance={editingSeance}
          onCancel={() => {
            setShowForm(false)
            setEditingSeance(null)
          }}
          onSaved={() => {
            setShowForm(false)
            setEditingSeance(null)
            notify(editingSeance ? 'Séance modifiée.' : 'Séance enregistrée.')
            load()
          }}
        />
      )}

      <div className="flex flex-col gap-2">
        {loading && <p className="text-center text-gray-400 py-4">Chargement...</p>}
        {!loading && errorMsg && (
          <div className="text-center bg-red-50 border border-red-100 rounded-lg px-3 py-3">
            <p className="text-red-600 text-sm mb-2">{errorMsg}</p>
            <button onClick={load} className="text-sm font-medium text-brand-dark underline">Réessayer</button>
          </div>
        )}
        {!loading && !errorMsg && seances.length === 0 && (
          <p className="text-center text-gray-400 py-4 text-sm">Aucune séance enregistrée pour l'instant.</p>
        )}
        {seances.map((s) => (
          <div key={s.id} className="bg-white rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-sm">{new Date(s.date_seance).toLocaleDateString('fr-FR')}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{lieuLabel(s.lieu)}</span>
                <button onClick={() => setEditingSeance(s)} className="p-1 text-gray-400 hover:text-brand-dark" title="Modifier">
                  <Pencil size={15} />
                </button>
                <button onClick={() => handleDelete(s)} className="p-1 text-gray-400 hover:text-red-600" title="Supprimer">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            {s.notes && <p className="text-sm text-gray-600 mb-2">{s.notes}</p>}
            {(s.exercices || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {s.exercices.map((ex, i) => (
                  <span
                    key={i}
                    className={
                      'flex items-center gap-1 text-xs rounded-full px-2 py-1 border ' +
                      (ex.maitrise
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-orange-50 text-orange-700 border-orange-100')
                    }
                  >
                    {ex.maitrise ? <Check size={11} /> : <Circle size={11} />} {ex.nom}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Toast message={toast} />
    </div>
  )
}

function SeanceForm({ dogId, seance, onCancel, onSaved }) {
  const isEdit = !!seance
  const [date, setDate] = useState(seance?.date_seance || new Date().toISOString().slice(0, 10))
  const [lieuId, setLieuId] = useState('')
  const [precision, setPrecision] = useState('')
  const [unresolved, setUnresolved] = useState('')
  const [lieuxOptions, setLieuxOptions] = useState([])
  const [lieuxLoaded, setLieuxLoaded] = useState(false)
  const [notes, setNotes] = useState(seance?.notes || '')
  const [exercices, setExercices] = useState(
    seance?.exercices?.length ? seance.exercices : [{ nom: '', maitrise: false }]
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLieux()
      .then((list) => {
        setLieuxOptions(list)
        if (seance?.lieu) {
          const resolved = resolveLieuSelection(seance.lieu, list)
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

  function updateExercice(i, patch) {
    setExercices((list) => list.map((ex, idx) => (idx === i ? { ...ex, ...patch } : ex)))
  }
  function addExercice() {
    setExercices((list) => [...list, { nom: '', maitrise: false }])
  }
  function removeExercice(i) {
    setExercices((list) => list.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const cleaned = exercices.filter((ex) => ex.nom.trim())
    const lieuValue = computeLieuValue(lieuId, precision, lieuxOptions, unresolved)
    setSaving(true)
    setError('')
    try {
      if (isEdit) {
        const { error } = await supabase
          .from('seances')
          .update({ date_seance: date, lieu: lieuValue, notes, exercices: cleaned })
          .eq('id', seance.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('seances').insert([
          { dog_id: dogId, date_seance: date, lieu: lieuValue, notes, exercices: cleaned },
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
        <Field label="Date">
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
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

      <Field label="Notes / observations">
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      <div>
        <p className="text-sm font-medium mb-1.5">Exercices travaillés</p>
        <div className="flex flex-col gap-2">
          {exercices.map((ex, i) => (
            <div key={i} className="flex items-center gap-2">
              <TextInput
                placeholder="Nom de l'exercice"
                value={ex.nom}
                onChange={(e) => updateExercice(i, { nom: e.target.value })}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => updateExercice(i, { maitrise: !ex.maitrise })}
                className={
                  'w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 transition ' +
                  (ex.maitrise ? 'bg-brand border-brand text-white' : 'border-gray-300 text-gray-300')
                }
                title="Maîtrisé par le chien"
              >
                <Check size={18} />
              </button>
              <button
                type="button"
                onClick={() => removeExercice(i)}
                className="w-9 h-9 flex items-center justify-center text-gray-400 shrink-0"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addExercice}
          className="mt-2 text-sm text-brand-dark font-medium flex items-center gap-1"
        >
          <Plus size={16} /> Ajouter un exercice
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 mt-1">
        <SecondaryButton type="button" onClick={onCancel} className="flex-1">
          Annuler
        </SecondaryButton>
        <PrimaryButton type="submit" disabled={saving} className="flex-1">
          {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Enregistrer'}
        </PrimaryButton>
      </div>
    </form>
  )
}
