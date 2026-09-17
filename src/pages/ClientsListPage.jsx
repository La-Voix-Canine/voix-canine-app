import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, PawPrint, LogOut, Phone } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function ClientsListPage() {
  const [clients, setClients] = useState([])
  const [dogsByClient, setDogsByClient] = useState({})
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const navigate = useNavigate()
  const { signOut } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setErrorMsg('')
    try {
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('nom', { ascending: true })
      if (clientsError) throw clientsError

      const { data: dogsData, error: dogsError } = await supabase
        .from('dogs')
        .select('id, nom, client_id')
      if (dogsError) throw dogsError

      const grouped = {}
      for (const dog of dogsData || []) {
        if (!grouped[dog.client_id]) grouped[dog.client_id] = []
        grouped[dog.client_id].push(dog)
      }

      setClients(clientsData || [])
      setDogsByClient(grouped)
    } catch {
      setErrorMsg("Impossible de charger les clients. Vérifie ta connexion.")
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return clients
    return clients.filter((c) => {
      const dogNames = (dogsByClient[c.id] || []).map((d) => d.nom.toLowerCase()).join(' ')
      return (
        c.nom?.toLowerCase().includes(q) ||
        c.telephone?.toLowerCase().includes(q) ||
        dogNames.includes(q)
      )
    })
  }, [clients, dogsByClient, query])

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-brand-dark text-white px-4 pt-6 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-semibold">La Voix Canine</h1>
            <p className="text-xs text-white/70">{clients.length} client{clients.length > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={signOut}
            className="text-white/80 hover:text-white p-2"
            aria-label="Se déconnecter"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un client ou un chien..."
            className="w-full rounded-xl pl-10 pr-3 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </header>

      <main className="px-4 mt-4">
        {loading && <p className="text-center text-gray-400 py-10">Chargement...</p>}

        {!loading && errorMsg && (
          <div className="text-center bg-red-50 border border-red-100 rounded-lg px-3 py-3">
            <p className="text-red-600 mb-2">{errorMsg}</p>
            <button onClick={loadData} className="text-sm font-medium text-brand-dark underline">
              Réessayer
            </button>
          </div>
        )}

        {!loading && !errorMsg && filtered.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            {query ? 'Aucun résultat.' : 'Aucun client pour le moment. Ajoute ton premier client avec le bouton +.'}
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {filtered.map((client) => (
            <li key={client.id}>
              <button
                onClick={() => navigate(`/clients/${client.id}`)}
                className="w-full text-left bg-white rounded-xl p-4 shadow-sm flex items-center justify-between active:scale-[0.99] transition"
              >
                <div>
                  <p className="font-medium">{client.nom}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                    {(dogsByClient[client.id] || []).length > 0 && (
                      <span className="flex items-center gap-1">
                        <PawPrint size={14} />
                        {(dogsByClient[client.id] || []).map((d) => d.nom).join(', ')}
                      </span>
                    )}
                    {client.telephone && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} />
                        {client.telephone}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </main>

      <button
        onClick={() => navigate('/clients/new')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent text-white shadow-lg flex items-center justify-center active:scale-95 transition"
        aria-label="Ajouter un client"
      >
        <Plus size={26} />
      </button>
    </div>
  )
}
