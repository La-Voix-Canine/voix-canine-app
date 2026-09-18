import { supabase } from './supabaseClient'

// Récupère la liste des lieux (séances / rendez-vous) propres à l'utilisateur connecté.
export async function fetchLieux() {
  const { data, error } = await supabase
    .from('lieux')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

// À partir d'une valeur de lieu déjà enregistrée (texte libre, ex. "Arcy-sur-Cure"
// ou "En ville - Auxerre"), retrouve à quel lieu de la liste actuelle ça correspond,
// pour pré-remplir un formulaire d'édition.
export function resolveLieuSelection(storedValue, lieuxOptions) {
  if (!storedValue) return { lieuId: '', precision: '', unresolved: '' }

  const exact = lieuxOptions.find((l) => l.nom === storedValue)
  if (exact) return { lieuId: exact.id, precision: '', unresolved: '' }

  const withPrecision = lieuxOptions.find(
    (l) => l.necessite_precision && storedValue.startsWith(l.nom + ' - ')
  )
  if (withPrecision) {
    return {
      lieuId: withPrecision.id,
      precision: storedValue.slice(withPrecision.nom.length + 3),
      unresolved: '',
    }
  }

  // Le lieu enregistré à l'époque n'existe plus dans la liste actuelle.
  return { lieuId: '__unresolved__', precision: '', unresolved: storedValue }
}

// Reconstitue la valeur texte à enregistrer dans "lieu" (seances/rdv) à partir
// de la sélection faite dans le formulaire.
export function computeLieuValue(lieuId, precision, lieuxOptions, fallbackRaw = '') {
  if (lieuId === '__unresolved__') return fallbackRaw
  const lieu = lieuxOptions.find((l) => l.id === lieuId)
  if (!lieu) return ''
  return lieu.necessite_precision && precision.trim() ? `${lieu.nom} - ${precision.trim()}` : lieu.nom
}
