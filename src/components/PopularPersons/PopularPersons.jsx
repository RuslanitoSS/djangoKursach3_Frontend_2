import { useRef } from 'react';
import { Link } from 'react-router-dom';
import './PopularPersons.css';
import { useId } from 'react';

function PopularPersons({ persons = [], loading = false }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 220;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

// 🔧 Минимальная логика для a11y
const sectionId = useId();

if (loading) {
  return (
    <section
      className="popular-persons-section"
      aria-labelledby={sectionId}
      aria-busy="true"
      role="region"
    >
      <div className="section-header">
        <h2 id={sectionId} className="section-title">Популярные актёры</h2>
      </div>
      <div className="persons-scroll-container">
        <div className="persons-loading-placeholder" role="status">
          <span className="visually-hidden">Загрузка популярных актёров...</span>
          <div className="skeleton-animation" aria-hidden="true"></div>
        </div>
      </div>
    </section>
  );
}

if (!persons || persons.length === 0) {
  return null;
}

return (
  <section
    className="popular-persons-section"
    aria-labelledby={sectionId}
    role="region"
  >
    <div className="section-header">
      <h2 id={sectionId} className="section-title">Популярные актёры</h2>
      <Link to="/persons" className="view-all-link" aria-label="Перейти ко всем актёрам">
        Все актёры →
      </Link>
    </div>

    <div className="persons-scroll-container">
      <button
        className="scroll-btn left"
        onClick={() => scroll('left')}
        aria-label="Прокрутить влево"
      >
        <span aria-hidden="true">‹</span>
      </button>

      <div
        className="persons-scroll-content"
        ref={scrollRef}
        role="list"
        aria-label="Список популярных актёров"
      >
        {persons.map((person) => (
          <div key={person.id} role="listitem">
            <Link
              to={`/persons/${person.id}`}
              className="person-card-link"
              aria-label={`${person.firstName} ${person.lastName}${person.country ? `, ${person.country}` : ''}`}
            >
              <article className="person-card">
                <div className="person-photo-wrapper">
                  <img
                    src={person.photoUrl}
                    alt=""
                    aria-hidden="true"
                    className="person-photo"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x300?text=No+Photo';
                    }}
                  />
                </div>

                <div className="person-info">
                  <h3 className="person-name">
                    {person.firstName} {person.lastName}
                  </h3>
                  {person.country && (
                    <p className="person-country">{person.country}</p>
                  )}
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

export default PopularPersons;