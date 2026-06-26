import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Auth.css'

function Register() {
  const [form, setForm] = useState({ 
    username: '', email: '', password: '', password_confirm: '' 
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => 
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await register(form)
      navigate('/', { replace: true })
    } catch (err) {
      if (err.response?.data) setErrors(err.response.data)
      else setErrors({ non_field_errors: 'Ошибка регистрации' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo">🎬 KINO<span>POISK</span></div>
        <h2>Регистрация</h2>
        
        {errors.non_field_errors && (
          <div className="auth-error">{errors.non_field_errors}</div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Придумайте логин"
            value={form.username}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {errors.username && <span className="field-error">{errors.username}</span>}
          
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
          
          <input
            name="password"
            type="password"
            placeholder="Пароль (мин. 8 символов)"
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
          
          <input
            name="password_confirm"
            type="password"
            placeholder="Повторите пароль"
            value={form.password_confirm}
            onChange={handleChange}
            required
            disabled={loading}
          />
          {errors.password_confirm && <span className="field-error">{errors.password_confirm}</span>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        
        <div className="auth-footer">
          <Link to="/login">Уже есть аккаунт? Войти</Link>
        </div>
      </div>
    </div>
  )
}

export default Register