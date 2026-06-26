import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Auth.css'

function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Неверные учетные данные')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">🎬 KINO<span>POISK</span></div>
        <h2>Вход</h2>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Логин, email или код входа"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            required
            disabled={loading}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Пароль"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            required
            disabled={loading}
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Входим...' : 'Войти'}
          </button>
        </form>
        
        <div className="auth-footer">
          <Link to="/register">Создать аккаунт</Link>
         
        </div>
      </div>
    </div>
  )
}

export default Login