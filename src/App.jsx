import AppRouter from './router/AppRouter';
import './App.css';
import { AuthProvider } from './context/Auth.provider';

function App() {
  return (
  <AuthProvider>
    <AppRouter />;
  </AuthProvider>
  )
}

export default App;