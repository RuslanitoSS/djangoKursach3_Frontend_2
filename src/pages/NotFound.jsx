import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="content-section" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1 style={{ fontSize: '64px', marginBottom: '20px' }}>404</h1>
      <p style={{ color: '#888', marginBottom: '30px' }}>Страница не найдена</p>
      <button 
        onClick={() => navigate('/')} 
        className="cta-button"
      >
        На главную
      </button>
    </div>
  );
}

export default NotFound;