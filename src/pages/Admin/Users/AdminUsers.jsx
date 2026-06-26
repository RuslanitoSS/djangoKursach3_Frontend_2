import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchUsers,
  fetchUsersStats,
  blockUser,
  unblockUser,
  deleteUser,
  changeUserRole,
  getUserRole,
} from '../../../api/users';
import UserEditModal from './UserEditModal';
import './AdminUsers.css';

// 🔧 Полифилл useId
let counter = 0;
const useId = () => {
  const ref = useRef(null);
  if (ref.current === null) {
    counter += 1;
    ref.current = `admin-users-${counter}`;
  }
  return ref.current;
};

function AdminUsers() {
  const pageId = useId();
  
  // 📊 Данные
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  // 🔍 Фильтры
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  
  // ⚙️ Состояния
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  
  // 🎯 Модальное окно редактирования
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
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
          role: roleFilter || undefined,
          is_active: activeFilter || undefined,
        };

        const [usersData, statsData] = await Promise.all([
          fetchUsers(params),
          fetchUsersStats(),
        ]);

        if (!isMounted) return;

        setUsers(usersData.users);
        setTotalCount(usersData.count);
        setStats(statsData);
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
  }, [search, roleFilter, activeFilter]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(''), 4000);
  };

  // 🔥 Обработчики для модалки
  const handleBlockUser = async (user) => {
    try {
      await blockUser(user.id);
      showNotification(`Пользователь ${user.username} заблокирован`);
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, is_active: false } : u
      ));
      // Обновляем редактируемого пользователя
      setEditingUser(prev => prev ? { ...prev, is_active: false } : prev);
      return true;
    } catch (err) {
      showNotification(err.response?.data?.detail || 'Ошибка блокировки', 'error');
      return false;
    }
  };

  const handleUnblockUser = async (user) => {
    try {
      await unblockUser(user.id);
      showNotification(`Пользователь ${user.username} разблокирован`);
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, is_active: true } : u
      ));
      setEditingUser(prev => prev ? { ...prev, is_active: true } : prev);
      return true;
    } catch (err) {
      showNotification(err.response?.data?.detail || 'Ошибка разблокировки', 'error');
      return false;
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      await deleteUser(user.id);
      showNotification(`Пользователь ${user.username} удалён`);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setShowEditModal(false);
      setEditingUser(null);
      return true;
    } catch (err) {
      showNotification(err.response?.data?.detail || 'Ошибка удаления', 'error');
      return false;
    }
  };

  const handleChangeRole = async (user, newRole) => {
    try {
      await changeUserRole(user.id, newRole);
      showNotification(`Роль ${user.username} изменена`);
      
      const updatedData = {
        is_superuser: newRole === 'superuser',
        is_staff: newRole === 'superuser' || newRole === 'staff',
      };
      
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, ...updatedData } : u
      ));
      setEditingUser(prev => prev ? { ...prev, ...updatedData } : prev);
      return true;
    } catch (err) {
      showNotification(err.response?.data?.detail || 'Ошибка смены роли', 'error');
      return false;
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = (updatedUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    showNotification(`Данные ${updatedUser.username} обновлены`);
    setShowEditModal(false);
    setEditingUser(null);
  };

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setActiveFilter('');
  };

  if (loading && !users.length) {
    return (
      <div className="admin-loading" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <p>Загрузка пользователей...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <a href="#main-content" className="skip-link">
        Перейти к основному контенту
      </a>

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
          Управление пользователями
        </h1>
      </header>

      <main id="main-content" tabIndex={-1}>
        
        {stats && (
          <section className="stats-grid" aria-label="Статистика пользователей">
            <div className="stat-card">
              <div className="stat-icon" aria-hidden="true">👥</div>
              <div className="stat-info">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Всего</div>
              </div>
            </div>
            <div className="stat-card active">
              <div className="stat-icon" aria-hidden="true">✅</div>
              <div className="stat-info">
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">Активных</div>
              </div>
            </div>
            <div className="stat-card blocked">
              <div className="stat-icon" aria-hidden="true">🚫</div>
              <div className="stat-info">
                <div className="stat-value">{stats.blocked}</div>
                <div className="stat-label">Заблокировано</div>
              </div>
            </div>
            <div className="stat-card staff">
              <div className="stat-icon" aria-hidden="true">👑</div>
              <div className="stat-info">
                <div className="stat-value">{stats.staff}</div>
                <div className="stat-label">Админов</div>
              </div>
            </div>
          </section>
        )}

        <section className="filters-panel" aria-label="Фильтры пользователей">
          <div className="search-box">
            <label htmlFor="user-search" className="visually-hidden">
              Поиск пользователей
            </label>
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              id="user-search"
              type="search"
              className="search-input"
              placeholder="Поиск по имени, email, username..."
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
              <label htmlFor="role-filter">Роль:</label>
              <select
                id="role-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">Все</option>
                <option value="superuser">Суперпользователи</option>
                <option value="staff">Администраторы</option>
                <option value="user">Пользователи</option>
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="active-filter">Статус:</label>
              <select
                id="active-filter"
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
              >
                <option value="">Все</option>
                <option value="true">Активные</option>
                <option value="false">Заблокированные</option>
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
          </div>
        </section>

        {error && (
          <div className="admin-error" role="alert">
            <span aria-hidden="true">⚠️ </span>
            {error}
          </div>
        )}

        <section className="users-section" aria-labelledby={`${pageId}-users`}>
          <h2 id={`${pageId}-users`} className="visually-hidden">
            Список пользователей
          </h2>

          {users.length === 0 ? (
            <div className="empty-state" role="status">
              <div className="empty-icon" aria-hidden="true">🔍</div>
              <h3>Пользователи не найдены</h3>
              <p>Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table" role="grid">
                <thead>
                  <tr>
                    <th scope="col">Пользователь</th>
                    <th scope="col">Email</th>
                    <th scope="col">Роль</th>
                    <th scope="col">Статус</th>
                    <th scope="col">
                      <span className="visually-hidden">Действия</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const role = getUserRole(user);
                    return (
                      <tr key={user.id} className={!user.is_active ? 'row-blocked' : ''}>
                        <td>
                          <div className="user-cell">
                            {user.profile_pic ? (
                              <img
                                src={user.profile_pic}
                                alt=""
                                aria-hidden="true"
                                className="user-avatar"
                              />
                            ) : (
                              <div className="user-avatar-placeholder" aria-hidden="true">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="user-info">
                              <div className="user-name">
                                {user.first_name || user.last_name
                                  ? `${user.first_name} ${user.last_name}`.trim()
                                  : user.username}
                              </div>
                              <div className="user-username">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td>{user.email || '—'}</td>
                        <td>
                          <span
                            className="role-badge"
                            style={{ backgroundColor: role.color }}
                          >
                            {role.label}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.is_active ? 'active' : 'blocked'}`}>
                            {user.is_active ? '✅ Активен' : '🚫 Заблокирован'}
                          </span>
                        </td>
                        <td>
                          {/* 🔥 Оставили только кнопку редактирования */}
                          <div className="actions-cell">
                            <button
                              className="action-btn edit"
                              onClick={() => handleEdit(user)}
                              aria-label={`Редактировать ${user.username}`}
                              title="Редактировать"
                            >
                              <span aria-hidden="true">✏️</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* ✏️ Модалка редактирования с новыми обработчиками */}
      {showEditModal && editingUser && (
        <UserEditModal
          user={editingUser}
          onSave={handleSaveUser}
          onBlock={handleBlockUser}
          onUnblock={handleUnblockUser}
          onDelete={handleDeleteUser}
          onChangeRole={handleChangeRole}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}

export default AdminUsers;