import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PawPrint } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError("Connexion impossible : vérifie ton email et ton mot de passe.")
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-14 h-14 rounded-full bg-brand-dark flex items-center justify-center">
            <PawPrint className="text-white" size={28} />
          </div>
          <h1 className="text-lg font-semibold text-center">La Voix Canine</h1>
          <p className="text-sm text-gray-500 text-center">Gestion des clients</p>
        </div>

        {!showReset ? (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="ton@email.fr"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 bg-brand-dark text-white rounded-lg py-2.5 font-medium disabled:opacity-60"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setShowReset(true)
                setError('')
              }}
              className="mt-4 text-sm text-brand-dark underline w-full text-center"
            >
              Mot de passe oublié ?
            </button>
          </>
        ) : (
          <ResetRequestForm onBack={() => setShowReset(false)} initialEmail={email} />
        )}
      </div>
    </div>
  )
}

function ResetRequestForm({ onBack, initialEmail }) {
  const [email, setEmail] = useState(initialEmail || '')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSending(false)
    if (error) {
      setError("Impossible d'envoyer l'email. Vérifie l'adresse et réessaie.")
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm text-gray-700">
          Si un compte existe avec cette adresse, un email vient d'être envoyé avec un lien pour choisir un
          nouveau mot de passe. Pense à vérifier tes spams s'il n'arrive pas.
        </p>
        <button type="button" onClick={onBack} className="text-sm text-brand-dark underline">
          Retour à la connexion
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <p className="text-sm text-gray-500">
        Indique ton adresse email, on t'envoie un lien pour choisir un nouveau mot de passe.
      </p>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="reset-email">Email</label>
        <input
          id="reset-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder="ton@email.fr"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}
      <button
        type="submit"
        disabled={sending}
        className="mt-1 bg-brand-dark text-white rounded-lg py-2.5 font-medium disabled:opacity-60"
      >
        {sending ? 'Envoi...' : 'Envoyer le lien'}
      </button>
      <button type="button" onClick={onBack} className="text-sm text-gray-500 underline">
        Retour à la connexion
      </button>
    </form>
  )
}
