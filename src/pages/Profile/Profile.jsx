import { useState, useRef } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import './Profile.css'

function Profile() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    description: user?.description || '',
    profile_pic: null,
  })
  const [previewImage, setPreviewImage] = useState(user?.profile_pic_url || null)
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, profile_pic: 'Размер файла не должен превышать 5 МБ' }))
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, profile_pic: 'Можно загружать только изображения' }))
      return
    }

    setFormData(prev => ({ ...prev, profile_pic: file }))
    setErrors(prev => ({ ...prev, profile_pic: null }))

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, profile_pic: null, remove_photo: true }))
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Имя пользователя должно содержать минимум 3 символа'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Описание не должно превышать 500 символов'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePasswordForm = () => {
    const newErrors = {}

    if (!passwordData.current_password) {
      newErrors.current_password = 'Введите текущий пароль'
    }

    if (!passwordData.new_password) {
      newErrors.new_password = 'Введите новый пароль'
    } else if (passwordData.new_password.length < 8) {
      newErrors.new_password = 'Пароль должен содержать минимум 8 символов'
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Пароли не совпадают'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsSaving(true)
      setSuccessMessage('')

      const data = new FormData()
      data.append('username', formData.username)
      data.append('email', formData.email)
      data.append('first_name', formData.first_name)
      data.append('last_name', formData.last_name)
      data.append('description', formData.description)

      if (formData.profile_pic) {
        data.append('profile_pic', formData.profile_pic)
      }

      if (formData.remove_photo) {
        data.append('remove_photo', 'true')
      }

      await api.patch(`users/${user.id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // 👇 Запрос на /me для получения свежих данных
      const meResponse = await api.get('users/me/')

      if (updateUser) {
        updateUser(meResponse.data)
      }

      setSuccessMessage('Профиль успешно обновлён')
      setIsEditing(false)

      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Ошибка обновления профиля:', err)

      if (err.response?.data) {
        const apiErrors = err.response.data
        const newErrors = {}

        Object.keys(apiErrors).forEach(key => {
          const message = Array.isArray(apiErrors[key])
            ? apiErrors[key][0]
            : apiErrors[key]
          newErrors[key] = message
        })

        setErrors(newErrors)
      } else {
        setErrors({ general: 'Не удалось обновить профиль' })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (!validatePasswordForm()) return

    try {
      setIsSaving(true)
      setSuccessMessage('')

      await api.post(`users/${user.id}/change_password/`, {
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
      })

      setSuccessMessage('Пароль успешно изменён')
      setShowPasswordForm(false)
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      })

      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Ошибка смены пароля:', err)

      if (err.response?.data) {
        const apiErrors = err.response.data
        const newErrors = {}

        Object.keys(apiErrors).forEach(key => {
          const message = Array.isArray(apiErrors[key])
            ? apiErrors[key][0]
            : apiErrors[key]
          newErrors[key] = message
        })

        setErrors(newErrors)
      } else {
        setErrors({ general: 'Не удалось изменить пароль' })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      description: user?.description || '',
      profile_pic: null,
      remove_photo: false,
    })
    setPreviewImage(user?.profile_pic_url || null)
    setErrors({})
  }

  if (!user) return <div className="profile-loading">Загрузка...</div>

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        {/* Заголовок с аватаром */}
        <div className="profile-header">
          <div className="profile-avatar">
            {previewImage ? (
              <img src={previewImage} alt="Аватар" className="avatar-image" />
            ) : (
              user.username?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <h2>{user.username}</h2>
          {user.email && <p className="profile-email">{user.email}</p>}
        </div>

        {/* Уведомления */}
        {successMessage && (
          <div className="alert alert-success">
            ✓ {successMessage}
          </div>
        )}

        {errors.general && (
          <div className="alert alert-error">
            ✗ {errors.general}
          </div>
        )}

        {/* Режим просмотра */}
        {!isEditing && !showPasswordForm && (
          <>
            {/* 👇 Описание профиля - отдельная секция */}
            {user.description && (
              <div className="profile-description-section">
                <div className="description-content">
                  <p className="description-text">{user.description}</p>
                </div>
              </div>
            )}

            <div className="profile-section">
              <h3>Мои данные</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">ID:</span>
                  <span className="info-value">{user.id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Статус:</span>
                  <span className="info-value">
                    {user.is_staff ? 'Администратор' : 'Пользователь'}
                  </span>
                </div>
                {user.first_name && (
                  <div className="info-item">
                    <span className="info-label">Имя:</span>
                    <span className="info-value">{user.first_name}</span>
                  </div>
                )}
                {user.last_name && (
                  <div className="info-item">
                    <span className="info-label">Фамилия:</span>
                    <span className="info-value">{user.last_name}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-actions">
              {user.is_staff && (
                <a
                  href="/admin"
                  className="btn-password"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🛠️ Панель администратора
                </a>
              )}
              <button
                className="btn-edit"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Редактировать профиль
              </button>
              <button
                className="btn-password"
                onClick={() => setShowPasswordForm(true)}
              >
                🔑 Сменить пароль
              </button>
              <button className="btn-logout" onClick={handleLogout}>
                Выйти из аккаунта
              </button>
            </div>
          </>
        )}

        {/* Форма редактирования профиля */}
        {isEditing && (
          <form className="profile-form" onSubmit={handleSubmit}>
            <h3>Редактирование профиля</h3>

            {/* Фото профиля */}
            <div className="form-group profile-pic-group">
              <label>Фото профиля</label>
              <div className="profile-pic-preview">
                {previewImage ? (
                  <>
                    <img src={previewImage} alt="Превью" className="preview-image" />
                    <button
                      type="button"
                      className="btn-remove-photo"
                      onClick={handleRemovePhoto}
                      title="Удалить фото"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <div className="preview-placeholder">
                    <span>Нет фото</span>
                  </div>
                )}
              </div>
              <div className="file-input-wrapper">
                <input
                  ref={fileInputRef}
                  id="profile_pic"
                  name="profile_pic"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileChange}
                />
                <label htmlFor="profile_pic" className="file-label">
                  {formData.profile_pic
                    ? formData.profile_pic.name
                    : 'Выберите изображение (JPG, PNG)'}
                </label>
              </div>
              {errors.profile_pic && (
                <span className="field-error">{errors.profile_pic}</span>
              )}
              <small className="field-hint">Максимальный размер: 5 МБ</small>
            </div>

            <div className="form-group">
              <label htmlFor="username">Имя пользователя *</label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className={errors.username ? 'input-error' : ''}
              />
              {errors.username && (
                <span className="field-error">{errors.username}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && (
                <span className="field-error">{errors.email}</span>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">Имя</label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  value={formData.first_name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Фамилия</label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  value={formData.last_name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">О себе</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Расскажите о себе..."
                maxLength={500}
                className={errors.description ? 'input-error' : ''}
              />
              <small className="field-hint">
                {formData.description.length}/500 символов
              </small>
              {errors.description && (
                <span className="field-error">{errors.description}</span>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-save"
                disabled={isSaving}
              >
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Отмена
              </button>
            </div>
          </form>
        )}

        {/* Форма смены пароля */}
        {showPasswordForm && (
          <form className="profile-form" onSubmit={handlePasswordSubmit}>
            <h3>Смена пароля</h3>

            <div className="form-group">
              <label htmlFor="current_password">Текущий пароль *</label>
              <input
                id="current_password"
                name="current_password"
                type="password"
                value={passwordData.current_password}
                onChange={handlePasswordChange}
                className={errors.current_password ? 'input-error' : ''}
              />
              {errors.current_password && (
                <span className="field-error">{errors.current_password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="new_password">Новый пароль *</label>
              <input
                id="new_password"
                name="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={handlePasswordChange}
                className={errors.new_password ? 'input-error' : ''}
              />
              {errors.new_password && (
                <span className="field-error">{errors.new_password}</span>
              )}
              <small className="field-hint">Минимум 8 символов</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">Подтверждение пароля *</label>
              <input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={passwordData.confirm_password}
                onChange={handlePasswordChange}
                className={errors.confirm_password ? 'input-error' : ''}
              />
              {errors.confirm_password && (
                <span className="field-error">{errors.confirm_password}</span>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-save"
                disabled={isSaving}
              >
                {isSaving ? 'Сохранение...' : 'Сменить пароль'}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setShowPasswordForm(false)
                  setPasswordData({
                    current_password: '',
                    new_password: '',
                    confirm_password: '',
                  })
                  setErrors({})
                }}
                disabled={isSaving}
              >
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile