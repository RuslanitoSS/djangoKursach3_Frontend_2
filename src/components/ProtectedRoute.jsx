import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Загрузка сессии...</div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />

  return children
}

export default ProtectedRoute