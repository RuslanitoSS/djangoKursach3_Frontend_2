import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Home from '../pages//Home/Home';
import BrowsePage from '../pages/BrowsePage/BrowsePage';
import WatchPage from '../pages/WatchPage';
import NotFound from '../pages/NotFound';
import ClubsSearch from '../pages/ClubsSearch/ClubsSearch';

function AppRouter() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/watch/:id" element={<WatchPage />} />
          
            <Route path="/profile" element={<Home />} />
            <Route path="/clubs/search" element={<ClubsSearch />} />
          
              <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default AppRouter;