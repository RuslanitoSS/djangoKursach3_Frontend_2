import { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios';
import './AdminCompany.css';
import { Link } from 'react-router-dom';

// 🔧 Полифилл useId
let counter = 0;
const useId = () => {
  const ref = useRef(null);
  if (ref.current === null) {
    counter += 1;
    ref.current = `company-settings-${counter}`;
  }
  return ref.current;
};

function AdminCompany() {
  const pageId = useId();

  const [settings, setSettings] = useState({
    company_name: '',
    copyright_text: '',
    age_rating: '18+',
    support_text: '',
    support_button_text: '',
    footer_poem: '',
    social_links: {
      vk: '',
      telegram: '',
      youtube: '',
      ok: '',
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState('');
  const [error, setError] = useState('');

  // 🔥 Загрузка настроек
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await api.get('admin/company-settings/');
        setSettings(response.data);
      } catch (err) {
        console.error('❌ Ошибка загрузки настроек:', err);
        setError('Не удалось загрузить настройки компании');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(''), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes('social_')) {
      const socialKey = name.replace('social_', '');
      setSettings(prev => ({
        ...prev,
        social_links: {
          ...prev.social_links,
          [socialKey]: value,
        },
      }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.patch('admin/company-settings/', settings);
      showNotification('Настройки компании сохранены');
    } catch (err) {
      console.error('❌ Ошибка сохранения:', err);
      setError(err.response?.data?.detail || 'Не удалось сохранить настройки');
      showNotification('Ошибка сохранения', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="company-settings-loading">
        <div className="spinner"></div>
        <p>Загрузка настроек...</p>
      </div>
    );
  }

  return (
    <div className="company-settings-page">
      <a href="#main-content" className="skip-link">
        Перейти к основному контенту
      </a>

      {notification && (
        <div
          className={`admin-notification ${notification.type || 'success'}`}
          role="alert"
        >
          {notification.message}
        </div>
      )}

      <header className="admin-header">
        <Link to="/admin" className="back-button">
          ← Назад
        </Link>
        <h1 id={`${pageId}-title`} className="admin-title">
          ⚙️ Настройки компании
        </h1>
        <p className="admin-subtitle">
          Общая информация о компании, контакты и футер сайта
        </p>
      </header>

      <main id="main-content" tabIndex={-1}>
        {error && (
          <div className="admin-error" role="alert">
            <span aria-hidden="true">⚠️ </span>
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="company-settings-form">

          {/* 🔥 Секция: Основная информация */}
          <fieldset className="form-section">
            <legend>Основная информация</legend>

            <div className="form-group">
              <label htmlFor="company_name">Название компании</label>
              <input
                id="company_name"
                name="company_name"
                type="text"
                value={settings.company_name}
                onChange={handleChange}
                placeholder="Например: Сома-кола"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="copyright_text">Текст копирайта</label>
              <input
                id="copyright_text"
                name="copyright_text"
                type="text"
                value={settings.copyright_text}
                onChange={handleChange}
                placeholder="Например: © 2003-2024 Не_Кинопоиск"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="age_rating">Возрастной рейтинг</label>
              <select
                id="age_rating"
                name="age_rating"
                value={settings.age_rating}
                onChange={handleChange}
              >
                <option value="0+">0+</option>
                <option value="6+">6+</option>
                <option value="12+">12+</option>
                <option value="16+">16+</option>
                <option value="18+">18+</option>
              </select>
            </div>
          </fieldset>

          {/* 🔥 Секция: Поддержка */}
          <fieldset className="form-section">
            <legend>Поддержка пользователей</legend>

            <div className="form-group">
              <label htmlFor="support_text">Текст поддержки</label>
              <input
                id="support_text"
                name="support_text"
                type="text"
                value={settings.support_text}
                onChange={handleChange}
                placeholder="Например: Мы всегда готовы вам помочь"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="support_button_text">Текст кнопки</label>
              <input
                id="support_button_text"
                name="support_button_text"
                type="text"
                value={settings.support_button_text}
                onChange={handleChange}
                placeholder="Например: Задать вопрос"
                required
              />
            </div>
          </fieldset>

          {/* 🔥 Секция: Социальные сети */}
          <fieldset className="form-section">
            <legend>Социальные сети</legend>
            <p className="form-hint">
              Укажите полные URL на ваши страницы в социальных сетях
            </p>

            <div className="social-links-grid">
              <div className="form-group">
                <label htmlFor="social_vk">
                  <span className="social-icon">VK</span> ВКонтакте
                </label>
                <input
                  id="social_vk"
                  name="social_vk"
                  type="url"
                  value={settings.social_links.vk}
                  onChange={handleChange}
                  placeholder="https://vk.com/yourpage"
                />
              </div>

              <div className="form-group">
                <label htmlFor="social_telegram">
                  <span className="social-icon">TG</span> Telegram
                </label>
                <input
                  id="social_telegram"
                  name="social_telegram"
                  type="url"
                  value={settings.social_links.telegram}
                  onChange={handleChange}
                  placeholder="https://t.me/yourchannel"
                />
              </div>

              <div className="form-group">
                <label htmlFor="social_youtube">
                  <span className="social-icon">YT</span> YouTube
                </label>
                <input
                  id="social_youtube"
                  name="social_youtube"
                  type="url"
                  value={settings.social_links.youtube}
                  onChange={handleChange}
                  placeholder="https://youtube.com/yourchannel"
                />
              </div>

              <div className="form-group">
                <label htmlFor="social_ok">
                  <span className="social-icon">OK</span> Одноклассники
                </label>
                <input
                  id="social_ok"
                  name="social_ok"
                  type="url"
                  value={settings.social_links.ok}
                  onChange={handleChange}
                  placeholder="https://ok.ru/yourgroup"
                />
              </div>
            </div>
          </fieldset>

          {/* 🔥 Секция: Поэма/текст в футере */}
          <fieldset className="form-section">
            <legend>Текст в футере (поэма)</legend>

            <div className="form-group">
              <label htmlFor="footer_poem">
                Текст, который будет отображаться в футере сайта
              </label>
              <textarea
                id="footer_poem"
                name="footer_poem"
                value={settings.footer_poem}
                onChange={handleChange}
                rows="6"
                placeholder="Введите текст построчно, каждая строка с новой строки"
              />
              <small className="form-hint">
                Каждая строка текста будет отображаться отдельно в футере
              </small>
            </div>
          </fieldset>

          {/* 🔥 Превью футера */}
          <fieldset className="form-section preview-section">
            <legend>Превью футера</legend>
            <div className="footer-preview">
              <div className="footer-preview-social">
                {settings.social_links.vk && (
                  <span className="preview-social-icon">VK</span>
                )}
                {settings.social_links.telegram && (
                  <span className="preview-social-icon">TG</span>
                )}
                {settings.social_links.youtube && (
                  <span className="preview-social-icon">YT</span>
                )}
                {settings.social_links.ok && (
                  <span className="preview-social-icon">OK</span>
                )}
              </div>

              {settings.support_text && (
                <p className="footer-preview-text">{settings.support_text}</p>
              )}

              {settings.support_button_text && (
                <button type="button" className="footer-preview-button">
                  {settings.support_button_text}
                </button>
              )}

              <div className="footer-preview-bottom">
                <p>
                  {settings.copyright_text} {settings.age_rating}
                </p>
                {settings.company_name && (
                  <p>Проект компании {settings.company_name}</p>
                )}
              </div>

              {settings.footer_poem && (
                <div className="footer-preview-poem">
                  {settings.footer_poem.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </fieldset>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-save"
              disabled={saving}
            >
              {saving ? 'Сохранение...' : '💾 Сохранить настройки'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AdminCompany;