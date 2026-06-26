import { useState, useEffect, useRef } from 'react';
import {
  fetchChapters,
  deleteChapter,
  fetchGenres,
  fetchFranchises,
  formatDate,
  formatNumber,
} from '../../../api/chapters';
import ChapterEditModal from './ChapterEditModal';
import './AdminChapters.css';
import { Link } from 'react-router-dom';

// 🔧 Полифилл useId
let counter = 0;
const useId = () => {
  const ref = useRef(null);
  if (ref.current === null) {
    counter += 1;
    ref.current = `admin-chapters-${counter}`;
  }
  return ref.current;
};

function AdminChapters() {
  const pageId = useId();

  // 📊 Данные
  const [chapters, setChapters] = useState([]);
  const [stats, setStats] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // 🔍 Фильтры
  const [search, setSearch] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  // ⚙️ Состояния
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  // 🎯 Модальное окно редактирования
  const [editingChapter, setEditingChapter] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ⚠️ Подтверждения
  const [confirmAction, setConfirmAction] = useState(null);

  // 🔥 Загрузка данных
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const params = {
          search: search.trim() || undefined,
          content_type: contentTypeFilter || undefined,
          is_active: activeFilter || undefined,
        };

        const [chaptersData] = await Promise.all([
          fetchChapters(params),
        ]);

        if (!isMounted) return;

        setChapters(chaptersData.chapters);
        setTotalCount(chaptersData.count);

        // Статистика
        setStats({
          total: chaptersData.count,
          movies: chaptersData.chapters.filter(c => c.content_type === 'movie').length,
          series: chaptersData.chapters.filter(c => c.content_type === 'series').length,
          active: chaptersData.chapters.filter(c => c.is_active).length,
        });
      } catch (err) {
        if (err.name === 'CanceledError') return;
        if (!isMounted) return;

        console.error('❌ Ошибка загрузки:', err);
        setError(err.response?.data?.detail || 'Не удалось загрузить данные');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [search, contentTypeFilter, activeFilter]);

  // 🔔 Уведомления
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(''), 4000);
  };

  // 🔥 Обработчик удаления
  const handleDelete = async (chapter) => {
    if (!confirmAction) {
      setConfirmAction({ type: 'delete', chapter });
      return;
    }

    try {
      await deleteChapter(chapter.id);
      showNotification(`"${chapter.title}" удалён`);
      setChapters(prev => prev.filter(c => c.id !== chapter.id));
      setConfirmAction(null);
    } catch (err) {
      showNotification(err.response?.data?.detail || 'Ошибка удаления', 'error');
      setConfirmAction(null);
    }
  };

  // ✏️ Открытие модалки редактирования
  const handleEdit = (chapter) => {
    setEditingChapter(chapter);
    setShowEditModal(true);
  };

  // ➕ Открытие модалки создания
  const handleCreate = () => {
    setEditingChapter(null);
    setShowCreateModal(true);
  };

  // 💾 Сохранение после редактирования/создания
  const handleSaveChapter = (updatedChapter) => {
    if (editingChapter) {
      setChapters(prev => prev.map(c => c.id === updatedChapter.id ? updatedChapter : c));
      showNotification(`"${updatedChapter.title}" обновлён`);
      setShowEditModal(false);
    } else {
      setChapters(prev => [updatedChapter, ...prev]);
      showNotification(`"${updatedChapter.title}" создан`);
      setShowCreateModal(false);
    }
    setEditingChapter(null);
  };

  //  Сброс фильтров
  const resetFilters = () => {
    setSearch('');
    setContentTypeFilter('');
    setActiveFilter('');
  };

  // ✅ Состояние загрузки
  if (loading && !chapters.length) {
    return (
      <div className="admin-loading" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <p>Загрузка фильмов...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <a href="#main-content" className="skip-link">
        Перейти к основному контенту
      </a>

      {/* 🔔 Уведомления */}
      {notification && (
        <div
          className={`admin-notification ${notification.type || 'success'}`}
          role="alert"
        >
          {notification.message}
        </div>
      )}

      <header className="admin-header">
        <Link to="/admin" className="back-button">
          ← Назад
        </Link>
        <h1 id={`${pageId}-title`} className="admin-title">
          <span aria-hidden="true"> </span>
          Управление фильмами и сериалами
        </h1>
      </header>

      <main id="main-content" tabIndex={-1}>

        {/* 📊 Статистика */}
        {stats && (
          <section className="stats-grid" aria-label="Статистика контента">
            <div className="stat-card">
              <div className="stat-icon" aria-hidden="true">🎬</div>
              <div className="stat-info">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Всего</div>
              </div>
            </div>
            <div className="stat-card movies">
              <div className="stat-icon" aria-hidden="true">🎥</div>
              <div className="stat-info">
                <div className="stat-value">{stats.movies}</div>
                <div className="stat-label">Фильмов</div>
              </div>
            </div>
            <div className="stat-card series">
              <div className="stat-icon" aria-hidden="true">📺</div>
              <div className="stat-info">
                <div className="stat-value">{stats.series}</div>
                <div className="stat-label">Сериалов</div>
              </div>
            </div>
            <div className="stat-card active">
              <div className="stat-icon" aria-hidden="true">✅</div>
              <div className="stat-info">
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">Активных</div>
              </div>
            </div>
          </section>
        )}

        {/* 🔍 Панель фильтров */}
        <section className="filters-panel" aria-label="Фильтры контента">
          <div className="search-box">
            <label htmlFor="chapter-search" className="visually-hidden">
              Поиск фильмов и сериалов
            </label>
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              id="chapter-search"
              type="search"
              className="search-input"
              placeholder="Поиск по названию..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="search-clear"
                onClick={() => setSearch('')}
                aria-label="Очистить поиск"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </div>

          <div className="filters-group">
            <div className="filter-item">
              <label htmlFor="content-type-filter">Тип:</label>
              <select
                id="content-type-filter"
                value={contentTypeFilter}
                onChange={(e) => setContentTypeFilter(e.target.value)}
              >
                <option value="">Все</option>
                <option value="movie">Фильмы</option>
                <option value="series">Сериалы</option>
              </select>
            </div>


            <button
              type="button"
              className="btn-reset"
              onClick={resetFilters}
              aria-label="Сбросить все фильтры"
            >
              Сбросить
            </button>

            <button
              type="button"
              className="btn-create"
              onClick={handleCreate}
              aria-label="Добавить новый фильм или сериал"
            >
              <span aria-hidden="true">➕ </span>
              Добавить
            </button>
          </div>
        </section>

        {/* ❌ Ошибка */}
        {error && (
          <div className="admin-error" role="alert">
            <span aria-hidden="true">⚠️ </span>
            {error}
          </div>
        )}

        {/* 📋 Таблица фильмов/сериалов */}
        <section className="chapters-section" aria-labelledby={`${pageId}-chapters`}>
          <h2 id={`${pageId}-chapters`} className="visually-hidden">
            Список фильмов и сериалов
          </h2>

          {chapters.length === 0 ? (
            <div className="empty-state" role="status">
              <div className="empty-icon" aria-hidden="true">🎬</div>
              <h3>Фильмы и сериалы не найдены</h3>
              <p>Попробуйте изменить параметры поиска или добавьте новый контент</p>
            </div>
          ) : (
            <div className="chapters-table-wrapper">
              <table className="chapters-table" role="grid">
                <thead>
                  <tr>
                    <th scope="col">Название</th>
                    <th scope="col">Тип</th>
                    <th scope="col">Год</th>
                    <th scope="col">Рейтинг</th>
                    <th scope="col">Просмотры</th>
                    <th scope="col">Статус</th>
                    <th scope="col">
                      <span className="visually-hidden">Действия</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chapters.map(chapter => (
                    <tr key={chapter.id} className={!chapter.is_active ? 'row-hidden' : ''}>
                      <td>
                        <div className="chapter-cell">
                          {chapter.poster_img_url ? (
                            <img
                              src={chapter.poster_img_url}
                              alt=""
                              aria-hidden="true"
                              className="chapter-poster"
                            />
                          ) : (
                            <div className="chapter-poster-placeholder" aria-hidden="true">
                              🎬
                            </div>
                          )}
                          <div className="chapter-info">
                            <div className="chapter-title">{chapter.title}</div>
                            {chapter.franchise && (
                              <div className="chapter-franchise">
                                {chapter.franchise.title}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`type-badge ${chapter.content_type}`}>
                          {chapter.content_type === 'movie' ? '🎥 Фильм' : '📺 Сериал'}
                        </span>
                      </td>
                      <td>{chapter.release_date ? formatDate(chapter.release_date) : '—'}</td>
                      <td>
                        <span className="rating-value">
                          {chapter.rating_cache?.toFixed(1) || '0.0'}
                        </span>
                      </td>
                      <td>{formatNumber(chapter.view_count)}</td>
                      <td>
                        <span className={`status-badge ${chapter.is_active ? 'active' : 'hidden'}`}>
                          {chapter.is_active ? '✅ Активен' : '🚫 Скрыт'}
                        </span>
                      </td>
                      <td>
                        <div className="actions-cell">
                          <button
                            className="action-btn edit"
                            onClick={() => handleEdit(chapter)}
                            aria-label={`Редактировать ${chapter.title}`}
                            title="Редактировать"
                          >
                            <span aria-hidden="true">✏️</span>
                          </button>

                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(chapter)}
                            aria-label={`Удалить ${chapter.title}`}
                            title="Удалить"
                          >
                            <span aria-hidden="true">🗑️</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* ⚠️ Модалка подтверждения */}
      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          onConfirm={() => {
            if (confirmAction.type === 'delete') {
              handleDelete(confirmAction.chapter);
            }
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* ✏️ Модалка редактирования */}
      {showEditModal && editingChapter && (
        <ChapterEditModal
          chapter={editingChapter}
          onSave={handleSaveChapter}
          onClose={() => {
            setShowEditModal(false);
            setEditingChapter(null);
          }}
        />
      )}

      {/* ➕ Модалка создания */}
      {showCreateModal && (
        <ChapterEditModal
          chapter={null}
          onSave={handleSaveChapter}
          onClose={() => {
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

// ================= МОДАЛКА ПОДТВЕРЖДЕНИЯ =================

function ConfirmModal({ action, onConfirm, onCancel }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={onCancel}
    >
      <div
        className="modal-content confirm-modal"
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="modal-title">
          Удаление контента
        </h2>
        <p className="modal-message">
          ⚠️ Вы уверены, что хотите удалить "{action.chapter.title}"? Это действие необратимо!
        </p>

        <div className="modal-actions">
          <button
            className="btn-cancel"
            onClick={onCancel}
            autoFocus
          >
            Отмена
          </button>
          <button
            className="btn-confirm danger"
            onClick={onConfirm}
          >
            Удалить навсегда
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminChapters;