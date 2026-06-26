import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/Auth.provider';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Home from '../pages/Home/Home';
import BrowsePage from '../pages/BrowsePage/BrowsePage';
import WatchPage from '../pages/WatchPage';
import NotFound from '../pages/NotFound';
import ClubsSearch from '../pages/ClubsSearch/ClubsSearch';
import ClubDetail from '../pages/ClubDetail/ClubDetail'; // 👈 Добавьте
import ClubEdit from '../pages/ClubEdit/ClubEdit'; // 👈 Добавьте
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Profile from '../pages/Profile/Profile';
import ProtectedRoute from '../components/ProtectedRoute';
import ClubCreate from '../pages/ClubCreate/ClubCreate';
import AdminUsers from '../pages/Admin/Users/AdminUsers';
import AdminCompany from '../pages/Admin/Company/AdminCompany';
import AdminChapters from '../pages/Admin/Chapters/AdminChapters';
import AdminDashboard from '../pages/Admin/AdminDashboard';

function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/watch/:id" element={<WatchPage />} />
              <Route path="/clubs/create" element={
                <ProtectedRoute>
                  <ClubCreate />
                </ProtectedRoute>
              } />
              <Route path="/clubs/search" element={<ClubsSearch />} />
              <Route path="/clubs/:id" element={<ClubDetail />} /> {/* 👈 Добавьте */}
              <Route path="/clubs/:id/edit" element={
                <ProtectedRoute>
                  <ClubEdit />
                </ProtectedRoute>
              } /> {/* 👈 Добавьте */}

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/company" element={<AdminCompany />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/chapters" element={<AdminChapters />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default AppRouter;