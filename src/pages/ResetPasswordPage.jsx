import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PawPrint } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Le lien reçu par email connecte automatiquement une session temporaire
    // (gérée par le client Supabase). On attend juste qu'elle soit prête.
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) {
      setError("Erreur lors de la mise à jour. Réessaie ou redemande un lien.")
      return
    }
    setDone(true)
    setTimeout(() => navigate('/', { replace: true }), 1500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-14 h-14 rounded-full bg-brand-dark flex items-center justify-center">
            <PawPrint className="text-white" size={28} />
          </div>
          <h1 className="text-lg font-semibold text-center">Nouveau mot de passe</h1>
        </div>

        {done ? (
          <p className="text-sm text-center text-gray-700">
            Mot de passe mis à jour. Redirection...
          </p>
        ) : !ready ? (
          <p className="text-sm text-center text-gray-500">
            Vérification du lien... Si rien ne se passe après quelques secondes, redemande un lien depuis la
            page de connexion.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="password">Nouveau mot de passe</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="confirm">Confirme-le</label>
              <input
                id="confirm"
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand"
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="mt-2 bg-brand-dark text-white rounded-lg py-2.5 font-medium disabled:opacity-60"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer le nouveau mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
