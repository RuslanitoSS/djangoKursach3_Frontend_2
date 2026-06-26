
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="social-links">
          <a href="#" className="social-icon">VK</a>
          <a href="#" className="social-icon">TG</a>
          <a href="#" className="social-icon">YT</a>
          <a href="#" className="social-icon">OK</a>
        </div>
        <p className="footer-text">Мы всегда готовы вам помочь.</p>
        <button className="help-btn">Задать вопрос</button>
        <div className="footer-bottom">
          <div className="copyright">
            <p>© 2003-2024 Не_Кинопоиск. 18+</p>
            <p className="humor-text">
              Пусть мне твердят идёт война, всюду боль и насилие.<br />
              Моя жизнь полным-полна, кругом люди красивые.<br />
              В стиле сома чилю дома, как в аквариуме сом.<br />
              Нет больше драмы, мама, жизнь моя как сладкий сом.
            </p>
          </div>
          <p className="company-info">Проект компании Сома-кола</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

/* import { useState, useEffect } from 'react';
import api from '../api/axios';


const CACHE_KEY = 'company_settings';
const CACHE_TTL = 5 * 60 * 1000; // 5 минут в миллисекундах

function Footer() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        // Проверяем кэш в sessionStorage
        const cached = sessionStorage.getItem(CACHE_KEY);
        
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const now = Date.now();
          
          // Если кэш свежий (меньше 5 минут) — используем его
          if (now - timestamp < CACHE_TTL) {
            setSettings(data);
            setLoading(false);
            return;
          }
          
          // Иначе удаляем устаревший кэш
          sessionStorage.removeItem(CACHE_KEY);
        }

        // Делаем запрос к API
        const response = await api.get('/company-settings/');
        const settingsData = response.data;
        
        // Сохраняем в кэш с timestamp
        sessionStorage.setItem(
          CACHE_KEY, 
          JSON.stringify({
            data: settingsData,
            timestamp: Date.now(),
          })
        );
        
        setSettings(settingsData);
      } catch (error) {
        console.error('Ошибка загрузки настроек компании:', error);
        // Устанавливаем дефолтные значения при ошибке
        setSettings({
          company_name: 'Сома-кола',
          copyright_text: '© 2003-2024 Не_Кинопоиск',
          age_rating: '18+',
          support_text: 'Мы всегда готовы вам помочь.',
          support_button_text: 'Задать вопрос',
          social_links: {
            vk: '',
            telegram: '',
            youtube: '',
            ok: '',
          },
          footer_poem: '',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanySettings();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="social-links">
          {settings.social_links?.vk && (
            <a href={settings.social_links.vk} className="social-icon" target="_blank" rel="noopener noreferrer">VK</a>
          )}
          {settings.social_links?.telegram && (
            <a href={settings.social_links.telegram} className="social-icon" target="_blank" rel="noopener noreferrer">TG</a>
          )}
          {settings.social_links?.youtube && (
            <a href={settings.social_links.youtube} className="social-icon" target="_blank" rel="noopener noreferrer">YT</a>
          )}
          {settings.social_links?.ok && (
            <a href={settings.social_links.ok} className="social-icon" target="_blank" rel="noopener noreferrer">OK</a>
          )}
        </div>
        <p className="footer-text">{settings.support_text}</p>
        <button className="help-btn">{settings.support_button_text}</button>
        <div className="footer-bottom">
          <div className="copyright">
            <p>{settings.copyright_text}. {settings.age_rating}</p>
            {settings.footer_poem && (
              <p className="humor-text">{settings.footer_poem}</p>
            )}
          </div>
          <p className="company-info">Проект компании {settings.company_name}</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; */