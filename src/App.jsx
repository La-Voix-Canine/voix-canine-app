import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ClientsListPage from './pages/ClientsListPage'
import ClientDetailPage from './pages/ClientDetailPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ClientsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <ClientDetailPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
