import { useRef, useState } from 'react'
import { Camera, Images, Loader2 } from 'lucide-react'
import { uploadPhoto } from '../lib/uploadPhoto'

export default function PhotoPicker({ photoUrl, folder, onUploaded, size = 88 }) {
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const url = await uploadPhoto(file, folder)
      onUploaded(url)
    } catch {
      setError("Échec de l'envoi de la photo.")
    } finally {
      setLoading(false)
      e.target.value = ''
    }
  }

  const btnClass =
    'w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm active:scale-95 transition'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <div
          style={{ width: size, height: size }}
          className="rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center"
        >
          {photoUrl ? (
            <img src={photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera className="text-gray-400" size={size * 0.32} />
          )}
          {loading && (
            <span className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
              <Loader2 className="animate-spin text-white" size={20} />
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className={btnClass}
          aria-label="Prendre une photo"
        >
          <Camera size={16} className="text-gray-600" />
        </button>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className={btnClass}
          aria-label="Choisir dans la galerie"
        >
          <Images size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Prend une photo directement avec l'appareil photo */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      {/* Choisit une image déjà présente sur le téléphone */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
