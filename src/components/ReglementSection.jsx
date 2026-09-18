import { useEffect, useState } from 'react'
import { Plus, Minus, Pencil, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { Field, TextInput, Select, PrimaryButton, SecondaryButton, Toast } from './ui'

export default function ReglementSection({ clientId, dogs }) {
  const [forfaits, setForfaits] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingForfait, setEditingForfait] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    load()
  }, [clientId])

  async function load() {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data, error } = await supabase
        .from('forfaits')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setForfaits(data || [])
    } catch {
      setErrorMsg('Impossible de charger les règlements. Vérifie ta connexion.')
    } finally {
      setLoading(false)
    }
  }

  function notify(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  async function handleDelete(forfait) {
    if (!window.confirm('Supprimer ce règlement ? Cette action est définitive.')) return
    try {
      const { error } = await supabase.from('forfaits').delete().eq('id', forfait.id)
      if (error) throw error
      notify('Règlement supprimé.')
      load()
    } catch {
      notify('Erreur lors de la suppression.')
    }
  }

  const formOpen = showForm || !!editingForfait

  return (
    <div className="flex flex-col gap-4">
      {!formOpen && (
        <PrimaryButton type="button" onClick={() => setShowForm(true)} className="flex items-center justify-center gap-1.5">
          <Plus size={18} /> Nouveau règlement
        </PrimaryButton>
      )}

      {formOpen && (
        <ForfaitForm
          clientId={clientId}
          dogs={dogs}
          forfait={editingForfait}
          onCancel={() => {
            setShowForm(false)
            setEditingForfait(null)
          }}
          onSaved={() => {
            setShowForm(false)
            setEditingForfait(null)
            notify(editingForfait ? 'Règlement modifié.' : 'Règlement enregistré.')
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
      {!loading && !errorMsg && forfaits.length === 0 && (
        <p className="text-center text-gray-400 py-4 text-sm">Aucun règlement enregistré.</p>
      )}

      {forfaits.map((f) => (
        <ForfaitCard
          key={f.id}
          forfait={f}
          dogs={dogs}
          onChanged={load}
          onEdit={() => setEditingForfait(f)}
          onDelete={() => handleDelete(f)}
        />
      ))}

      <Toast message={toast} />
    </div>
  )
}

function ForfaitCard({ forfait, dogs, onChanged, onEdit, onDelete }) {
  const dogNom = dogs.find((d) => d.id === forfait.dog_id)?.nom
  const isForfait = forfait.type === 'forfait'
  const paye = (Number(forfait.montant_paiement_1) || 0) + (Number(forfait.montant_paiement_2) || 0)
  const solde = paye >= Number(forfait.montant_total || 0) && Number(forfait.montant_total || 0) > 0

  async function setNbSeances(n) {
    const clamped = Math.max(0, Math.min(forfait.nb_seances_total || 999, n))
    try {
      const { error } = await supabase.from('forfaits').update({ nb_seances_faites: clamped }).eq('id', forfait.id)
      if (error) throw error
      onChanged()
    } catch {
      // silencieux : l'affichage reste inchangé, l'utilisateur peut réessayer
    }
  }

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium text-sm">
            {isForfait ? `Forfait ${forfait.nb_seances_total} séances` : 'À la séance'}
            {dogNom ? ` · ${dogNom}` : ''}
          </p>
          <p className="text-xs text-gray-400">{Number(forfait.montant_total || 0).toFixed(2)} €</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={
              'text-xs font-medium px-2.5 py-1 rounded-full ' +
              (solde ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700')
            }
          >
            {solde ? 'Soldé' : forfait.montant_paiement_2 != null || paye > 0 ? 'En attente (partiel)' : 'En attente'}
          </span>
          <button onClick={onEdit} className="p-1 text-gray-400 hover:text-brand-dark" title="Modifier">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-600" title="Supprimer">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {isForfait && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            {Array.from({ length: forfait.nb_seances_total || 10 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setNbSeances(i < forfait.nb_seances_faites ? i : i + 1)}
                className={
                  'w-7 h-7 rounded-full border-2 text-xs font-medium flex items-center justify-center transition ' +
                  (i < forfait.nb_seances_faites
                    ? 'bg-brand border-brand text-white'
                    : 'border-gray-300 text-gray-300')
                }
              >
                {i + 1}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400">
            {forfait.nb_seances_faites}/{forfait.nb_seances_total} séances faites
          </p>
        </div>
      )}

      {!isForfait && (
        <div className="mb-3 flex items-center gap-3">
          <button
            onClick={() => setNbSeances(Math.max(0, forfait.nb_seances_faites - 1))}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500"
          >
            <Minus size={16} />
          </button>
          <span className="font-medium">{forfait.nb_seances_faites} séance{forfait.nb_seances_faites > 1 ? 's' : ''} faite{forfait.nb_seances_faites > 1 ? 's' : ''}</span>
          <button
            onClick={() => setNbSeances(forfait.nb_seances_faites + 1)}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500"
          >
            <Plus size={16} />
          </button>
        </div>
      )}

      <div className="text-xs text-gray-500 flex flex-col gap-0.5">
        {forfait.montant_paiement_1 != null && (
          <span>
            1er versement : {Number(forfait.montant_paiement_1).toFixed(2)} €
            {forfait.date_paiement_1 ? ` le ${new Date(forfait.date_paiement_1).toLocaleDateString('fr-FR')}` : ''}
          </span>
        )}
        {forfait.montant_paiement_2 != null && (
          <span>
            2e versement : {Number(forfait.montant_paiement_2).toFixed(2)} €
            {forfait.date_paiement_2 ? ` le ${new Date(forfait.date_paiement_2).toLocaleDateString('fr-FR')}` : ''}
          </span>
        )}
      </div>
    </div>
  )
}

function ForfaitForm({ clientId, dogs, forfait, onCancel, onSaved }) {
  const isEdit = !!forfait
  const [type, setType] = useState(forfait?.type || 'forfait')
  const [nbSeancesTotal, setNbSeancesTotal] = useState(forfait?.nb_seances_total ?? 10)
  const [montantTotal, setMontantTotal] = useState(forfait?.montant_total ?? 350)
  const [dogId, setDogId] = useState(forfait?.dog_id || '')
  const [modePaiement, setModePaiement] = useState(forfait?.mode_paiement || '1fois')
  const [montant1, setMontant1] = useState(forfait?.montant_paiement_1 ?? '')
  const [date1, setDate1] = useState(forfait?.date_paiement_1 || (() => new Date().toISOString().slice(0, 10))())
  const [montant2, setMontant2] = useState(forfait?.montant_paiement_2 ?? '')
  const [date2, setDate2] = useState(forfait?.date_paiement_2 || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleTypeChange(v) {
    setType(v)
    if (isEdit) return // en édition, on ne réinitialise pas les montants déjà saisis
    if (v === 'forfait') {
      setNbSeancesTotal(10)
      setMontantTotal(350)
    } else {
      setNbSeancesTotal(null)
      setMontantTotal(45)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      dog_id: dogId || null,
      type,
      nb_seances_total: type === 'forfait' ? nbSeancesTotal : 999,
      montant_total: montantTotal,
      mode_paiement: modePaiement,
      montant_paiement_1: montant1 !== '' ? Number(montant1) : (modePaiement === '1fois' ? montantTotal : null),
      date_paiement_1: date1 || null,
      montant_paiement_2: modePaiement === '2fois' && montant2 !== '' ? Number(montant2) : null,
      date_paiement_2: modePaiement === '2fois' ? date2 || null : null,
    }

    try {
      if (isEdit) {
        const { error } = await supabase.from('forfaits').update(payload).eq('id', forfait.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('forfaits').insert([
          { ...payload, client_id: clientId, nb_seances_faites: 0 },
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
      <div className="flex gap-2">
        {[
          { value: 'forfait', label: 'Forfait (10 séances)' },
          { value: 'seance', label: 'À la séance' },
        ].map((opt) => (
          <button
            type="button"
            key={opt.value}
            onClick={() => handleTypeChange(opt.value)}
            className={
              'flex-1 px-3 py-2 rounded-lg text-sm border transition ' +
              (type === opt.value ? 'bg-brand-dark text-white border-brand-dark' : 'bg-white text-gray-600 border-gray-300')
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

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

      <div className="grid grid-cols-2 gap-3">
        {type === 'forfait' && (
          <Field label="Nombre de séances">
            <TextInput
              type="number"
              min="1"
              value={nbSeancesTotal ?? ''}
              onChange={(e) => setNbSeancesTotal(Number(e.target.value))}
            />
          </Field>
        )}
        <Field label={type === 'forfait' ? 'Montant total (€)' : 'Prix de la séance (€)'}>
          <TextInput
            type="number"
            min="0"
            step="0.01"
            value={montantTotal}
            onChange={(e) => setMontantTotal(Number(e.target.value))}
          />
        </Field>
      </div>

      <Field label="Paiement">
        <Select value={modePaiement} onChange={(e) => setModePaiement(e.target.value)}>
          <option value="1fois">En une fois</option>
          <option value="2fois">En 2 fois</option>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={modePaiement === '2fois' ? '1er versement (€)' : 'Montant réglé (€)'}>
          <TextInput
            type="number"
            min="0"
            step="0.01"
            placeholder={modePaiement === '1fois' ? String(montantTotal) : ''}
            value={montant1}
            onChange={(e) => setMontant1(e.target.value)}
          />
        </Field>
        <Field label="Date">
          <TextInput type="date" value={date1} onChange={(e) => setDate1(e.target.value)} />
        </Field>
      </div>

      {modePaiement === '2fois' && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="2e versement (€)">
            <TextInput type="number" min="0" step="0.01" value={montant2} onChange={(e) => setMontant2(e.target.value)} />
          </Field>
          <Field label="Date (si déjà reçu)">
            <TextInput type="date" value={date2} onChange={(e) => setDate2(e.target.value)} />
          </Field>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <SecondaryButton type="button" onClick={onCancel} className="flex-1">Annuler</SecondaryButton>
        <PrimaryButton type="submit" disabled={saving} className="flex-1">
          {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Enregistrer'}
        </PrimaryButton>
      </div>
    </form>
  )
}
