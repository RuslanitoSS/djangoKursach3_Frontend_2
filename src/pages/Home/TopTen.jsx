import { Link } from 'react-router-dom';

const topTenItems = [
  { id: 3, rank: 1, title: 'Фишер', image: 'https://via.placeholder.com/200x300', rating: 9.1 },
  { id: 4, rank: 2, title: 'Кракен', image: 'https://via.placeholder.com/200x300', rating: 8.7 },
  { id: 5, rank: 3, title: 'Беспринципные', image: 'https://via.placeholder.com/200x300', rating: 8.9 },
  { id: 6, rank: 4, title: 'Слово пацана', image: 'https://via.placeholder.com/200x300', rating: 9.3 },
];

function TopTen() {
  return (
    <section className="content-section top-ten-section">
      <h2 className="section-title">Топ-10 за месяц</h2>
      <div className="top-ten-grid">
        {topTenItems.map((item) => (
          <div key={item.rank} className="top-item">
            <div className="rank-number">{item.rank}</div>
            <Link to={`/watch/${item.id}`} className="top-card-link">
              <div className="top-card">
                <img src={item.image} alt={item.title} />
                <div className="top-info">
                  <h3>{item.title}</h3>
                  <span className="rating">★ {item.rating}</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export default TopTen;