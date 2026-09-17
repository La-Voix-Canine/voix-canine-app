import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Field, TextInput, Textarea, Select, PrimaryButton, SecondaryButton, Checkbox, Toast } from './ui'
import PhotoPicker from './PhotoPicker'

const SOCIABILITE_OPTIONS = [
  { value: 'sociable', label: 'Sociable' },
  { value: 'pas_sociabilise', label: "Pas sociabilisé / ne sait pas se présenter" },
  { value: 'craintif', label: 'Craintif' },
  { value: 'agressif', label: 'Agressif (attaque)' },
  { value: 'ne_sait_pas', label: 'Ne sait pas' },
  { value: 'autre', label: 'Autre' },
]

export default function DogBilanForm({ dog, onSaved, onDeleted }) {
  const [form, setForm] = useState(dog)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => setForm(dog), [dog])

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const sociableNon = form.sociable_congeneres && form.sociable_congeneres !== 'sociable'

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const { error } = await supabase
        .from('dogs')
        .update({
          nom: form.nom,
          race: form.race,
          date_naissance: form.date_naissance || null,
          age_arrivee_famille: form.age_arrivee_famille,
          type_logement: form.type_logement,
          environnement: form.environnement,
          sociable_congeneres: form.sociable_congeneres,
          sociable_congeneres_autre: form.sociable_congeneres_autre,
          soucis_comportemental: form.soucis_comportemental,
          soucis_congeneres: form.soucis_congeneres,
          soucis_humains: form.soucis_humains,
          soucis_anxieux: form.soucis_anxieux,
          soucis_peur: form.soucis_peur,
          soucis_hyperactif: form.soucis_hyperactif,
          soucis_autre: form.soucis_autre,
          bilan_initial: form.bilan_initial,
          objectifs: form.objectifs,
          photo_url: form.photo_url,
        })
        .eq('id', dog.id)
      if (error) throw error
      setToast('Fiche chien enregistrée.')
      onSaved?.(form)
    } catch {
      setToast('Erreur lors de la sauvegarde. Vérifie ta connexion.')
    } finally {
      setSaving(false)
      setTimeout(() => setToast(''), 2500)
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer définitivement la fiche de ${form.nom} (bilan, éducation de base et séances) ?`)) return
    try {
      const { error } = await supabase.from('dogs').delete().eq('id', dog.id)
      if (error) throw error
      onDeleted?.()
    } catch {
      setToast('Erreur lors de la suppression. Vérifie ta connexion.')
      setTimeout(() => setToast(''), 2500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex justify-center">
        <PhotoPicker photoUrl={form.photo_url} folder="dogs" onUploaded={(url) => set('photo_url', url)} />
      </div>

      <Field label="Nom du chien *">
        <TextInput value={form.nom} onChange={(e) => set('nom', e.target.value)} required />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Race">
          <TextInput value={form.race || ''} onChange={(e) => set('race', e.target.value)} />
        </Field>
        <Field label="Date de naissance">
          <TextInput
            type="date"
            value={form.date_naissance || ''}
            onChange={(e) => set('date_naissance', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Depuis quel âge il est avec sa famille" hint="ex : depuis chiot (8 semaines), depuis 2 ans...">
        <TextInput
          value={form.age_arrivee_famille || ''}
          onChange={(e) => set('age_arrivee_famille', e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Lieu de vie">
          <Select value={form.type_logement || ''} onChange={(e) => set('type_logement', e.target.value)}>
            <option value="">—</option>
            <option value="maison">Maison</option>
            <option value="appartement">Appartement</option>
          </Select>
        </Field>
        <Field label="Environnement">
          <Select value={form.environnement || ''} onChange={(e) => set('environnement', e.target.value)}>
            <option value="">—</option>
            <option value="campagne">Campagne</option>
            <option value="ville">Ville</option>
          </Select>
        </Field>
      </div>

      <div className="bg-white rounded-xl p-4">
        <p className="text-sm font-medium mb-2">Sociable avec ses congénères</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {SOCIABILITE_OPTIONS.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => set('sociable_congeneres', opt.value)}
              className={
                'px-3 py-1.5 rounded-full text-sm border transition ' +
                (form.sociable_congeneres === opt.value
                  ? 'bg-brand-dark text-white border-brand-dark'
                  : 'bg-white text-gray-600 border-gray-300')
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
        {form.sociable_congeneres === 'autre' && (
          <TextInput
            placeholder="Précise..."
            value={form.sociable_congeneres_autre || ''}
            onChange={(e) => set('sociable_congeneres_autre', e.target.value)}
          />
        )}
        {sociableNon && form.sociable_congeneres === 'pas_sociabilise' && (
          <p className="text-xs text-gray-400 mt-2">Pas un souci grave — souvent juste un manque d'expérience.</p>
        )}
      </div>

      <div className="bg-white rounded-xl p-4">
        <Checkbox
          checked={form.soucis_comportemental}
          onChange={(v) => set('soucis_comportemental', v)}
          label="Soucis comportemental"
        />
        {form.soucis_comportemental && (
          <div className="pl-4 border-l-2 border-gray-100 ml-2 mt-2 flex flex-col">
            <Checkbox checked={form.soucis_congeneres} onChange={(v) => set('soucis_congeneres', v)} label="Agressif envers les congénères" />
            <Checkbox checked={form.soucis_humains} onChange={(v) => set('soucis_humains', v)} label="Agressif envers les humains" />
            <Checkbox checked={form.soucis_anxieux} onChange={(v) => set('soucis_anxieux', v)} label="Anxieux" />
            <Checkbox checked={form.soucis_peur} onChange={(v) => set('soucis_peur', v)} label="Peur" />
            <Checkbox checked={form.soucis_hyperactif} onChange={(v) => set('soucis_hyperactif', v)} label="Hyperactif" />
            <TextInput
              className="mt-2"
              placeholder="Autre (précise)"
              value={form.soucis_autre || ''}
              onChange={(e) => set('soucis_autre', e.target.value)}
            />
          </div>
        )}
      </div>

      <Field label="Bilan comportemental initial">
        <Textarea rows={3} value={form.bilan_initial || ''} onChange={(e) => set('bilan_initial', e.target.value)} />
      </Field>

      <Field label="Objectifs de travail">
        <Textarea rows={2} value={form.objectifs || ''} onChange={(e) => set('objectifs', e.target.value)} />
      </Field>

      <PrimaryButton type="submit" disabled={saving}>
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </PrimaryButton>
      <SecondaryButton type="button" onClick={handleDelete} className="text-red-600 border-red-200">
        Supprimer ce chien
      </SecondaryButton>

      <Toast message={toast} type={toast.startsWith('Erreur') ? 'error' : 'success'} />
    </form>
  )
}
