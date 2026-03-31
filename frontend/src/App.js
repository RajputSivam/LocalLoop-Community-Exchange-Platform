import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import CreateListingPage from './pages/CreateListingPage';
import CreateServicePage from './pages/CreateServicePage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import WalletPage from './pages/WalletPage';
import BorrowRequestPage from './pages/BorrowRequestPage';
import DisputePage from './pages/DisputePage';
import NotificationsPage from './pages/NotificationsPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/:id" element={<ListingDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id" element={<ServiceDetailPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/create-listing" element={<PrivateRoute><CreateListingPage /></PrivateRoute>} />
          <Route path="/create-service" element={<PrivateRoute><CreateServicePage /></PrivateRoute>} />
          <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
          <Route path="/messages/:chatId" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
          <Route path="/wallet" element={<PrivateRoute><WalletPage /></PrivateRoute>} />
          <Route path="/borrow/:id" element={<PrivateRoute><BorrowRequestPage /></PrivateRoute>} />
          <Route path="/disputes" element={<PrivateRoute><DisputePage /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
