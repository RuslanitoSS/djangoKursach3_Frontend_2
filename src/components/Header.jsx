import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Массив объектов: текст ссылки и маршрут
const navItems = [
  { label: 'Сериалы', path: '/browse' },
  { label: 'Фильмы', path: '/browse' },
  { label: 'Клубы', path: '/clubs/search' },
];

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <Link to="/" className="logo">Не_Кинопоиск</Link>
        
        <nav className="nav">
          {navItems.map((item) => (
            <Link 
              key={item.label} 
              to={item.path} 
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="header-actions">
          <Link to="/browse" className="icon-btn" aria-label="Поиск">
            🔍
          </Link>
          
          <Link to="/profile" className="icon-btn" aria-label="Профиль">
            👤
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;