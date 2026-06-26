import { useState, useEffect, useId } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Hero from './Hero';
import TopTen from './TopTen';
import PopularClubs from '../../components/PopularClubs/PopularClubs';
import PopularPersons from '../../components/PopularPersons/PopularPersons';
import HorizontalScroll from '../../components/HorizontalScroll';

const ENDPOINTS = {
  onAir: 'chapters/now_playing/',
  forYou: 'chapters/for_you/',
  topTen: 'chapters/top_10/',
  popularClubs: 'fan-clubs/popular/',
  popularPersons: 'people/popular/',
};

// ================= PLACEHOLDERS =================

/**
 * Универсальный плейсхолдер загрузки с a11y-аннотациями.
 * aria-busy="true" сообщает скринридеру, что секция обновляется.
 * aria-live="polite" — анонс изменения контента без прерывания пользователя.
 */
const LoadingPlaceholder = ({ title, sectionId }) => (
  <section
    className="content-section"
    aria-labelledby={sectionId}
    aria-busy="true"
    role="region"
    
  >
    <div className="section-header">
      <h2 id={sectionId} className="section-title">{title}</h2>
    </div>
    <div className="scroll-container">
      <div className="loading-placeholder" role="status">
        <span className="visually-hidden">Загрузка раздела «{title}»...</span>
        <div className="skeleton-animation" aria-hidden="true"></div>
      </div>
    </div>
  </section>
);

const ClubsLoadingPlaceholder = ({ sectionId }) => (
  <section
    className="popular-clubs-section"
    aria-labelledby={sectionId}
    aria-busy="true"
    role="region"
  >
    <div className="section-header">
      <h2 id={sectionId} className="section-title">Популярные фан-клубы</h2>
      {/* ✅ Исправлено: <a> без href заменён на <Link> */}
      <Link to="/clubs" className="view-all-link" aria-label="Перейти ко всем клубам">
        Все клубы →
      </Link>
    </div>
    <div className="clubs-scroll-container">
      <div className="loading-placeholder" role="status">
        <span className="visually-hidden">Загрузка популярных клубов...</span>
        <div className="skeleton-animation" aria-hidden="true"></div>
      </div>
    </div>
  </section>
);

const PersonsLoadingPlaceholder = ({ sectionId }) => (
  <section
    className="popular-persons-section"
    aria-labelledby={sectionId}
    aria-busy="true"
    role="region"
  >
    <div className="section-header">
      <h2 id={sectionId} className="section-title">Популярные персоны</h2>
      <Link to="/persons" className="view-all-link" aria-label="Перейти ко всем персонам">
        Все персоны →
      </Link>
    </div>
    <div className="persons-scroll-container">
      <div className="loading-placeholder" role="status">
        <span className="visually-hidden">Загрузка популярных персон...</span>
        <div className="skeleton-animation" aria-hidden="true"></div>
      </div>
    </div>
  </section>
);

const TopTenLoadingPlaceholder = ({ sectionId, subtitleId }) => (
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
    <div className="top-ten-grid">
      <div className="loading-placeholder" role="status">
        <span className="visually-hidden">Загрузка топа-10 фильмов...</span>
        <div className="skeleton-animation" aria-hidden="true"></div>
      </div>
    </div>
  </section>
);

// ================= HELPERS =================
const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.items && Array.isArray(data.items)) return data.items;
  return [];
};

// ================= MAPPER FUNCTIONS =================
const mapMovie = (item) => ({
  id: item.id,
  title: item.title || item.name || `Без названия #${item.id}`,
  image: item.poster_img_url || item.cover_photo || item.poster || item.image || 'https://via.placeholder.com/300x450',
  rating: item.avg_rating ?? item.rating_cache ?? 0,
  year: item.release_date?.split('-')[0] || item.year,
});

const mapClub = (club) => ({
  id: club.id,
  title: club.name || club.title || `Клуб #${club.id}`,
  description: club.description || '',
  coverPhoto: club.cover_photo_url,
  slug: club.slug,
  franchise: club.franchise ? { name: club.franchise.name || club.franchise.title, id: club.franchise.id } : null,
  membersCount: club.active_members_count || club.members_count || 0,
  isActive: club.is_active ?? true,
});

