import { useRef, useId } from 'react';
import { Link } from 'react-router-dom';

function HorizontalScroll({ title, subtitle, items = [] }) {
  const scrollRef = useRef(null);
  const sectionId = useId(); // Уникальный ID для aria-labelledby

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

 return (
  <section
    className="content-section"
    aria-labelledby={sectionId}
    role="region"
  >
    <div className="section-header">
      <h2 id={sectionId} className="section-title">{title}</h2>
      {subtitle && <span className="section-subtitle">{subtitle}</span>}
    </div>

    <div className="scroll-container">
      <button
        className="scroll-btn left"
        onClick={() => scroll('left')}
        aria-label="Прокрутить влево"
      >
        <span aria-hidden="true">‹</span>
      </button>

      <div
        className="scroll-content"
        ref={scrollRef}
        role="list"
        aria-label={`Список фильмов: ${title}`}
      >
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} role="listitem">
              <Link
                to={`/watch/${item.id}`}
                className="movie-card-link"
                aria-label={`Смотреть ${item.title}`}
              >
                <div className="movie-card">
                  <img
                    src={item.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                  />
                  <div className="card-overlay">
                    <span className="card-title">{item.title}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <div className="no-items-message" role="status" aria-live="polite">
            Нет данных
          </div>
        )}
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

export default HorizontalScroll;