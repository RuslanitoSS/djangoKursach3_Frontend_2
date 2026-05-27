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