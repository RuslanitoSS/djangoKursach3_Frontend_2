import Hero from './Hero';
import HorizontalScroll from '../../components/HorizontalScroll';
import TopTen from './TopTen';
import PopularClubs from '../../components/PopularClubs/PopularClubs';

const mockMovies = [
  { id: 1, title: 'Thor: Love and Thunder', image: 'https://via.placeholder.com/300x450', rating: 8.5 },
  { id: 2, title: 'Нераскрытое дело', image: 'https://via.placeholder.com/300x450', rating: 7.8 },
  { id: 3, title: 'Фишер', image: 'https://via.placeholder.com/300x450', rating: 9.1 },
  { id: 4, title: 'Кракен', image: 'https://via.placeholder.com/300x450', rating: 8.7 },
  { id: 5, title: 'Беспринципные', image: 'https://via.placeholder.com/300x450', rating: 8.9 },
];
function Home() {
  return (
    <>
      <Hero />
      <HorizontalScroll title="Сейчас в эфире" items={mockMovies} />
      <HorizontalScroll title="Сериалы для вас" items={mockMovies} />
      <PopularClubs />
      <HorizontalScroll title="Продолжить просмотр" items={mockMovies} />
      <HorizontalScroll title="Фильмы для вас" items={mockMovies} />
      <TopTen />
    </>
  );
}

export default Home;