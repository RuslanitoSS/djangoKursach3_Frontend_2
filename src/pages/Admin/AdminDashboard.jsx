import { Link } from 'react-router-dom';
import './AdminDashboard.css';

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <a href="#main-content" className="skip-link">
        Перейти к основному контенту
      </a>

      <header className="admin-header">
        <h1 className="admin-title">
          ⚙️ Панель администратора
        </h1>
        <p className="admin-subtitle">
          Управление контентом и пользователями сайта
        </p>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className="admin-sections" aria-label="Разделы администрирования">
          
          <Link to="/admin/users" className="admin-card users">
            <div className="card-icon" aria-hidden="true">👥</div>
            <h2 className="card-title">Пользователи</h2>
            <p className="card-description">
              Управление пользователями, ролями и правами доступа
            </p>
            <span className="card-link">Перейти →</span>
          </Link>

          <Link to="/admin/chapters" className="admin-card chapters">
            <div className="card-icon" aria-hidden="true">🎬</div>
            <h2 className="card-title">Фильмы и сериалы</h2>
            <p className="card-description">
              Управление каталогом контента, эпизодами и метаданными
            </p>
            <span className="card-link">Перейти →</span>
          </Link>

          <Link to="/admin/company" className="admin-card company">
            <div className="card-icon" aria-hidden="true">🏢</div>
            <h2 className="card-title">Настройки компании</h2>
            <p className="card-description">
              Общая информация, контакты и настройки футера сайта
            </p>
            <span className="card-link">Перейти →</span>
          </Link>

        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;