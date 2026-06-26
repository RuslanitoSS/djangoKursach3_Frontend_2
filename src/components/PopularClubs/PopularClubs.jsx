import { useRef } from 'react';
import { Link } from 'react-router-dom';
import './PopularClubs.css';
import { useId } from 'react';

function PopularClubs({ clubs = [], loading = false }) {
  const scrollRef = useRef(null);
  const sectionId = useId();

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading) {
    return (
      <section
        className="popular-clubs-section"
        aria-labelledby={sectionId}
        aria-busy="true"
        role="region"
      >
        <div className="section-header">
          <h2 id={sectionId} className="section-title">Популярные фан-клубы</h2>
          <Link to="/clubs/search" className="view-all-link" aria-label="Перейти ко всем клубам">
            Все клубы →
          </Link>
        </div>
        <div className="clubs-scroll-container">
          <div className="clubs-loading-placeholder" role="status">
            <span className="visually-hidden">Загрузка популярных фан-клубов...</span>
            <div className="skeleton-animation" aria-hidden="true"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!clubs || clubs.length === 0) {
    return null;
  }

  return (
    <section
      className="popular-clubs-section"
      aria-labelledby={sectionId}
      role="region"
    >
      <div className="section-header">
        <h2 id={sectionId} className="section-title">Популярные фан-клубы</h2>
        <Link to="/clubs/search" className="view-all-link" aria-label="Перейти ко всем клубам">
          Все клубы →
        </Link>
      </div>

      <div className="clubs-scroll-container">
        <button
          className="scroll-btn left"
          onClick={() => scroll('left')}
          aria-label="Прокрутить влево"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <div
          className="clubs-scroll-content"
          ref={scrollRef}
          role="list"
          aria-label="Список популярных фан-клубов"
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
                  </div>

                  <div className="club-info">
                    <div className="club-meta">
                      {club.franchise && (
                        <span className="club-franchise">
                          {club.franchise.name}
                        </span>
                      )}
                      <span className="club-members" aria-label={`${club.membersCount} участников`}>
                        👥 {club.membersCount?.toLocaleString?.() || club.membersCount}
                      </span>
                    </div>

                    <h3 className="club-title">{club.title}</h3>

                  
                    <p className="club-description">
                      {club.description}
                    </p>
                  </div>
                </article>
              </Link>
            </div>
          ))}
        </div>

        <button
          className="scroll-btn right"
          onClick={() => scroll('right')}
          aria-label="Прокрутить вправо"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </section>
  );
}



export default PopularClubs;