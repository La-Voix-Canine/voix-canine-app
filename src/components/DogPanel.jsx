import { useState } from 'react'
import { TabBar } from './ui'
import DogBilanForm from './DogBilanForm'
import DogEducationBase from './DogEducationBase'
import DogSeances from './DogSeances'

const TABS = [
  { value: 'bilan', label: 'Bilan' },
  { value: 'education', label: 'Éducation de base' },
  { value: 'seances', label: 'Séances' },
]

export default function DogPanel({ dog, onDogUpdated, onDogDeleted }) {
  const [tab, setTab] = useState('bilan')

  return (
    <div className="-mx-4">
      <div className="px-1">
        <TabBar tabs={TABS} value={tab} onChange={setTab} />
      </div>
      <div className="px-4 pt-4">
        {tab === 'bilan' && <DogBilanForm dog={dog} onSaved={onDogUpdated} onDeleted={onDogDeleted} />}
        {tab === 'education' && <DogEducationBase dog={dog} onSaved={onDogUpdated} />}
        {tab === 'seances' && <DogSeances dogId={dog.id} />}
      </div>
    </div>
  )
}
