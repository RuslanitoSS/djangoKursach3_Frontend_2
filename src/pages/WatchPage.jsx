import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import './WatchPage.css';
import HorizontalScroll from '../components/HorizontalScroll';

function WatchPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTrailer, setShowTrailer] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(`chapters/${id}/`);
        setMovie(response.data);

        // Если есть эпизоды, устанавливаем первый как текущий
        if (response.data.episodes && response.data.episodes.length > 0) {
          setCurrentEpisode(response.data.episodes[0]);
        }
      } catch (err) {
        console.error('Ошибка загрузки фильма:', err);
        setError(err.response?.data?.detail || 'Не удалось загрузить информацию о фильме');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieData();
    }
  }, [id]);

  const handleEpisodeSelect = (episode) => {
    setCurrentEpisode(episode);
    // Отмечаем эпизод как просмотренный
    api.post(`chapters/${id}/mark_watched/`).catch(console.error);
  };

  const handleVideoEnd = () => {
    // Автопереключение на следующий эпизод
    if (movie?.episodes && currentEpisode) {
      const currentIndex = movie.episodes.findIndex(ep => ep.id === currentEpisode.id);
      if (currentIndex < movie.episodes.length - 1) {
        setCurrentEpisode(movie.episodes[currentIndex + 1]);
      }
    }
  };

  if (loading) {
    return (
      <div className="movie-detail-page loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка фильма...</p>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-detail-page error">
        <div className="error-container">
          <h2>Ошибка</h2>
          <p>{error || 'Фильм не найден'}</p>
          <button onClick={() => window.history.back()} className="btn-back">
            ← Назад
          </button>
        </div>
      </div>
    );
  }

  // Преобразуем данные API в удобный формат
  const movieData = {
    id: movie.id,
    title: movie.title,
    description: movie.description,
    year: movie.release_date?.split('-')[0],
    duration: movie.episodes?.length ? `${movie.episodes.length} серий` : 'Фильм',
    rating: movie.avg_rating || movie.rating_cache,
    votes: movie.view_count?.toLocaleString('ru-RU') || '0',
    ageRating: `${movie.age_rating}+`,
    genres: movie.genres?.map(g => g.name) || [],
    director: movie.people?.filter(p => p.role === 'director').map(p => `${p.first_name} ${p.last_name}`).join(', ') || 'Не указан',
    cast: movie.people?.filter(p => p.role === 'actor').map(p => `${p.first_name} ${p.last_name}`).slice(0, 5) || [],
    coverPhoto: movie.poster_img_url || 'https://via.placeholder.com/800x450',
    trailerUrl: movie.trailer_url,
    episodes: movie.episodes || [],
    recommendations: movie.related || [],
    contentType: movie.content_type,
    country: movie.country,
  };

  // Получаем URL видео для текущего эпизода или фильма
  const videoUrl = currentEpisode?.video_file || movie.video_file;
  const posterUrl = currentEpisode?.thumbnail_url || movieData.coverPhoto;
  const displayTitle = currentEpisode
    ? `Серия ${currentEpisode.episode_number || ''}: ${currentEpisode.title || ''}`.trim()
    : movieData.title;

  return (
    <div className="movie-detail-page">

      {/* ================= HERO: Общая информация ================= */}
      <section className="movie-hero">

        {/* Постер только для печати */}
        <div className="print-poster">
          <img src={movieData.coverPhoto} alt={movieData.title} />
        </div>
        
        <div className="hero-backdrop">
          <img src={movieData.coverPhoto} alt={movieData.title} />
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <h1 className="movie-title">{movieData.title}</h1>

            <p className="movie-description">{movieData.description}</p>

            <div className="movie-meta">
              <span className="meta-item">{movieData.year}</span>
              <span className="meta-divider">•</span>
              <span className="meta-item">{movieData.duration}</span>
              <span className="meta-divider">•</span>
              <span className="meta-item age-rating">{movieData.ageRating}</span>
              {movieData.country && (
                <>
                  <span className="meta-divider">•</span>
                  <span className="meta-item">{movieData.country}</span>
                </>
              )}
            </div>

            <div className="movie-rating-block">
              <div className="rating-main">
                <span className="rating-value">{movieData.rating?.toFixed(1) || 'N/A'}</span>
                <span className="rating-label">рейтинг</span>
              </div>
              <div className="rating-votes">10 голосов</div>
            </div>

            <div className="movie-genres">
              {movieData.genres.map((genre, index) => (
                <span key={index} className="genre-tag">{genre}</span>
              ))}
            </div>

            <div className="hero-buttons">
              {movieData.trailerUrl && (
                <button className="btn-secondary" onClick={() => setShowTrailer(true)}>
                  ▶ Трейлер
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ================= ПЛЕЕР: Всегда первая секция после Hero ================= */}
      <section className="video-player-section">
        <div className="video-player-wrapper">
          {/* Заголовок плеера */}
          <div className="player-header">
            <h2 className="player-title">{displayTitle}</h2>
            {currentEpisode?.duration && (
              <span className="player-duration">{currentEpisode.duration}</span>
            )}
          </div>

          {/* Сам видеоплеер */}
          <div className="video-container">
            {videoUrl ? (
              <video
                controls
                className="main-video-player"
                poster={posterUrl}
                onEnded={handleVideoEnd}
                preload="metadata"
              >
                <source src={videoUrl} type="video/mp4" />
                Ваш браузер не поддерживает воспроизведение видео.
              </video>
            ) : (
              <div className="video-placeholder">
                <div className="play-icon-large">▶</div>
                <p>Видео недоступно</p>
              </div>
            )}
          </div>

          {/* Кнопки управления */}
          <div className="player-controls">
            {movieData.trailerUrl && (
              <button className="btn-outline" onClick={() => setShowTrailer(true)}>
                Смотреть трейлер
              </button>
            )}
            <button className="btn-outline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              ↑ Наверх
            </button>
          </div>
        </div>
      </section>

      {/* ================= ЭПИЗОДЫ: Только для сериалов ================= */}
      {movieData.contentType === 'series' && movieData.episodes?.length > 0 && (
        <section id="episodes-section" className="episodes-section">
          <div className="section-header">
            <h2 className="section-title">Серии</h2>
            <span className="episodes-count">
              {movieData.episodes.length} {movieData.episodes.length === 1 ? 'серия' :
                movieData.episodes.length < 5 ? 'серии' : 'серий'}
            </span>
          </div>

          <div className="chapter-episodes-grid">
            {movieData.episodes.map((episode) => (
              <div
                key={episode.id}
                className={`episode-card ${currentEpisode?.id === episode.id ? 'active' : ''}`}
                onClick={() => handleEpisodeSelect(episode)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleEpisodeSelect(episode)}
              >
                <div className="episode-thumbnail">
                  <img
                    src={episode.thumbnail_url || 'https://via.placeholder.com/300x170'}
                    alt={episode.title || `Серия ${episode.episode_number}`}
                    loading="lazy"
                  />
                  <div className="episode-overlay">
                    <div className="play-icon">▶</div>
                  </div>
                  <span className="episode-duration">{episode.duration || ''}</span>

                  {/* Индикатор текущего эпизода */}
                  {currentEpisode?.id === episode.id && (
                    <div className="playing-badge">
                      <span className="playing-dot"></span>
                      Сейчас играет
                    </div>
                  )}
                </div>

                <div className="episode-info">
                  <h3 className="episode-title">
                    {episode.episode_number
                      ? `${episode.episode_number}. ${episode.title || 'Без названия'}`
                      : episode.title || 'Без названия'}
                  </h3>
                  {episode.description && (
                    <p className="episode-description">{episode.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ================= ТАКЖЕ СМОТРЯТ ================= */}
      {movieData.recommendations?.length > 0 && (
        <section className="recommendations-section">
          <h2 className="section-title">Также смотрят</h2>
          <HorizontalScroll
            title=""
            items={movieData.recommendations.map(rec => ({
              id: rec.id,
              title: rec.title,
              image: rec.poster_img_url,
              rating: rec.avg_rating,
            }))}
          />
        </section>
      )}

      {/* ================= ТРЕЙЛЕР (МОДАЛЬНОЕ ОКНО) ================= */}
      {showTrailer && (
        <div className="modal-overlay" onClick={() => setShowTrailer(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTrailer(false)}>✕</button>
            <div className="trailer-wrapper">
              {movieData.trailerUrl ? (
                <iframe
                  src={movieData.trailerUrl}
                  title="Трейлер"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <p>Трейлер недоступен</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default WatchPage;