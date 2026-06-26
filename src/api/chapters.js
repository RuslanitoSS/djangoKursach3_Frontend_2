import api from './axios';

// ================= ЗАПРОСЫ =================

/**
 * Получение списка фильмов/сериалов с фильтрами
 */
export const fetchChapters = async (params = {}) => {
  try {
    const response = await api.get('chapters/', { params });
    return {
      chapters: response.data.results || response.data || [],
      count: response.data.count || 0,
      next: response.data.next,
      previous: response.data.previous,
    };
  } catch (error) {
    console.error('Ошибка загрузки фильмов:', error);
    throw error;
  }
};

/**
 * Получение детальной информации о фильме/сериале
 */
export const fetchChapterDetail = async (chapterId) => {
  const response = await api.get(`chapters/${chapterId}/`);
  return response.data;
};

/**
 * Создание нового фильма/сериала
 */
export const createChapter = async (data) => {
  const formData = new FormData();
  
  // Добавляем текстовые поля
  Object.keys(data).forEach(key => {
    if (key === 'poster_image' && data[key]) {
      formData.append('poster_image', data[key]);
    } else if (key === 'genres' && Array.isArray(data[key])) {
      data[key].forEach(genreId => {
        formData.append('genres', genreId);
      });
    } else if (key === 'people' && Array.isArray(data[key])) {
      data[key].forEach(personId => {
        formData.append('people', personId);
      });
    } else if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });

  const response = await api.post('chapters/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Обновление фильма/сериала
 */
export const updateChapter = async (chapterId, data) => {
  const formData = new FormData();
  
  Object.keys(data).forEach(key => {
    if (key === 'poster_image' && data[key]) {
      formData.append('poster_image', data[key]);
    } else if (key === 'genres' && Array.isArray(data[key])) {
      data[key].forEach(genreId => {
        formData.append('genres', genreId);
      });
    } else if (key === 'people' && Array.isArray(data[key])) {
      data[key].forEach(personId => {
        formData.append('people', personId);
      });
    } else if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });

  const response = await api.patch(`chapters/${chapterId}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Удаление фильма/сериала
 */
export const deleteChapter = async (chapterId) => {
  const response = await api.delete(`chapters/${chapterId}/`);
  return response.data;
};

/**
 * Получение списка жанров
 */
export const fetchGenres = async () => {
  const response = await api.get('genres/');
  return response.data.results || response.data || [];
};

/**
 * Получение списка франшиз
 */
export const fetchFranchises = async () => {
  const response = await api.get('franchises/');
  return response.data.results || response.data || [];
};

/**
 * Получение списка персон
 */
export const fetchPersons = async () => {
  const response = await api.get('people/');
  return response.data.results || response.data || [];
};

// ================= УТИЛИТЫ =================

/**
 * Форматирование даты
 */
export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Форматирование числа с разделителями
 */
export const formatNumber = (num) => {
  if (!num) return '0';
  return num.toLocaleString('ru-RU');
};