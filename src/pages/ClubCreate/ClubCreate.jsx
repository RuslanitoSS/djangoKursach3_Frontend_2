import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import './ClubCreate.css';

function ClubCreate() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_photo: null,
    franchise: '',
    chapter: '',
    requirements_text: '',
    // 🔥 application_questions убран из state — не нужен для ввода
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Защита: если пользователь не авторизован → редирект на логин
  if (!authLoading && !isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'cover_photo') {
      setFormData(prev => ({ ...prev, cover_photo: files[0] || null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setErrors({});

    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    
    if (formData.cover_photo) data.append('cover_photo', formData.cover_photo);
    if (formData.franchise) data.append('franchise', formData.franchise);
    if (formData.chapter) data.append('chapter', formData.chapter);
    if (formData.requirements_text) data.append('requirements_text', formData.requirements_text);
    
    // 🔥 Передаём пустой массив (или '[]' как строку) — как ожидает бэкенд
    data.append('application_questions', '[]');

    try {
      const response = await api.post('fan-clubs/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      console.log('🎬 Club created response:', response.data);
      
      const clubId = response.data.id || response.data.pk || response.data;
      console.log('🔑 Extracted club ID:', clubId);
      
      if (!clubId) {
        throw new Error('Не удалось получить ID созданного клуба');
      }
      
      navigate(`/clubs/${clubId}`);
    } catch (err) {
      console.error('❌ Ошибка создания клуба:', err);
      
      const apiErrors = err.response?.data;
      if (apiErrors && typeof apiErrors === 'object') {
        setErrors(apiErrors);
        setGeneralError('Пожалуйста, исправьте ошибки в форме');
      } else {
        setGeneralError(err.response?.data?.detail || err.message || 'Не удалось создать клуб. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="club-create-loading">Проверка авторизации...</div>;
  }

  return (
    <div className="club-create-page">
      <div className="club-create-container">
        <h1 className="page-title">Создать фан-клуб</h1>
        
        {generalError && <div className="general-error">{generalError}</div>}
        
        <form onSubmit={handleSubmit} className="club-create-form">
          {/* Основная информация */}
          <fieldset className="form-section">
            <legend>Основная информация</legend>
            
            <div className="form-group">
              <label htmlFor="title">Название клуба *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Например: Фанаты Гарри Поттера"
                maxLength={255}
                required
              />
              {errors.title && <span className="field-error">{Array.isArray(errors.title) ? errors.title[0] : errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Описание *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="О чём этот клуб? Какие активности планируются?"
                rows={5}
                required
              />
              {errors.description && <span className="field-error">{Array.isArray(errors.description) ? errors.description[0] : errors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="cover_photo">Обложка клуба</label>
              <div className="file-input-wrapper">
                <input
                  id="cover_photo"
                  name="cover_photo"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleChange}
                />
                <label htmlFor="cover_photo" className="file-label">
                  {formData.cover_photo ? formData.cover_photo.name : 'Выберите изображение (JPG, PNG)'}
                </label>
              </div>
              {errors.cover_photo && <span className="field-error">{Array.isArray(errors.cover_photo) ? errors.cover_photo[0] : errors.cover_photo}</span>}
              <small>Максимальный размер: 10 МБ</small>
            </div>
          </fieldset>

          {/* Привязка к контенту */}
          <fieldset className="form-section">
            <legend>Привязка к контенту (необязательно)</legend>
            <p className="form-hint">Укажите ID франшизы или главы, если клуб посвящён конкретному произведению.</p>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="franchise">ID Франшизы *</label>
                <input
                  id="franchise"
                  name="franchise"
                  required
                  type="number"
                  value={formData.franchise}
                  onChange={handleChange}
                  placeholder="Например: 2"
                  min="1"
                />
                {errors.franchise && <span className="field-error">{Array.isArray(errors.franchise) ? errors.franchise[0] : errors.franchise}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="chapter">ID Главы *</label>
                <input
                  id="chapter"
                  name="chapter"
                  type="number"
                  required
                  value={formData.chapter}
                  onChange={handleChange}
                  placeholder="Например: 5"
                  min="1"
                />
                {errors.chapter && <span className="field-error">{Array.isArray(errors.chapter) ? errors.chapter[0] : errors.chapter}</span>}
              </div>
            </div>
          </fieldset>

          {/* Настройки вступления */}
          <fieldset className="form-section">
            <legend>Настройки вступления</legend>
            
            <div className="form-group">
              <label htmlFor="requirements_text">Требования для вступления</label>
              <textarea
                id="requirements_text"
                name="requirements_text"
                value={formData.requirements_text}
                onChange={handleChange}
                placeholder="Опишите, что нужно сделать или предоставить для вступления в клуб."
                rows={3}
              />
              {errors.requirements_text && <span className="field-error">{Array.isArray(errors.requirements_text) ? errors.requirements_text[0] : errors.requirements_text}</span>}
            </div>

            {/* 🔥 ПОЛЕ ВОПРОСОВ УБРАНО ИЗ ИНТЕРФЕЙСА */}
            {/* Но в handleSubmit передаётся data.append('application_questions', '[]') */}
          </fieldset>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Создание...' : 'Создать клуб'}
            </button>
            <Link to="/clubs/search" className="btn-cancel">
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClubCreate;