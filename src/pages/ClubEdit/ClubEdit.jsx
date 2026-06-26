import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './ClubEdit.css';

function ClubEdit() {
  const { id } = useParams();  // 👈 ИЗМЕНЕНО: было slug, стало id
  const navigate = useNavigate();
  
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements_text: '',
    max_application_photos: 3,
    max_club_photos: 20,
    allowed_file_types: 'jpg,jpeg,png',
    max_file_size_mb: 5,
  });

  useEffect(() => {
    const fetchClub = async () => {
      try {
        setLoading(true);
        const response = await api.get(`fan-clubs/${id}/`);  // 👈 ИЗМЕНЕНО
        
        if (!response.data.is_admin) {
          setError('У вас нет прав для редактирования этого клуба');
          return;
        }
        
        setClub(response.data);
        setFormData({
          title: response.data.title || '',
          description: response.data.description || '',
          requirements_text: response.data.requirements_text || '',
          max_application_photos: response.data.max_application_photos || 3,
          max_club_photos: response.data.max_club_photos || 20,
          allowed_file_types: response.data.allowed_file_types || 'jpg,jpeg,png',
          max_file_size_mb: response.data.max_file_size_mb || 5,
        });
      } catch (err) {
        console.error('Ошибка загрузки клуба:', err);
        setError('Не удалось загрузить информацию о клубе');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClub();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('max_') ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      await api.patch(`fan-clubs/${id}/`, formData);  // 👈 ИЗМЕНЕНО
      navigate(`/clubs/${id}`);  // 👈 ИЗМЕНЕНО
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError(err.response?.data?.detail || 'Ошибка при сохранении изменений');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="club-edit-loading">Загрузка...</div>;
  }

  if (error && !club) {
    return (
      <div className="club-edit-error">
        <h2>Ошибка</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Назад</button>
      </div>
    );
  }

  return (
    <div className="club-edit-page">
      <div className="club-edit-container">
        <h1>Редактирование клуба: {club?.title}</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="club-edit-form">
          <div className="form-group">
            <label>Название клуба *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={255}
            />
          </div>

          <div className="form-group">
            <label>Описание *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={6}
            />
          </div>

          <div className="form-group">
            <label>Требования для вступления</label>
            <textarea
              name="requirements_text"
              value={formData.requirements_text}
              onChange={handleChange}
              rows={4}
              placeholder="Опишите, что нужно предоставить для вступления в клуб"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Макс. фото в заявке</label>
              <input
                type="number"
                name="max_application_photos"
                value={formData.max_application_photos}
                onChange={handleChange}
                min={1}
                max={10}
              />
            </div>

            <div className="form-group">
              <label>Макс. фото в галерее</label>
              <input
                type="number"
                name="max_club_photos"
                value={formData.max_club_photos}
                onChange={handleChange}
                min={1}
                max={100}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Разрешённые типы файлов</label>
            <input
              type="text"
              name="allowed_file_types"
              value={formData.allowed_file_types}
              onChange={handleChange}
              placeholder="jpg,jpeg,png"
            />
            <small>Укажите расширения через запятую</small>
          </div>

          <div className="form-group">
            <label>Макс. размер файла (МБ)</label>
            <input
              type="number"
              name="max_file_size_mb"
              value={formData.max_file_size_mb}
              onChange={handleChange}
              min={1}
              max={50}
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saving} className="btn-save">
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
            <button 
              type="button" 
              onClick={() => navigate(`/clubs/${id}`)}  // 👈 ИЗМЕНЕНО
              className="btn-cancel"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClubEdit;