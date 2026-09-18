import { Link } from 'react-router-dom'
import { Field, Select, TextInput } from './ui'

// Champ "Lieu" réutilisable (séances / rendez-vous) : liste des lieux propres à
// l'utilisateur, + un champ de précision (ex. le nom de la ville) pour les lieux
// qui le demandent (ex. "En ville").
export default function LieuField({
  lieuxOptions,
  lieuxLoaded,
  lieuId,
  onLieuIdChange,
  precision,
  onPrecisionChange,
  unresolved,
}) {
  const selected = lieuxOptions.find((l) => l.id === lieuId)

  return (
    <div className="flex flex-col gap-3">
      <Field
        label="Lieu"
        hint={
          lieuxLoaded && lieuxOptions.length === 0 ? (
            <>
              Aucun lieu enregistré —{' '}
              <Link to="/parametres" className="underline text-brand-dark">ajoute-en un dans Paramètres</Link>.
            </>
          ) : undefined
        }
      >
        <Select value={lieuId} onChange={(e) => onLieuIdChange(e.target.value)}>
          <option value="">—</option>
          {unresolved && (
            <option value="__unresolved__">{unresolved} (ancien lieu, non enregistré)</option>
          )}
          {lieuxOptions.map((l) => (
            <option key={l.id} value={l.id}>{l.nom}</option>
          ))}
        </Select>
      </Field>
      {selected?.necessite_precision && (
        <Field label={`Précision — ${selected.nom}`}>
          <TextInput
            value={precision}
            onChange={(e) => onPrecisionChange(e.target.value)}
            placeholder="ex. nom de la ville"
          />
        </Field>
      )}
    </div>
  )
}
