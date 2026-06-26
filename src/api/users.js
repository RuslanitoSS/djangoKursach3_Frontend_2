import api from './axios';

// ================= ЗАПРОСЫ =================

/**
 * Получение списка пользователей с фильтрами и пагинацией
 */
export const fetchUsers = async (params = {}) => {
  try {
    const response = await api.get('users/', { params });
    return {
      users: response.data.results || response.data || [],
      count: response.data.count || 0,
      next: response.data.next,
      previous: response.data.previous,
    };
  } catch (error) {
    console.error('Ошибка загрузки пользователей:', error);
    throw error;
  }
};

/**
 * Получение детальной информации о пользователе
 */
export const fetchUserDetail = async (userId) => {
  const response = await api.get(`users/${userId}/`);
  return response.data;
};

/**
 * Обновление данных пользователя
 */
export const updateUser = async (userId, data) => {
  const response = await api.patch(`users/${userId}/`, data);
  return response.data;
};

/**
 * Удаление пользователя
 */
export const deleteUser = async (userId) => {
  const response = await api.delete(`users/${userId}/`);
  return response.data;
};

/**
 * Блокировка пользователя
 */
export const blockUser = async (userId) => {
  const response = await api.post(`users/${userId}/block/`);
  return response.data;
};

/**
 * Разблокировка пользователя
 */
export const unblockUser = async (userId) => {
  const response = await api.post(`users/${userId}/unblock/`);
  return response.data;
};

/**
 * Изменение роли пользователя
 */
export const changeUserRole = async (userId, role) => {
  const response = await api.post(`users/${userId}/change_role/`, { role });
  return response.data;
};

/**
 * Получение статистики пользователей
 */
export const fetchUsersStats = async () => {
  const response = await api.get('users/stats/');
  return response.data;
};

/**
 * Получение списка доступных ролей (групп)
 */
export const fetchRoles = async () => {
  const response = await api.get('users/roles/');
  return response.data;
};

// ================= УТИЛИТЫ =================

/**
 * Определение роли пользователя для отображения
 */
export const getUserRole = (user) => {
  if (user.is_superuser) return { label: 'Суперпользователь', color: '#dc3545', key: 'superuser' };
  if (user.is_staff) return { label: 'Администратор', color: '#ff9800', key: 'staff' };
  return { label: 'Пользователь', color: '#4caf50', key: 'user' };
};

/**
 * Форматирование даты
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};