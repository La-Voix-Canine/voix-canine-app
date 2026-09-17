import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { uploadPhoto } from '../lib/uploadPhoto'

export default function PhotoPicker({ photoUrl, folder, onUploaded, size = 88 }) {
  const inputRef = useRef(null)
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

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{ width: size, height: size }}
        className="rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center relative active:scale-95 transition"
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Camera className="text-gray-400" size={size * 0.32} />
        )}
        {loading && (
          <span className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="animate-spin text-white" size={20} />
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
