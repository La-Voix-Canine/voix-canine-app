import { supabase } from './supabaseClient'

/**
 * Envoie une photo dans le bucket "photos" de Supabase Storage
 * et renvoie son URL publique.
 */
export async function uploadPhoto(file, folder) {
  const ext = file.name.split('.').pop()
  const path = `${folder}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('photos').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error

  const { data } = supabase.storage.from('photos').getPublicUrl(path)
  return data.publicUrl
}
