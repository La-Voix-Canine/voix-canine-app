import { useEffect, useState } from 'react'
import { Plus, X, Check, Circle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { Checkbox, TextInput, Toast } from './ui'

const ITEMS = [
  { key: 'eb_marche_au_pied', label: 'Marche au pied' },
  { key: 'eb_changement_direction', label: 'Changement de direction' },
  { key: 'eb_stop', label: 'Stop' },
  { key: 'eb_pas_bouge', label: 'Pas bougé (reste en place)' },
  { key: 'eb_assis', label: 'Assis' },
  { key: 'eb_couche', label: 'Couché' },
  { key: 'eb_absence', label: 'Absence' },
  { key: 'eb_rappel_sans_distraction', label: 'Rappel — sans distraction' },
  { key: 'eb_rappel_avec_distraction', label: 'Rappel — avec distraction' },
]

export default function DogEducationBase({ dog, onSaved }) {
  const [values, setValues] = useState(dog)
  const [toast, setToast] = useState('')
  const [newExercice, setNewExercice] = useState('')

  useEffect(() => setValues(dog), [dog])

  const doneCount = ITEMS.filter((it) => values[it.key]).length
  const dressageExercices = values.dressage_exercices || []

  async function toggle(key, current) {
    const previous = values
    const next = { ...values, [key]: !current }
    setValues(next)
    try {
      const { error } = await supabase.from('dogs').update({ [key]: !current }).eq('id', dog.id)
      if (error) throw error
      onSaved?.(next)
    } catch {
      setToast('Erreur, réessaie.')
      setValues(previous)
      setTimeout(() => setToast(''), 2000)
    }
  }

  async function persistDressage(nextList) {
    const previous = values
    const next = { ...values, dressage_exercices: nextList }
    setValues(next)
    try {
      const { error } = await supabase.from('dogs').update({ dressage_exercices: nextList }).eq('id', dog.id)
      if (error) throw error
      onSaved?.(next)
    } catch {
      setToast('Erreur, réessaie.')
      setValues(previous)
      setTimeout(() => setToast(''), 2000)
    }
  }

  function addExercice() {
    if (!newExercice.trim()) return
    persistDressage([...dressageExercices, { nom: newExercice.trim(), maitrise: false }])
    setNewExercice('')
  }

  function toggleExercice(i) {
    persistDressage(dressageExercices.map((ex, idx) => (idx === i ? { ...ex, maitrise: !ex.maitrise } : ex)))
  }

  function removeExercice(i) {
    persistDressage(dressageExercices.filter((_, idx) => idx !== i))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-medium">Éducation de base</h2>
          <span className="text-sm text-gray-400">{doneCount}/{ITEMS.length} maîtrisé{doneCount > 1 ? 's' : ''}</span>
        </div>
        <div className="flex flex-col">
          {ITEMS.map((it) => (
            <Checkbox
              key={it.key}
              checked={!!values[it.key]}
              onChange={() => toggle(it.key, values[it.key])}
              label={it.label}
            />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4">
        <h2 className="font-medium mb-3">Exercices de dressage</h2>
        {dressageExercices.length === 0 && (
          <p className="text-sm text-gray-400 mb-2">Aucun exercice ajouté pour l'instant — ajoute ceux que tu veux travailler avec ce chien.</p>
        )}
        {dressageExercices.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            {dressageExercices.map((ex, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleExercice(i)}
                  className={
                    'flex-1 flex items-center gap-2 text-sm rounded-lg border px-3 py-2 transition text-left ' +
                    (ex.maitrise
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : 'bg-orange-50 text-orange-700 border-orange-100')
                  }
                >
                  {ex.maitrise ? <Check size={14} /> : <Circle size={14} />} {ex.nom}
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
        )}
        <div className="flex items-center gap-2">
          <TextInput
            placeholder="Nom de l'exercice à ajouter"
            value={newExercice}
            onChange={(e) => setNewExercice(e.target.value)}
            className="flex-1"
          />
          <button
            type="button"
            onClick={addExercice}
            className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-brand-dark shrink-0"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <Toast message={toast} type="error" />
    </div>
  )
}