const mapPerson = (person) => ({
  id: person.id,
  firstName: person.first_name || person.firstName || '',
  lastName: person.last_name || person.lastName || '',
  photoUrl: person.photo_url || person.photoUrl || person.photo || 'https://via.placeholder.com/200x300',
  biography: person.biography || '',
  birthDate: person.birth_date || person.birthDate,
  country: person.country,
});

// ================= COMPONENT =================
function Home() {
  const [onAirMovies, setOnAirMovies] = useState([]);
  const [forYouMovies, setForYouMovies] = useState([]);
  const [topTenMovies, setTopTenMovies] = useState([]);
  const [popularClubs, setPopularClubs] = useState([]);
  const [popularPersons, setPopularPersons] = useState([]);

  const [loading, setLoading] = useState({
    onAir: true,
    forYou: true,
    topTen: true,
    popularClubs: true,
    popularPersons: true,
  });

  // ✅ Уникальные ID для aria-labelledby (React 18+)
  const onAirId = useId();
  const forYouId = useId();
  const topTenId = useId();
  const topTenSubtitleId = useId();
  const clubsId = useId();
  const personsId = useId();

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    let isMounted = true;

    const fetchData = async () => {
      try {
        const [onAirRes, forYouRes, topTenRes, clubsRes, personsRes] = await Promise.all([
          api.get(ENDPOINTS.onAir, { signal }),
          api.get(ENDPOINTS.forYou, { signal }),
          api.get(ENDPOINTS.topTen, { signal }),
          api.get(ENDPOINTS.popularClubs, { signal }),
          api.get(ENDPOINTS.popularPersons, { signal }),
        ]);

        if (!isMounted) return;

        setOnAirMovies(extractArray(onAirRes.data).map(mapMovie));
        setForYouMovies(extractArray(forYouRes.data).map(mapMovie));
        setTopTenMovies(extractArray(topTenRes.data).map(mapMovie));
        setPopularClubs(extractArray(clubsRes.data).map(mapClub));
        setPopularPersons(extractArray(personsRes.data).map(mapPerson));
      } catch (error) {
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
          console.log('🔄 Запросы отменены (StrictMode cleanup)');
          return;
        }

        if (!isMounted) return;

        console.error('❌ Ошибка загрузки данных:', error);
      } finally {
        if (isMounted) {
          setLoading({
            onAir: false,
            forYou: false,
            topTen: false,
            popularClubs: false,
            popularPersons: false,
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  return (
    <>
      {/* ✅ Skip link — позволяет клавиатурным пользователям сразу перейти к контенту */}
      <a href="#main-content" className="skip-link">
        Перейти к основному контенту
      </a>

      <Hero />

      {/* ✅ <main> — главный ориентир для скринридеров */}
      <div id="main-content" tabIndex={-1}>
        {loading.onAir ? (
          <LoadingPlaceholder title="Сейчас в эфире" sectionId={onAirId} />
        ) : (
          <HorizontalScroll title="Сейчас в эфире" items={onAirMovies} sectionId={onAirId} />
        )}

        {loading.forYou ? (
          <LoadingPlaceholder title="Для вас" sectionId={forYouId} />
        ) : (
          <HorizontalScroll title="Для вас" items={forYouMovies} sectionId={forYouId} />
        )}

        {loading.popularClubs ? (
          <ClubsLoadingPlaceholder sectionId={clubsId} />
        ) : (
          <PopularClubs clubs={popularClubs} sectionId={clubsId} />
        )}

        {loading.popularPersons ? (
          <PersonsLoadingPlaceholder sectionId={personsId} />
        ) : (
          <PopularPersons persons={popularPersons} sectionId={personsId} />
        )}

        {loading.topTen ? (
          <TopTenLoadingPlaceholder sectionId={topTenId} subtitleId={topTenSubtitleId} />
        ) : (
          <TopTen items={topTenMovies} sectionId={topTenId} subtitleId={topTenSubtitleId} />
        )}
      </div>
    </>
  );
}

export default Home;