import api from './axios';

/**
 * Получает список клубов.
 * Если query передан — делает поиск через эндпоинт /search?q=...
 * Если query пустой — берет популярные через /popular/
 */
export const fetchClubs = async (query = '') => {
  try {
    let url = '';
    let params = {};

    if (query.trim()) {
      url = '/fan-clubs/search/';
      params = { q: query };
    } else {
      url = '/fan-clubs/popular/';
    }

    const response = await api.get(url, { params });
    

    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
    
  } catch (error) {
    console.error('Ошибка загрузки клубов:', error);
    throw error;
  }
};

/**
 * Маппинг данных с бэкенда в формат, удобный для фронтенда
 */
export const mapClubData = (club) => ({
  id: club.id,
  title: club.name || club.title || `Клуб #${club.id}`, // Подстраховка на разные поля
  description: club.description || '',
  coverPhoto: club.cover_photo_url,
  slug: club.slug,
  franchise: club.franchise ? { 
    name: club.franchise.name || club.franchise.title, 
    id: club.franchise.id 
  } : null,
  membersCount: club.active_members_count || club.members_count || 0,
  isActive: club.is_active ?? true,
  createdAt: club.created_at,
});