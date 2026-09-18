import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ClientsListPage from './pages/ClientsListPage'
import ClientDetailPage from './pages/ClientDetailPage'
import ParametresPage from './pages/ParametresPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
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
      <Route
        path="/parametres"
        element={
          <ProtectedRoute>
            <ParametresPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
