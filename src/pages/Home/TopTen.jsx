import { Link } from 'react-router-dom';
import { useId } from 'react';

function TopTen({ items }) {
const sectionId = useId();
const subtitleId = useId();

if (typeof items === 'string') {
  return (
    <section
      className="content-section top-ten-section"
      aria-labelledby={sectionId}
      aria-describedby={subtitleId}
      aria-busy="true"
      role="region"
    >
      <h2 id={sectionId} className="section-title">Топ-10 за месяц</h2>
      <p id={subtitleId} className="section-subtitle">
        топ 10 по среднему рейтингу за этот месяц
      </p>
      <div className="top-ten-grid" role="status">
        <div className="loading-placeholder">
          <span className="visually-hidden">Загрузка топа-10 фильмов...</span>
          <div className="skeleton-animation" aria-hidden="true"></div>
        </div>
      </div>
    </section>
  );
}

const itemsArray = Array.isArray(items) ? items : [];
if (itemsArray.length === 0) return null;

return (
  <section
    className="content-section top-ten-section"
    aria-labelledby={sectionId}
    aria-describedby={subtitleId}
    role="region"
  >
    <h2 id={sectionId} className="section-title">Топ-10 за месяц</h2>
    <p id={subtitleId} className="section-subtitle">
      топ 10 по среднему рейтингу за этот месяц
    </p>

    <div
      className="top-ten-grid"
      role="list"
      aria-label="Топ-10 фильмов за месяц"
    >
      {itemsArray.slice(0, 10).map((item, index) => (
        <div key={item.id} className="top-item" role="listitem">
          <div className="rank-number" aria-hidden="true">
            {index + 1}
          </div>
          <Link
            to={`/watch/${item.id}`}
            className="top-card-link"
            aria-label={`${index + 1} место: ${item.title}, рейтинг ${item.rating || item.avg_rating || 0}`}
          >
            <div className="top-card">
              <div className="top-card-image-wrapper">
                <img
                  src={item.image}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                />
              </div>
              <div className="top-info">
                <h3 className="top-card-title">{item.title}</h3>
                <span className="rating" aria-label={`Рейтинг ${item.rating || item.avg_rating || 0}`}>
                  ★ {item.rating || item.avg_rating || 0}
                </span>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  </section>
);}
export default TopTen;