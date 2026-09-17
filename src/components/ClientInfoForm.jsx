import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Field, TextInput, Textarea, PrimaryButton, SecondaryButton, Toggle, Toast } from './ui'
import PhotoPicker from './PhotoPicker'

const empty = {
  nom: '',
  telephone: '',
  email: '',
  adresse: '',
  raison_venue: '',
  objectifs: '',
  cours_collectifs: false,
  whatsapp_inscrit: false,
  notes_pratiques: '',
  photo_url: null,
}

export default function ClientInfoForm({ client, isNew, onSaved, onDeleted }) {
  const [form, setForm] = useState(client || empty)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setForm(client || empty)
  }, [client])

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nom.trim()) {
      setToast("Le nom du client est obligatoire.")
      setTimeout(() => setToast(''), 2500)
      return
    }
    setSaving(true)

    try {
      if (isNew) {
        const { data, error } = await supabase.from('clients').insert([form]).select().single()
        if (error) throw error
        navigate(`/clients/${data.id}`, { replace: true })
        return
      }

      const { error } = await supabase.from('clients').update(form).eq('id', client.id)
      if (error) throw error
      setToast('Fiche enregistrée.')
      onSaved?.(form)
    } catch {
      setToast(isNew ? 'Erreur lors de la création. Vérifie ta connexion.' : 'Erreur lors de la sauvegarde. Vérifie ta connexion.')
    } finally {
      setSaving(false)
      setTimeout(() => setToast(''), 2500)
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer définitivement la fiche de ${form.nom} et toutes ses données (chiens, séances, rdv, règlements) ?`)) return
    try {
      const { error } = await supabase.from('clients').delete().eq('id', client.id)
      if (error) throw error
      onDeleted?.()
    } catch {
      setToast('Erreur lors de la suppression. Vérifie ta connexion.')
      setTimeout(() => setToast(''), 2500)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-6">
      <div className="flex justify-center">
        <PhotoPicker
          photoUrl={form.photo_url}
          folder="clients"
          onUploaded={(url) => set('photo_url', url)}
        />
      </div>

      <Field label="Nom du client *">
        <TextInput
          value={form.nom}
          onChange={(e) => set('nom', e.target.value)}
          placeholder="Nom et prénom"
          required
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Téléphone">
          <TextInput
            type="tel"
            value={form.telephone || ''}
            onChange={(e) => set('telephone', e.target.value)}
          />
        </Field>
        <Field label="Email">
          <TextInput
            type="email"
            value={form.email || ''}
            onChange={(e) => set('email', e.target.value)}
          />
        </Field>
      </div>

      <Field label="Adresse">
        <Textarea rows={2} value={form.adresse || ''} onChange={(e) => set('adresse', e.target.value)} />
      </Field>

      <Field label="Raison de la venue">
        <Textarea rows={2} value={form.raison_venue || ''} onChange={(e) => set('raison_venue', e.target.value)} />
      </Field>

      <Field label="Objectifs">
        <Textarea rows={2} value={form.objectifs || ''} onChange={(e) => set('objectifs', e.target.value)} />
      </Field>

      <div className="bg-white rounded-xl p-4 flex flex-col gap-1">
        <Toggle
          checked={form.cours_collectifs}
          onChange={(v) => set('cours_collectifs', v)}
          label="Souhaite des cours collectifs"
        />
        {form.cours_collectifs && (
          <div className="pl-4 border-l-2 border-gray-100 ml-2 mt-1">
            <Toggle
              checked={form.whatsapp_inscrit}
              onChange={(v) => set('whatsapp_inscrit', v)}
              label="Inscrit sur le groupe WhatsApp du cours collectif"
            />
          </div>
        )}
      </div>

      <Field label="Infos pratiques / contraintes particulières">
        <Textarea
          rows={2}
          value={form.notes_pratiques || ''}
          onChange={(e) => set('notes_pratiques', e.target.value)}
        />
      </Field>

      <PrimaryButton type="submit" disabled={saving}>
        {saving ? 'Enregistrement...' : isNew ? 'Créer la fiche client' : 'Enregistrer'}
      </PrimaryButton>

      {!isNew && (
        <SecondaryButton type="button" onClick={handleDelete} className="text-red-600 border-red-200">
          Supprimer ce client
        </SecondaryButton>
      )}

      <Toast message={toast} type={toast.startsWith('Erreur') || toast.startsWith('Le nom') ? 'error' : 'success'} />
    </form>
  )
}
