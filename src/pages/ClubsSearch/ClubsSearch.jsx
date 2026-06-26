import { useState, useEffect, useId } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Твой хук авторизации
import { fetchClubs, mapClubData } from '../../api/clubs';
import './ClubsSearch.css';

function ClubsSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useAuth();

  const pageId = useId();
  const resultsId = useId();
  const searchLabelId = useId();

  // Эффект для загрузки данных с дебаунсом (задержкой ввода)
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    // Таймер для дебаунса: ждем 400мс после последнего изменения ввода
    const timer = setTimeout(async () => {
      try {
        const rawClubs = await fetchClubs(searchQuery);

        if (!isCancelled) {
          const mappedClubs = rawClubs.map(mapClubData);
          setClubs(mappedClubs);
          setIsLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setError('Не удалось загрузить клубы. Попробуйте позже.');
          setIsLoading(false);
        }
      }
    }, 400);

    // Очистка таймера при размонтировании или изменении searchQuery
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <>
      {/* ✅ Skip link для клавиатурной навигации */}
      <a href="#main-content" className="skip-link">
        Перейти к основному контенту
      </a>

      <div className="clubs-search-page">

        {/* --- Шапка страницы --- */}
        <header className="search-header" aria-labelledby={`${pageId}-title`}>
          <div className="search-header-top">
            <div>
              <h1 id={`${pageId}-title`} className="page-title">Фан-клубы</h1>
              <p className="page-subtitle" aria-live="polite">
                {searchQuery ? (
                  <>Результаты поиска: «<strong>{searchQuery}</strong>»</>
                ) : (
                  'Популярные сообщества'
                )}
              </p>
            </div>

            {isAuthenticated && (
              <Link
                to="/clubs/create"
                className="btn-create-club"
                aria-label="Создать новый фан-клуб"
              >
                <span aria-hidden="true">➕ </span>
                Создать клуб
              </Link>
            )}
          </div>
        </header>

        {/* --- Поисковая строка --- */}
        <div className="search-section">
          <form
            className="search-input-wrapper"
            role="search"
            aria-label="Поиск фан-клубов"
            onSubmit={(e) => e.preventDefault()}
          >
            <label
              id={searchLabelId}
              htmlFor="club-search-input"
              className="visually-hidden"
            >
              Поиск по названию клуба или франшизе
            </label>
            <span className="search-icon" aria-hidden="true">🔍</span>
            <input
              id="club-search-input"
              type="search"
              className="search-input"
              placeholder="Поиск по названию клуба или франшизе..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-labelledby={searchLabelId}
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear"
                onClick={clearSearch}
                aria-label="Очистить поисковый запрос"
              >
                <span aria-hidden="true">×</span>
              </button>
            )}
          </form>
        </div>

        {/* --- Основной контент --- */}
        <main id="main-content" className="search-results" tabIndex={-1}>

          {/* ✅ Состояние ошибки */}
          {error && (
            <div className="error-state" role="alert">
              <p>
                <span aria-hidden="true">⚠️ </span>
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                aria-label="Перезагрузить страницу и попробовать снова"
              >
                Попробовать снова
              </button>
            </div>
          )}

          {/* ✅ Состояние загрузки */}
          {!error && isLoading ? (
            <div className="loading-state" role="status" aria-live="polite">
              <div className="spinner" aria-hidden="true"></div>
              <p>
                <span className="visually-hidden">Идёт загрузка</span>
                Загрузка клубов...
              </p>
            </div>
          ) : (
            <>
              {/* ✅ Счётчик результатов с live-анонсом */}
              <div className="results-info" aria-live="polite" aria-atomic="true">
                <p className="results-count" id={resultsId}>
                  {searchQuery ? (
                    <>
                      Найдено клубов: <strong>{clubs.length}</strong>
                    </>
                  ) : (
                    <>
                      Популярных клубов: <strong>{clubs.length}</strong>
                    </>
                  )}
                </p>
              </div>

              {clubs.length > 0 ? (
                <div
                  className="clubs-grid"
                  role="list"
                  aria-labelledby={resultsId}
                >
                  {clubs.map((club) => (
                    <div key={club.id} role="listitem">
                      <Link
                        to={`/clubs/${club.id}`}
                        className="club-card-link"
                        aria-label={`Фан-клуб «${club.title}»${club.franchise ? `, франшиза ${club.franchise.name}` : ''}, ${club.membersCount} участников`}
                      >
                        <article className="club-card">
                          <div className="club-cover-wrapper">
                            <img
                              src={club.coverPhoto}
                              alt=""
                              aria-hidden="true"
                              className="club-cover"
                              loading="lazy"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x250?text=No+Image';
                              }}
                            />
                            {!club.isActive && (
                              <div
                                className="club-status inactive"
                                aria-label="Клуб неактивен"
                              >
                                <span aria-hidden="true">⛔ </span>
                                Неактивен
                              </div>
                            )}
                          </div>

                          <div className="club-info">
                            

                            {/* ✅ Заменён <h3> на <span> — внутри ссылки не должно быть заголовков */}
                            <span className="club-title">{club.title}</span>

                            <p className="club-description">
                              {club.description.length > 100
                                ? `${club.description.substring(0, 100)}...`
                                : club.description}
                            </p>

                            <div className="club-stats">
                              <span className="stat-item">
                                <span aria-hidden="true">👥 </span>
                                <span aria-label={`${club.membersCount} участников`}>
                                  {club.membersCount.toLocaleString()}
                                </span>
                              </span>
                              {club.createdAt && (
                                <>
                                  <span className="stat-divider" aria-hidden="true">•</span>
                                  <span className="stat-item">
                                    <span aria-hidden="true">📅 </span>
                                    <span aria-label={`Дата создания: ${new Date(club.createdAt).toLocaleDateString('ru-RU')}`}>
                                      {new Date(club.createdAt).toLocaleDateString('ru-RU')}
                                    </span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </article>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results" role="status">
                  <div className="no-results-icon" aria-hidden="true">😕</div>
                  <h2>Клубы не найдены</h2>
                  <p>Попробуйте изменить поисковый запрос</p>

                  {searchQuery && (
                    <button
                      className="clear-search-btn"
                      onClick={clearSearch}
                      aria-label="Сбросить поисковый запрос и показать все клубы"
                    >
                      Сбросить поиск
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

export default ClubsSearch;