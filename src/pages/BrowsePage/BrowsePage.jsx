import { useState } from 'react';
import './BrowsePage.css';
import HorizontalScroll from '../../components/HorizontalScroll';

// Mock data для примера
const mockMovies = [
  { id: 1, title: 'Нераскрытое дело', image: 'https://via.placeholder.com/300x450', year: 2024, rating: 7.8 },
  { id: 2, title: '13 Клиническая', image: 'https://via.placeholder.com/300x450', year: 2023, rating: 8.5 },
  { id: 3, title: 'Фишер', image: 'https://via.placeholder.com/300x450', year: 2024, rating: 9.1 },
  { id: 4, title: 'Кракен', image: 'https://via.placeholder.com/300x450', year: 2023, rating: 8.7 },
  { id: 5, title: 'Беспринципные', image: 'https://via.placeholder.com/300x450', year: 2022, rating: 8.9 },
];

const filterOptions = {
  genres: ['Боевик', 'Комедия', 'Драма', 'Ужасы', 'Фантастика', 'Детектив'],
  subgenres: ['Приключения', 'Триллер', 'Криминал', 'Мелодрама'],
  countries: ['Россия', 'США', 'Великобритания', 'Франция', 'Германия'],
  years: [2024, 2023, 2022, 2021, 2020, 2019, 2018],
  ratings: ['9+', '8+', '7+', '6+', '5+']
};

function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    genre: '',
    subgenre: '',
    country: '',
    year: '',
    rating: ''
  });
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
    setOpenDropdown(null);
  };

  const clearFilters = () => {
    setActiveFilters({
      genre: '',
      subgenre: '',
      country: '',
      year: '',
      rating: ''
    });
    setSearchQuery('');
  };

  const hasActiveFilters = Object.values(activeFilters).some(val => val !== '') || searchQuery;

  return (
    <div className="browse-page">
      {/* Заголовок */}
      <div className="browse-header">
        <h1 className="browse-title">Фильмы смотреть онлайн</h1>
      </div>

      {/* Поисковая строка */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Фильмы и сериалы"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="search-clear" 
              onClick={() => setSearchQuery('')}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Фильтры */}
      <div className="filters-section">
        <div className="filters-container">
          {/* Жанры */}
          <div className="filter-dropdown">
            <button 
              className={`filter-btn ${activeFilters.genre ? 'active' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'genre' ? null : 'genre')}
            >
              Жанры
              <span className="filter-arrow">▼</span>
            </button>
            {openDropdown === 'genre' && (
              <div className="filter-menu">
                <button 
                  className={`filter-menu-item ${!activeFilters.genre ? 'active' : ''}`}
                  onClick={() => handleFilterChange('genre', '')}
                >
                  Все жанры
                </button>
                {filterOptions.genres.map(genre => (
                  <button
                    key={genre}
                    className={`filter-menu-item ${activeFilters.genre === genre ? 'active' : ''}`}
                    onClick={() => handleFilterChange('genre', genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Поджанры */}
          <div className="filter-dropdown">
            <button 
              className={`filter-btn ${activeFilters.subgenre ? 'active' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'subgenre' ? null : 'subgenre')}
            >
              Поджанры
              <span className="filter-arrow">▼</span>
            </button>
            {openDropdown === 'subgenre' && (
              <div className="filter-menu">
                <button 
                  className={`filter-menu-item ${!activeFilters.subgenre ? 'active' : ''}`}
                  onClick={() => handleFilterChange('subgenre', '')}
                >
                  Все поджанры
                </button>
                {filterOptions.subgenres.map(subgenre => (
                  <button
                    key={subgenre}
                    className={`filter-menu-item ${activeFilters.subgenre === subgenre ? 'active' : ''}`}
                    onClick={() => handleFilterChange('subgenre', subgenre)}
                  >
                    {subgenre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Страны */}
          <div className="filter-dropdown">
            <button 
              className={`filter-btn ${activeFilters.country ? 'active' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'country' ? null : 'country')}
            >
              Страны
              <span className="filter-arrow">▼</span>
            </button>
            {openDropdown === 'country' && (
              <div className="filter-menu">
                <button 
                  className={`filter-menu-item ${!activeFilters.country ? 'active' : ''}`}
                  onClick={() => handleFilterChange('country', '')}
                >
                  Все страны
                </button>
                {filterOptions.countries.map(country => (
                  <button
                    key={country}
                    className={`filter-menu-item ${activeFilters.country === country ? 'active' : ''}`}
                    onClick={() => handleFilterChange('country', country)}
                  >
                    {country}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Годы */}
          <div className="filter-dropdown">
            <button 
              className={`filter-btn ${activeFilters.year ? 'active' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
            >
              Годы
              <span className="filter-arrow">▼</span>
            </button>
            {openDropdown === 'year' && (
              <div className="filter-menu">
                <button 
                  className={`filter-menu-item ${!activeFilters.year ? 'active' : ''}`}
                  onClick={() => handleFilterChange('year', '')}
                >
                  Все годы
                </button>
                {filterOptions.years.map(year => (
                  <button
                    key={year}
                    className={`filter-menu-item ${activeFilters.year === year ? 'active' : ''}`}
                    onClick={() => handleFilterChange('year', year.toString())}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Рейтинг */}
          <div className="filter-dropdown">
            <button 
              className={`filter-btn ${activeFilters.rating ? 'active' : ''}`}
              onClick={() => setOpenDropdown(openDropdown === 'rating' ? null : 'rating')}
            >
              Рейтинг
              <span className="filter-arrow">▼</span>
            </button>
            {openDropdown === 'rating' && (
              <div className="filter-menu">
                <button 
                  className={`filter-menu-item ${!activeFilters.rating ? 'active' : ''}`}
                  onClick={() => handleFilterChange('rating', '')}
                >
                  Любой рейтинг
                </button>
                {filterOptions.ratings.map(rating => (
                  <button
                    key={rating}
                    className={`filter-menu-item ${activeFilters.rating === rating ? 'active' : ''}`}
                    onClick={() => handleFilterChange('rating', rating)}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Кнопка сброса фильтров */}
        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearFilters}>
            Сбросить фильтры
          </button>
        )}
      </div>

      {/* Результаты поиска */}
      {hasActiveFilters && (
        <HorizontalScroll 
          title="Результат поиска"
          items={mockMovies}
        />
      )}

      {/* Популярные */}
      <HorizontalScroll 
        title="Популярные"
        items={mockMovies}
      />
    </div>
  );
}

export default BrowsePage;