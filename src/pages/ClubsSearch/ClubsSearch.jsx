import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './ClubsSearch.css';

// Mock data
const mockClubs = [
  {
    id: 1,
    title: 'Фан-клуб "Фишер"',
    description: 'Сообщество поклонников детективного сериала "Фишер". Обсуждения, теории, встречи.',
    coverPhoto: 'https://via.placeholder.com/400x250',
    slug: 'fisher-fan-club',
    franchise: { name: 'Фишер', id: 1 },
    membersCount: 1247,
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    title: '13 Клиническая',
    description: 'Фанаты медицинского сериала. Делимся теориями, кадрами со съёмок и общаемся.',
    coverPhoto: 'https://via.placeholder.com/400x250',
    slug: '13-clinical',
    franchise: { name: '13 Клиническая', id: 2 },
    membersCount: 892,
    isActive: true,
    createdAt: '2024-02-20',
  },
  {
    id: 3,
    title: 'Кракен: Фан-зона',
    description: 'Клуб любителей триллера "Кракен". Обсуждаем сюжет, актёров и делимся впечатлениями.',
    coverPhoto: 'https://via.placeholder.com/400x250',
    slug: 'kraken-fan-zone',
    franchise: { name: 'Кракен', id: 3 },
    membersCount: 756,
    isActive: true,
    createdAt: '2024-03-10',
  },
  {
    id: 4,
    title: 'Беспринципные Club',
    description: 'Сообщество фанатов комедийного сериала. Мемы, цитаты, встречи с актёрами.',
    coverPhoto: 'https://via.placeholder.com/400x250',
    slug: 'besprintsipnye-club',
    franchise: { name: 'Беспринципные', id: 4 },
    membersCount: 634,
    isActive: true,
    createdAt: '2024-01-25',
  },
  {
    id: 5,
    title: 'Слово пацана',
    description: 'Фан-клуб культового сериала. История, музыка, обсуждение серий.',
    coverPhoto: 'https://via.placeholder.com/400x250',
    slug: 'slovo-patsana',
    franchise: { name: 'Слово пацана', id: 5 },
    membersCount: 2103,
    isActive: true,
    createdAt: '2023-12-05',
  },
];

function ClubsSearch() {
  const [searchQuery, setSearchQuery] = useState('');

  // 🔥 Фильтрация через useMemo — выполняется только при изменении searchQuery
  const filteredClubs = useMemo(() => {
    if (searchQuery.trim() === '') {
      return mockClubs;
    }
    
    const query = searchQuery.toLowerCase();
    return mockClubs.filter(club => 
      club.title.toLowerCase().includes(query) ||
      club.description.toLowerCase().includes(query) ||
      (club.franchise && club.franchise.name.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="clubs-search-page">
      <div className="search-header">
        <h1 className="page-title">Фан-клубы</h1>
        <p className="page-subtitle">
          Найди сообщество по интересам или создай своё
        </p>
      </div>

      {/* Поисковая строка */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Поиск по названию клуба..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <button 
              className="search-clear" 
              onClick={clearSearch}
              aria-label="Очистить поиск"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Результаты поиска */}
      <div className="search-results">
        <div className="results-info">
          <p className="results-count">
            {searchQuery 
              ? <>Найдено клубов: <strong>{filteredClubs.length}</strong> по запросу "{searchQuery}"</>
              : <>Все клубы: <strong>{filteredClubs.length}</strong></>
            }
          </p>
        </div>

        {filteredClubs.length > 0 ? (
          <div className="clubs-grid">
            {filteredClubs.map((club) => (
              <Link 
                key={club.id} 
                to={`/clubs/${club.slug}`} 
                className="club-card-link"
              >
                <article className="club-card">
                  <div className="club-cover-wrapper">
                    <img 
                      src={club.coverPhoto} 
                      alt={club.title}
                      className="club-cover"
                      loading="lazy"
                    />
                    {!club.isActive && (
                      <div className="club-status inactive">Неактивен</div>
                    )}
                  </div>

                  <div className="club-info">
                    {club.franchise && (
                      <span className="club-franchise">{club.franchise.name}</span>
                    )}
                    
                    <h3 className="club-title">{club.title}</h3>
                    
                    <p className="club-description">
                      {club.description.length > 100 
                        ? `${club.description.substring(0, 100)}...` 
                        : club.description}
                    </p>

                    <div className="club-stats">
                      <span className="stat-item">👥 {club.membersCount.toLocaleString()}</span>
                      <span className="stat-divider">•</span>
                      <span className="stat-item">📅 {new Date(club.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">😕</div>
            <h3>Клубы не найдены</h3>
            <p>Попробуйте изменить поисковый запрос</p>
            {searchQuery && (
              <button className="clear-search-btn" onClick={clearSearch}>
                Сбросить поиск
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClubsSearch;