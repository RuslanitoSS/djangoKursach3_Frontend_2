import { useRef } from 'react';
import { Link } from 'react-router-dom';

function HorizontalScroll({ title, subtitle, items }) {
  const scrollRef = useRef(null);

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
    <section className="content-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {subtitle && <span className="section-subtitle">{subtitle}</span>}
      </div>
      <div className="scroll-container">
        <button className="scroll-btn left" onClick={() => scroll('left')}>‹</button>
        <div className="scroll-content" ref={scrollRef}>
          {items.map((item) => (
            <Link 
              key={item.id} 
              to={`/watch/${item.id}`} 
              className="movie-card-link"
            >
              <div className="movie-card">
                <img src={item.image} alt={item.title} />
                <div className="card-overlay">
                  <h3>{item.title}</h3>
                  {item.rating && <span className="rating">★ {item.rating}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <button className="scroll-btn right" onClick={() => scroll('right')}>›</button>
      </div>
    </section>
  );
}

export default HorizontalScroll;