import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Checkbox, Toast } from './ui'

const ITEMS = [
  { key: 'eb_marche_au_pied', label: 'Marche au pied' },
  { key: 'eb_changement_direction', label: 'Changement de direction' },
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

  useEffect(() => setValues(dog), [dog])

  const doneCount = ITEMS.filter((it) => values[it.key]).length

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

  return (
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
      <Toast message={toast} type="error" />
    </div>
  )
}
