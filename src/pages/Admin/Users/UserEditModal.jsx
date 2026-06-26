import { useState, useEffect, useRef } from 'react';
import { updateUser, fetchRoles, getUserRole } from '../../../api/users';
import './AdminUsers.css';

function UserEditModal({ user, onSave, onBlock, onUnblock, onDelete, onChangeRole, onClose }) {
  const modalRef = useRef(null);
  const currentRole = getUserRole(user);
  
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    description: user.description || '',
    is_active: user.is_active ?? true,
    is_staff: user.is_staff ?? false,
    is_superuser: user.is_superuser ?? false,
    group_ids: user.groups_list?.map(g => g.id) || [],
  });
  
  const [selectedRole, setSelectedRole] = useState(currentRole.key);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 🔥 Подтверждения опасных действий
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRole, setConfirmRole] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  // 🔥 Загрузка доступных ролей
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await fetchRoles();
        setAvailableRoles(roles);
      } catch (err) {
        console.error('Ошибка загрузки ролей:', err);
      }
    };
    loadRoles();
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleGroupChange = (groupId) => {
    setFormData(prev => {
      const groups = prev.group_ids.includes(groupId)
        ? prev.group_ids.filter(id => id !== groupId)
        : [...prev.group_ids, groupId];
      return { ...prev, group_ids: groups };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const updatedUser = await updateUser(user.id, formData);
      onSave({
        ...user,
        ...updatedUser,
        groups_list: updatedUser.groups_list || user.groups_list,
      });
    } catch (err) {
      console.error('Ошибка обновления:', err);
      setError(err.response?.data?.detail || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Обработчик блокировки/разблокировки
  const handleToggleBlock = async () => {
    if (!confirmBlock) {
      setConfirmBlock(true);
      return;
    }

    setActionLoading('block');
    try {
      const success = user.is_active 
        ? await onBlock(user) 
        : await onUnblock(user);
      
      if (success) {
        setConfirmBlock(false);
      }
    } finally {
      setActionLoading('');
    }
  };

  // 🔥 Обработчик удаления
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setActionLoading('delete');
    try {
      await onDelete(user);
    } finally {
      setActionLoading('');
    }
  };

  // 🔥 Обработчик смены роли
  const handleRoleChange = async () => {
    if (selectedRole === currentRole.key) return;
    
    if (!confirmRole) {
      setConfirmRole(true);
      return;
    }

    setActionLoading('role');
    try {
      const success = await onChangeRole(user, selectedRole);
      if (success) {
        setConfirmRole(false);
      }
    } finally {
      setActionLoading('');
    }
  };

  // Сброс подтверждений при смене
  useEffect(() => {
    setConfirmBlock(false);
    setConfirmDelete(false);
    setConfirmRole(false);
  }, [selectedRole, user.is_active]);

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-user-title"
      onClick={onClose}
    >
      <div
        className="modal-content edit-modal"
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 id="edit-user-title" className="modal-title">
            <span aria-hidden="true">✏️ </span>
            Редактирование: @{user.username}
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
          {/* 🔥 СЕКЦИЯ: Основная информация */}
          <div className="form-section-header">
            <h3>Основная информация</h3>
          </div>
          
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="edit-username">Username</label>
              <input
                id="edit-username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-email">Email</label>
              <input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-first-name">Имя</label>
              <input
                id="edit-first-name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-last-name">Фамилия</label>
              <input
                id="edit-last-name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
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
              rows="3"
            />
          </div>

          {/* 🔥 СЕКЦИЯ: Роль пользователя */}
          <div className="form-section-header">
            <h3>Роль пользователя</h3>
          </div>
          
          <div className="role-management">
            <div className="role-current">
              <span className="role-label">Текущая роль:</span>
              <span 
                className="role-badge" 
                style={{ backgroundColor: currentRole.color }}
              >
                {currentRole.label}
              </span>
            </div>
            
            <div className="role-change">
              <label htmlFor="role-select">Изменить на:</label>
              <select
                id="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="role-select-large"
              >
                <option value="user">Пользователь</option>
                <option value="staff">Администратор</option>
                <option value="superuser">Суперпользователь</option>
              </select>
              
              {selectedRole !== currentRole.key && (
                <button
                  type="button"
                  className={`btn-role-change ${confirmRole ? 'confirm' : ''}`}
                  onClick={handleRoleChange}
                  disabled={actionLoading === 'role'}
                >
                  {actionLoading === 'role' ? (
                    'Применение...'
                  ) : confirmRole ? (
                    <>⚠️ Подтвердить изменение роли</>
                  ) : (
                    'Применить роль'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 🔥 СЕКЦИЯ: Группы */}
          {availableRoles.length > 0 && (
            <>
              <div className="form-section-header">
                <h3>Группы</h3>
              </div>
              <div className="checkbox-group">
                {availableRoles.map(role => (
                  <label key={role.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.group_ids.includes(role.id)}
                      onChange={() => handleGroupChange(role.id)}
                    />
                    <span>{role.name}</span>
                  </label>
                ))}
              </div>
            </>
          )}

          {/* 🔥 СЕКЦИЯ: Опасная зона */}
          <div className="form-section-header danger">
            <h3>⚠️ Опасная зона</h3>
          </div>
          
          <div className="danger-zone">
            {/* Блокировка/Разблокировка */}
            <div className="danger-item">
              <div className="danger-info">
                <strong>
                  {user.is_active ? '🚫 Заблокировать пользователя' : '✅ Разблокировать пользователя'}
                </strong>
                <p>
                  {user.is_active 
                    ? 'Заблокированный пользователь не сможет войти в систему.'
                    : 'Разблокированный пользователь снова сможет войти в систему.'}
                </p>
              </div>
              <button
                type="button"
                className={`btn-danger-action ${confirmBlock ? 'confirm' : ''}`}
                onClick={handleToggleBlock}
                disabled={actionLoading === 'block'}
              >
                {actionLoading === 'block' ? (
                  'Обработка...'
                ) : confirmBlock ? (
                  <>⚠️ Подтвердить</>
                ) : user.is_active ? (
                  'Заблокировать'
                ) : (
                  'Разблокировать'
                )}
              </button>
            </div>

            {/* Удаление */}
            <div className="danger-item">
              <div className="danger-info">
                <strong>🗑️ Удалить пользователя</strong>
                <p>
                  Это действие необратимо! Все данные пользователя будут удалены навсегда.
                </p>
              </div>
              <button
                type="button"
                className={`btn-danger-action delete ${confirmDelete ? 'confirm' : ''}`}
                onClick={handleDelete}
                disabled={actionLoading === 'delete'}
              >
                {actionLoading === 'delete' ? (
                  'Удаление...'
                ) : confirmDelete ? (
                  <>⚠️ Удалить навсегда</>
                ) : (
                  'Удалить'
                )}
              </button>
            </div>
          </div>

          {/* Кнопки формы */}
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
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserEditModal;