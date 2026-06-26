import { useState, useEffect, useRef } from 'react';
import { createChapter, updateChapter, fetchGenres, fetchFranchises } from '../../../api/chapters';
import './AdminChapters.css';

function ChapterEditModal({ chapter, onSave, onClose }) {
  const modalRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: chapter?.title || '',
    description: chapter?.description || '',
    content_type: chapter?.content_type || 'movie',
    release_date: chapter?.release_date || '',
    age_rating: chapter?.age_rating || '18+',
    country: chapter?.country || '',
    poster_image: null,
    franchise: chapter?.franchise?.id || '',
    genres: chapter?.genres?.map(g => g.id) || [],
    is_active: chapter?.is_active ?? true,
  });
  
  const [genres, setGenres] = useState([]);
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔥 Загрузка жанров и франшиз
  useEffect(() => {
    const loadReferences = async () => {
      try {
        const [genresData, franchisesData] = await Promise.all([
          fetchGenres(),
          fetchFranchises(),
        ]);
        setGenres(genresData);
        setFranchises(franchisesData);
      } catch (err) {
        console.error('Ошибка загрузки справочников:', err);
      }
    };
    loadReferences();
  }, []);

  // 🔒 Фокус-ловушка
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (name === 'poster_image') {
      setFormData(prev => ({ ...prev, poster_image: files[0] || null }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleGenreChange = (genreId) => {
    setFormData(prev => {
      const genres = prev.genres.includes(genreId)
        ? prev.genres.filter(id => id !== genreId)
        : [...prev.genres, genreId];
      return { ...prev, genres };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let savedChapter;
      
      if (chapter) {
        // Обновление
        savedChapter = await updateChapter(chapter.id, formData);
      } else {
        // Создание
        savedChapter = await createChapter(formData);
      }
      
      onSave(savedChapter);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError(err.response?.data?.detail || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-chapter-title"
      onClick={onClose}
    >
      <div
        className="modal-content edit-modal large"
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="edit-chapter-title" className="modal-title">
            <span aria-hidden="true">{chapter ? '️' : '➕'} </span>
            {chapter ? 'Редактирование' : 'Создание'}: {chapter?.title || 'Новый контент'}
          </h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Закрыть окно"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {error && (
          <div className="modal-error" role="alert">
            <span aria-hidden="true">⚠️ </span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-form">
          {/* Основная информация */}
          <div className="form-section-header">
            <h3>Основная информация</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-field full-width">
              <label htmlFor="edit-title">Название *</label>
              <input
                id="edit-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-content-type">Тип контента *</label>
              <select
                id="edit-content-type"
                name="content_type"
                value={formData.content_type}
                onChange={handleChange}
                required
              >
                <option value="movie">Фильм</option>
                <option value="series">Сериал</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="edit-release-date">Дата выхода</label>
              <input
                id="edit-release-date"
                name="release_date"
                type="date"
                value={formData.release_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-age-rating">Возрастной рейтинг</label>
              <select
                id="edit-age-rating"
                name="age_rating"
                value={formData.age_rating}
                onChange={handleChange}
              >
                <option value="0+">0+</option>
                <option value="6+">6+</option>
                <option value="12+">12+</option>
                <option value="16+">16+</option>
                <option value="18+">18+</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="edit-country">Страна</label>
              <input
                id="edit-country"
                name="country"
                type="text"
                value={formData.country}
                onChange={handleChange}
                placeholder="Например: США"
              />
            </div>
          </div>

          <div className="form-field full-width">
            <label htmlFor="edit-description">Описание</label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          {/* Постер */}
          <div className="form-section-header">
            <h3>Постер</h3>
          </div>
          
          <div className="form-field">
            <label htmlFor="edit-poster">Изображение постера</label>
            <input
              id="edit-poster"
              name="poster_image"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={handleChange}
            />
            {chapter?.poster_img_url && !formData.poster_image && (
              <div className="current-poster">
                <img src={chapter.poster_img_url} alt="Текущий постер" />
                <span>Текущий постер</span>
              </div>
            )}
          </div>

          {/* Франшиза и жанры */}
          <div className="form-section-header">
            <h3>Категории</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="edit-franchise">Франшиза</label>
              <select
                id="edit-franchise"
                name="franchise"
                value={formData.franchise}
                onChange={handleChange}
              >
                <option value="">— Не выбрано —</option>
                {franchises.map(f => (
                  <option key={f.id} value={f.id}>{f.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field full-width">
            <label>Жанры</label>
            <div className="checkbox-group genres-grid">
              {genres.map(genre => (
                <label key={genre.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.genres.includes(genre.id)}
                    onChange={() => handleGenreChange(genre.id)}
                  />
                  <span>{genre.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Статус */}
          <div className="form-section-header">
            <h3>Статус</h3>
          </div>
          
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span>Активен (отображается на сайте)</span>
            </label>
          </div>

          {/* Кнопки */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : (chapter ? 'Сохранить изменения' : 'Создать')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChapterEditModal;