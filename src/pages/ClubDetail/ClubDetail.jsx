import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import './ClubDetail.css';

// Полифилл useId для React < 18
let counter = 0;
const useId = () => {
  const ref = useRef(null);
  if (ref.current === null) {
    counter += 1;
    ref.current = `club-detail-${counter}`;
  }
  return ref.current;
};

function ClubDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const pageId = useId();
  const aboutId = useId();
  const requirementsId = useId();
  const galleryId = useId();
  const settingsId = useId();
  const membersId = useId();
  const coverUploadId = useId();
  const photoUploadId = useId();
  const deleteConfirmId = useId();
  const leaveConfirmId = useId();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [members, setMembers] = useState([]);

  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isMember, setIsMember] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [isLastMember, setIsLastMember] = useState(false);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const [notification, setNotification] = useState('');

  // ================= ЗАГРУЗКА ДАННЫХ =================
  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();
    const signal = controller.signal;
    let isMounted = true;

    const fetchClubData = async () => {
      try {
        setLoading(true);
        setError('');

        const [clubResponse, photosResponse, membersResponse] = await Promise.all([
          api.get(`fan-clubs/${id}/`, { signal }),
          api.get(`fan-clubs/${id}/photos/`, { signal }),
          api.get(`fan-clubs/${id}/memberships/`, { signal }),
        ]);

        if (!isMounted) return;

        const clubData = clubResponse.data;
        const photosData = photosResponse.data.results || photosResponse.data || [];
        const membersData = membersResponse.data.results || membersResponse.data || [];

        setClub(clubData);
        setPhotos(photosData);
        setMembers(membersData);

      } catch (err) {
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return;
        }

        if (!isMounted) return;

        console.error('Ошибка загрузки клуба:', err);
        if (err.response?.status === 404) {
          setError('Клуб не найден');
        } else {
          setError('Не удалось загрузить информацию о клубе.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClubData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [id]);

  // 👇 ОТДЕЛЬНЫЙ useEffect для проверки участия
  // Срабатывает когда загрузились members И user
  useEffect(() => {
    if (!isAuthenticated || !user || members.length === 0) {
      setIsMember(false);
      setIsLastMember(false);
      return;
    }

    // 👇 Приводим к строке для надёжного сравнения (number vs string)
    const userId = String(user.id);

    const userMembership = members.find(
      m => String(m.user_id) === userId && m.status === 'approved'
    );

    setIsMember(!!userMembership);

    const approvedMembers = members.filter(m => m.status === 'approved');
    setIsLastMember(approvedMembers.length === 1 && !!userMembership);

  }, [isAuthenticated, user, members]);

  // ================= ХЕЛПЕРЫ =================
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 5000);
  };

  const refreshMembers = async () => {
    try {
      const response = await api.get(`fan-clubs/${id}/memberships/`);
      setMembers(response.data.results || response.data || []);
    } catch (err) {
      console.warn('Не удалось обновить список участников:', err);
    }
  };

  const refreshClub = async () => {
    try {
      const response = await api.get(`fan-clubs/${id}/`);
      setClub(response.data);
    } catch (err) {
      console.warn('Не удалось обновить данные клуба:', err);
    }
  };

  // ================= ОДОБРЕНИЕ ЗАЯВКИ (по клику на имя) =================
  const handleApproveMember = async (membership) => {
    // Защита: только для pending и только для админов
    if (membership.status !== 'pending') return;
    if (!isAdmin) return;

    try {
      await api.post(`fan-clubs/memberships/${membership.id}/approve/`);
      showNotification(`✅ Заявка пользователя ${membership.user_username} одобрена`);

      // Параллельное обновление
      await Promise.all([refreshClub(), refreshMembers()]);
    } catch (err) {
      console.error('Ошибка одобрения заявки:', err);
      showNotification('Ошибка: ' + (err.response?.data?.detail || 'Не удалось одобрить заявку'));
    }
  };

  // ================= ДЕЙСТВИЯ =================
  const handleJoinClub = async () => {
    if (!isAuthenticated) {
      showNotification('Необходимо войти в систему');
      navigate('/login');
      return;
    }

    try {
      setJoining(true);
      await api.post(`fan-clubs/${id}/join/`);
      await Promise.all([refreshClub(), refreshMembers()]);
      setIsMember(true);
      setConfirmLeave(false);
      showNotification('Вы успешно вступили в клуб!');
    } catch (err) {
      console.error('Ошибка вступления:', err);
      showNotification('Ошибка: ' + (err.response?.data?.detail || 'Не удалось вступить в клуб'));
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveClub = async () => {
    if (!confirmLeave) {
      setConfirmLeave(true);
      return;
    }

    try {
      setLeaving(true);
      const response = await api.post(`fan-clubs/${id}/leave/`);

      const isClubDeleted = response.data.detail?.includes('удалён');

      if (isClubDeleted) {
        showNotification('Клуб удалён, так как вы были последним участником');
        setTimeout(() => navigate('/clubs/search'), 1500);
        return;
      }

      await Promise.all([refreshClub(), refreshMembers()]);
      setIsMember(false);
      setConfirmLeave(false);
      showNotification('Вы покинули клуб');
    } catch (err) {
      console.error('Ошибка выхода:', err);
      showNotification('Ошибка: ' + (err.response?.data?.detail || 'Не удалось покинуть клуб'));
      setConfirmLeave(false);
    } finally {
      setLeaving(false);
    }
  };

  const handleDeleteClub = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`fan-clubs/${id}/`);
      showNotification('Клуб успешно удалён');
      setTimeout(() => navigate('/clubs/search'), 1000);
    } catch (err) {
      console.error('Ошибка удаления клуба:', err);
      showNotification('Ошибка при удалении: ' + (err.response?.data?.detail || 'Неизвестная ошибка'));
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      setUploading(true);
      await api.post(`fan-clubs/${id}/upload_photo/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const photosResponse = await api.get(`fan-clubs/${id}/photos/`);
      setPhotos(photosResponse.data.results || photosResponse.data || []);

      setShowPhotoUpload(false);
      showNotification('Фото успешно загружено в галерею!');
      e.target.reset();
    } catch (err) {
      console.error('Ошибка загрузки фото:', err);
      showNotification('Ошибка: ' + (err.response?.data?.detail || 'Неизвестная ошибка'));
    } finally {
      setUploading(false);
    }
  };

  const handleCoverUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      setUploading(true);
      const response = await api.post(`fan-clubs/${id}/upload_cover_photo/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.cover_photo_url) {
        setClub(prev => ({ ...prev, cover_photo_url: response.data.cover_photo_url }));
      } else {
        await refreshClub();
      }

      setShowCoverUpload(false);
      showNotification('Обложка успешно обновлена!');
      e.target.reset();
    } catch (err) {
      console.error('Ошибка загрузки обложки:', err);
      showNotification('Ошибка: ' + (err.response?.data?.detail || 'Неизвестная ошибка'));
    } finally {
      setUploading(false);
    }
  };

  // ================= РЕНДЕР =================
  if (loading) {
    return (
      <div className="club-loading-container" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <p>Загрузка клуба...</p>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="club-error-container" role="alert">
        <h2>Ошибка</h2>
        <p>{error || 'Клуб не найден'}</p>
        <button onClick={() => navigate('/clubs')} className="btn-back">
          ← Вернуться к списку
        </button>
      </div>
    );
  }

  const isAdmin = club.is_admin || club.is_creator;

  return (
    <div className="club-detail-page">
      <a href="#main-content" className="skip-link">
        Перейти к основному контенту
      </a>

      {notification && (
        <div className="visually-hidden" role="status" aria-live="assertive">
          {notification}
        </div>
      )}

      {/* ================= ХЕДЕР С ОБЛОЖКОЙ ================= */}
      <header className="club-cover-section" aria-labelledby={`${pageId}-title`}>
        {club.cover_photo_url ? (
          <img
            src={club.cover_photo_url}
            alt=""
            aria-hidden="true"
            className="club-cover-image"
          />
        ) : (
          <div className="club-cover-placeholder" aria-hidden="true">
            <span>Нет обложки</span>
          </div>
        )}
        <div className="club-cover-overlay">
          <div className="container">
            <h1 id={`${pageId}-title`} className="club-title">{club.title}</h1>
            {club.franchise && (
              <p className="club-franchise">
                <span aria-hidden="true">🎬 </span>
                Франшиза:{' '}
                <Link
                  to={`/browse?franchise=${club.franchise.id}`}
                  className="franchise-link"
                  aria-label={`Перейти к франшизе ${club.franchise.title}`}
                >
                  {club.franchise.title}
                </Link>
              </p>
            )}
            <div className="club-meta-badges" role="list" aria-label="Статистика клуба">
              <span className="badge" role="listitem">
                <span aria-hidden="true">👥 </span>
                <span aria-label={`${club.members_count || 0} участников`}>
                  {club.members_count || 0} участников
                </span>
              </span>
              <span className="badge" role="listitem">
                <span aria-hidden="true">📸 </span>
                <span aria-label={`${photos.length} из ${club.max_club_photos} фото`}>
                  {photos.length} / {club.max_club_photos} фото
                </span>
              </span>
              {!club.is_active && (
                <span className="badge badge-inactive" role="listitem">
                  <span aria-hidden="true">⛔ </span>
                  <span>Клуб скрыт</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="container club-content-wrapper" tabIndex={-1}>
        {notification && (
          <div className="notification-banner" role="alert">{notification}</div>
        )}

        {/* ================= ПАНЕЛЬ ДЕЙСТВИЙ (для всех авторизованных) ================= */}
        {isAuthenticated ? (
          <nav className="admin-panel" aria-label="Действия с клубом">

            {/* 👇 КНОПКА ВСТУПИТЬ/ПОКИНУТЬ — видна ВСЕМ авторизованным */}
            <div className="membership-buttons">
              {isMember ? (
                <button
                  className={`btn ${confirmLeave ? 'btn-danger-confirm' : 'btn-leave'}`}
                  onClick={handleLeaveClub}
                  disabled={leaving}
                  aria-describedby={confirmLeave ? leaveConfirmId : undefined}
                >
                  {leaving ? (
                    <>
                      <span className="spinner-small" aria-hidden="true"></span>
                      <span className="visually-hidden">Выполняется выход из клуба</span>
                      Выход...
                    </>
                  ) : confirmLeave ? (
                    <>
                      <span aria-hidden="true">⚠️ </span>
                      {isLastMember ? 'Подтвердить (клуб удалится)' : 'Подтвердить выход'}
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">🚪 </span>
                      Покинуть клуб
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="btn btn-join"
                  onClick={handleJoinClub}
                  disabled={joining}
                >
                  {joining ? (
                    <>
                      <span className="spinner-small" aria-hidden="true"></span>
                      <span className="visually-hidden">Выполняется вступление в клуб</span>
                      Вступление...
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">➕ </span>
                      Вступить в клуб
                    </>
                  )}
                </button>
              )}

              {confirmLeave && (
                <p id={leaveConfirmId} className="visually-hidden">
                  {isLastMember
                    ? 'Вы последний участник. Повторное нажатие удалит клуб без возможности восстановления.'
                    : 'Повторное нажатие выведет вас из клуба.'}
                </p>
              )}
            </div>

            {/* 👇 АДМИНСКИЕ КНОПКИ — видны ТОЛЬКО админам */}
            {isAdmin && (
              <div className="admin-upload-buttons">
                <button
                  className={`btn ${confirmDelete ? 'btn-danger-confirm' : 'btn-danger-outline'}`}
                  onClick={handleDeleteClub}
                  disabled={deleting}
                  aria-describedby={confirmDelete ? deleteConfirmId : undefined}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-small" aria-hidden="true"></span>
                      <span className="visually-hidden">Выполняется удаление клуба</span>
                      Удаление...
                    </>
                  ) : confirmDelete ? (
                    <>
                      <span aria-hidden="true">⚠️ </span>
                      Подтвердить удаление
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true">🗑 </span>
                      Удалить клуб
                    </>
                  )}
                </button>

                {confirmDelete && (
                  <p id={deleteConfirmId} className="visually-hidden">
                    Повторное нажатие удалит клуб без возможности восстановления
                  </p>
                )}

                <button
                  className={`btn ${showCoverUpload ? 'btn-danger' : 'btn-outline'}`}
                  onClick={() => {
                    setShowCoverUpload(!showCoverUpload);
                    setShowPhotoUpload(false);
                    setConfirmDelete(false);
                  }}
                  aria-expanded={showCoverUpload}
                  aria-controls={coverUploadId}
                >
                  {showCoverUpload ? (
                    <><span aria-hidden="true">❌ </span>Отмена</>
                  ) : (
                    <><span aria-hidden="true">🖼 </span>Обложка</>
                  )}
                </button>
                <Link
                  to={`/clubs/${club.id}/edit`}
                  className="btn btn-secondary"
                  aria-label="Редактировать настройки клуба"
                >
                  <span aria-hidden="true">✏️ </span>
                  Редактировать
                </Link>
                <button
                  className={`btn ${showPhotoUpload ? 'btn-danger' : 'btn-primary'}`}
                  onClick={() => {
                    setShowPhotoUpload(!showPhotoUpload);
                    setShowCoverUpload(false);
                    setConfirmDelete(false);
                  }}
                  aria-expanded={showPhotoUpload}
                  aria-controls={photoUploadId}
                >
                  {showPhotoUpload ? (
                    <><span aria-hidden="true">❌ </span>Отмена</>
                  ) : (
                    <><span aria-hidden="true">📷 </span>Фото</>
                  )}
                </button>
              </div>
            )}
          </nav>
        ) : (
          /* 👇 Для неавторизованных — только кнопка входа */
          <div className="admin-panel" aria-label="Действия с клубом">
            <Link to="/login" className="btn btn-join">
              <span aria-hidden="true">🔑 </span>
              Войти, чтобы вступить
            </Link>
          </div>
        )}

        {/* ================= ФОРМЫ ЗАГРУЗКИ (только для админов) ================= */}
        {showCoverUpload && isAdmin && (
          <div
            id={coverUploadId}
            className="upload-form-card cover-upload-card"
            role="region"
            aria-label="Форма загрузки обложки"
          >
            <h3>Загрузить новую обложку клуба</h3>
            <p className="form-hint">
              Рекомендуемый размер: 1920×600px. Максимальный вес: {club.max_file_size_mb} МБ.
            </p>
            <form onSubmit={handleCoverUpload}>
              <div className="form-group">
                <label htmlFor="cover-photo-input">Выберите изображение обложки:</label>
                <input
                  id="cover-photo-input"
                  type="file"
                  name="cover_photo"
                  accept={`image/${club.allowed_file_types.replace(/,/g, ',image/')}`}
                  required
                  aria-required="true"
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="btn btn-primary"
                aria-busy={uploading}
              >
                {uploading ? 'Загрузка...' : 'Установить обложку'}
              </button>
            </form>
          </div>
        )}

        {showPhotoUpload && isAdmin && (
          <div
            id={photoUploadId}
            className="upload-form-card"
            role="region"
            aria-label="Форма загрузки фото в галерею"
          >
            <h3><span aria-hidden="true">📷 </span>Новое фото в галерею</h3>
            <form onSubmit={handlePhotoUpload}>
              <div className="form-group">
                <label htmlFor="gallery-photo-input">Выберите изображение:</label>
                <input
                  id="gallery-photo-input"
                  type="file"
                  name="photo"
                  accept={`image/${club.allowed_file_types.replace(/,/g, ',image/')}`}
                  required
                  aria-required="true"
                />
                <small className="form-hint" id="file-types-hint">
                  Допустимые форматы: {club.allowed_file_types}
                </small>
              </div>
              <div className="form-group">
                <label htmlFor="caption-input">Подпись (необязательно):</label>
                <input
                  id="caption-input"
                  type="text"
                  name="caption"
                  placeholder="Описание момента..."
                  maxLength={255}
                  aria-describedby="caption-hint"
                />
                <small id="caption-hint" className="form-hint">Максимум 255 символов</small>
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="btn btn-primary"
                aria-busy={uploading}
              >
                {uploading ? 'Загрузка...' : 'Отправить в галерею'}
              </button>
            </form>
          </div>
        )}

        <div className="club-grid-layout">
          <div className="club-main-info">
            <section className="info-block" aria-labelledby={aboutId}>
              <h2 id={aboutId}>О клубе</h2>
              <p className="club-description">{club.description || 'Описание отсутствует.'}</p>
            </section>

            {club.requirements_text && (
              <section className="info-block requirements" aria-labelledby={requirementsId}>
                <h2 id={requirementsId}>Требования для вступления</h2>
                <p>{club.requirements_text}</p>
              </section>
            )}

            <section className="info-block gallery" aria-labelledby={galleryId}>
              <div className="section-header-with-action">
                <h2 id={galleryId}>Галерея ({photos.length})</h2>
                {isAdmin && (
                  <span className="limit-hint" aria-label={`Лимит ${club.max_club_photos} фото`}>
                    Лимит: {club.max_club_photos} фото
                  </span>
                )}
              </div>

              {photos.length > 0 ? (
                <div className="photo-grid" role="list" aria-label="Галерея фотографий клуба">
                  {photos.map(photo => (
                    <figure key={photo.id} className="photo-item full-image-card" role="listitem">
                      <img
                        src={photo.photo_url}
                        alt={photo.caption ? `Фото: ${photo.caption}` : 'Фото клуба'}
                        loading="lazy"
                      />
                      {photo.caption && (
                        <figcaption className="photo-overlay-caption">{photo.caption}</figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="empty-state">В галерее пока нет фотографий.</p>
              )}
            </section>
          </div>

          <aside className="club-sidebar" aria-label="Дополнительная информация о клубе">
            {isAdmin && (
              <section className="info-block admin-settings-block" aria-labelledby={settingsId}>
                <h2 id={settingsId}><span aria-hidden="true">⚙️ </span>Настройки клуба</h2>
                <dl className="settings-grid" aria-label="Параметры клуба">
                  <div className="setting-item">
                    <dt className="setting-label">ID Клуба:</dt>
                    <dd className="setting-value">#{club.id}</dd>
                  </div>
                  <div className="setting-item">
                    <dt className="setting-label">Статус:</dt>
                    <dd className="setting-value">
                      <span
                        className={`status-badge ${club.is_active ? 'active' : 'inactive'}`}
                        aria-label={club.is_active ? 'Клуб активен' : 'Клуб скрыт'}
                      >
                        {club.is_active ? 'Активен' : 'Скрыт'}
                      </span>
                    </dd>
                  </div>
                  <div className="setting-divider" aria-hidden="true"></div>
                  <div className="setting-item">
                    <dt className="setting-label">Макс. фото в заявке:</dt>
                    <dd className="setting-value">{club.max_application_photos} шт.</dd>
                  </div>
                  <div className="setting-item">
                    <dt className="setting-label">Макс. фото в галерее:</dt>
                    <dd className="setting-value">{club.max_club_photos} шт.</dd>
                  </div>
                  <div className="setting-item">
                    <dt className="setting-label">Размер файла:</dt>
                    <dd className="setting-value">до {club.max_file_size_mb} МБ</dd>
                  </div>
                  <div className="setting-item full-width">
                    <dt className="setting-label">Форматы файлов:</dt>
                    <dd className="setting-value tags">
                      {club.allowed_file_types.split(',').map(type => (
                        <span key={type} className="file-tag">.{type.trim()}</span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </section>
            )}

            <section className="info-block members-list-block" aria-labelledby={membersId}>
              <h2 id={membersId}>Участники ({members.length})</h2>
              {members.length > 0 ? (
                <ul className="members-list" aria-label="Список участников клуба">
                  {members.map(member => (
                    <li key={member.id} className={`member-item role-${member.role}`}>
                      <div className="member-avatar-placeholder" aria-hidden="true">
                        {member.user_username.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-details">
                        {/* 👇 Имя кликабельно только для pending + админ */}
                        {isAdmin && member.status === 'pending' ? (
                          <button
                            type="button"
                            className="member-name member-name-pending"
                            onClick={() => handleApproveMember(member)}
                            title={`Одобрить заявку пользователя ${member.user_username}`}
                            aria-label={`Одобрить заявку ${member.user_username}`}
                          >
                            {member.user_username}
                            <span className="approve-hint" aria-hidden="true">⬅ нажмите, чтобы одобрить</span>
                          </button>
                        ) : (
                          <span className="member-name">{member.user_username}</span>
                        )}

                        <span className={`member-role ${member.role}`}>
                          {member.role === 'admin' ? 'Администратор' : 'Участник'}
                          {member.status === 'pending' && (
                            <span className="status-pending-badge" aria-label="Заявка на рассмотрении">
                              ⏳ На проверке
                            </span>
                          )}
                        </span>
                      </div>

                      <div
                        className="member-status-indicator"
                        aria-label={member.status === 'approved' ? 'Статус: одобрен' : 'Статус: на проверке'}
                      >
                        <span aria-hidden="true">
                          {member.status === 'approved' ? '✅' : '⏳'}
                        </span>
                      </div>

                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">Пока никто не вступил.</p>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default ClubDetail;