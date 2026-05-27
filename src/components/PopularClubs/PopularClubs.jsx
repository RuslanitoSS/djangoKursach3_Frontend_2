import { useRef } from 'react';
import { Link } from 'react-router-dom';
import './PopularClubs.css';

// Mock data (в реальности будет приходить с бэкенда)
const popularClubs = [
  {
    id: 1,
    title: 'Фан-клуб "Фишер"',
    description: 'Сообщество поклонников детективного сериала "Фишер". Обсуждения, теории, встречи.',
    coverPhoto: 'https://via.placeholder.com/400x250',
    slug: 'fisher-fan-club',
    franchise: { name: 'Фишер', id: 1 },
    membersCount: 1247,
    isActive: true,
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
  },
];

function PopularClubs() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="popular-clubs-section">
      <div className="section-header">
        <h2 className="section-title">Популярные фан-клубы</h2>
        <Link to="/clubs/search" className="view-all-link">
          Все клубы →
        </Link>
      </div>

      <div className="clubs-scroll-container">
        <button 
          className="scroll-btn left" 
          onClick={() => scroll('left')}
          aria-label="Прокрутить влево"
        >
          ‹
        </button>

        <div className="clubs-scroll-content" ref={scrollRef}>
          {popularClubs.map((club) => (
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
                  <div className="club-overlay">
                    <span className="join-btn">Вступить</span>
                  </div>
                </div>

                <div className="club-info">
                  <div className="club-meta">
                    {club.franchise && (
                      <span className="club-franchise">
                        {club.franchise.name}
                      </span>
                    )}
                    <span className="club-members">
                      👥 {club.membersCount.toLocaleString()}
                    </span>
                  </div>
                  
                  <h3 className="club-title">{club.title}</h3>
                  
                  <p className="club-description">
                    {club.description.length > 80 
                      ? `${club.description.substring(0, 80)}...` 
                      : club.description}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>

        <button 
          className="scroll-btn right" 
          onClick={() => scroll('right')}
          aria-label="Прокрутить вправо"
        >
          ›
        </button>
      </div>
    </section>
  );
}

export default PopularClubs;