import { useParams } from 'react-router-dom';
import { useState } from 'react';
import './WatchPage.css';
import HorizontalScroll from '../components/HorizontalScroll';

// Mock data для фильма
const movieData = {
  id: 1,
  title: 'Игра в имитацию',
  originalTitle: 'The Imitation Game',
  description: 'Математики должны изобрести дешифратор, чтобы остановить войну. Оскароносная драма с Бенедиктом Камбербэтчем',
  year: 2014,
  duration: '114 мин',
  rating: 8.0,
  votes: '234 567',
  ageRating: '16+',
  genres: ['Биография', 'Драма', 'Исторический'],
  director: 'Мортен Тильдум',
  cast: [
    'Бенедикт Камбербэтч',
    'Кира Найтли',
    'Мэттью Гуд',
    'Рори Киннир',
    'Аллен Лич'
  ],
  coverPhoto: 'https://via.placeholder.com/800x450',
  trailerUrl: '#',
  episodes: [
    { id: 1, title: 'Серия 1', thumbnail: 'https://via.placeholder.com/300x170', duration: '45 мин' },
    { id: 2, title: 'Серия 2', thumbnail: 'https://via.placeholder.com/300x170', duration: '47 мин' },
    { id: 3, title: 'Серия 3', thumbnail: 'https://via.placeholder.com/300x170', duration: '46 мин' },
    { id: 4, title: 'Серия 4', thumbnail: 'https://via.placeholder.com/300x170', duration: '48 мин' },
    { id: 5, title: 'Серия 5', thumbnail: 'https://via.placeholder.com/300x170', duration: '45 мин' },
  ],
  recommendations: [
    { id: 2, title: '13 Клиническая', image: 'https://via.placeholder.com/300x450', rating: 8.5 },
    { id: 3, title: 'Фишер', image: 'https://via.placeholder.com/300x450', rating: 9.1 },
    { id: 4, title: 'Кракен', image: 'https://via.placeholder.com/300x450', rating: 8.7 },
    { id: 5, title: 'Беспринципные', image: 'https://via.placeholder.com/300x450', rating: 8.9 },
  ]
};

function WatchPage() {
  const { id } = useParams();
  const [showTrailer, setShowTrailer] = useState(false);
  const [movie] = useState(movieData);

  const handleWatch = () => {
    // Переход к просмотру
    console.log('Watch movie', id);
  };

  const handleTrailer = () => {
    setShowTrailer(true);
  };

  return (
    <div className="movie-detail-page">
      {/* Hero секция */}
      <section className="movie-hero">
        <div className="hero-backdrop">
          <img src={movie.coverPhoto} alt={movie.title} />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="movie-title">{movie.title}</h1>
            {movie.originalTitle && (
              <p className="original-title">{movie.originalTitle}</p>
            )}
            
            <p className="movie-description">{movie.description}</p>
            
            <div className="movie-meta">
              <span className="meta-item">{movie.year}</span>
              <span className="meta-divider">•</span>
              <span className="meta-item">{movie.duration}</span>
              <span className="meta-divider">•</span>
              <span className="meta-item age-rating">{movie.ageRating}</span>
            </div>

            <div className="movie-rating-block">
              <div className="rating-main">
                <span className="rating-value">{movie.rating}</span>
                <span className="rating-label">рейтинг</span>
              </div>
              <div className="rating-votes">{movie.votes} голосов</div>
            </div>

            <div className="movie-genres">
              {movie.genres.map((genre, index) => (
                <span key={index} className="genre-tag">{genre}</span>
              ))}
            </div>

            <div className="hero-buttons">
              <button className="btn-primary" onClick={handleWatch}>
                Смотреть бесплатно
              </button>
              <button className="btn-secondary" onClick={handleTrailer}>
                Трейлер
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Видеоплеер (трейлер) */}
      {showTrailer && (
        <section className="trailer-section">
          <div className="trailer-container">
            <div className="video-wrapper">
              <div className="video-placeholder">
                <div className="play-button-large">▶</div>
                <p>Трейлер фильма</p>
              </div>
            </div>
            <button 
              className="close-trailer" 
              onClick={() => setShowTrailer(false)}
            >
              ✕
            </button>
          </div>
        </section>
      )}

      {/* Серии (если сериал) */}
      {movie.episodes && movie.episodes.length > 0 && (
        <section className="episodes-section">
          <h2 className="section-title">Серии</h2>
          <div className="episodes-grid">
            {movie.episodes.map((episode) => (
              <div key={episode.id} className="episode-card">
                <div className="episode-thumbnail">
                  <img src={episode.thumbnail} alt={episode.title} />
                  <div className="episode-overlay">
                    <div className="play-icon">▶</div>
                  </div>
                  <span className="episode-duration">{episode.duration}</span>
                </div>
                <h3 className="episode-title">{episode.title}</h3>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Также смотрят */}
      <section className="recommendations-section">
        <h2 className="section-title">Также смотрят</h2>
        <HorizontalScroll 
          title=""
          items={movie.recommendations}
        />
      </section>

      {/* Информация о фильме */}
      <section className="movie-info-section">
        <div className="info-grid">
          <div className="info-block">
            <h3 className="info-title">О фильме</h3>
            <dl className="info-list">
              <dt>Режиссёр</dt>
              <dd>{movie.director}</dd>
              
              <dt>В ролях</dt>
              <dd>{movie.cast.join(', ')}</dd>
              
              <dt>Год</dt>
              <dd>{movie.year}</dd>
              
              <dt>Страна</dt>
              <dd>Великобритания, США</dd>
              
              <dt>Жанр</dt>
              <dd>{movie.genres.join(', ')}</dd>
              
              <dt>Продолжительность</dt>
              <dd>{movie.duration}</dd>
            </dl>
          </div>

          <div className="info-block">
            <h3 className="info-title">Описание</h3>
            <p className="full-description">
              {movie.description}
            </p>
            <p className="full-description">
              Блестящий математик Алан Тьюринг возглавляет группу криптографов 
              во время Второй мировой войны. Их задача — взломать код немецкой 
              шифровальной машины «Энигма», что может изменить ход войны.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default WatchPage;