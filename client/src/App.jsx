import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RideList from './pages/RideList';
import RideDetail from './pages/RideDetail';
import CreateRide from './pages/CreateRide';
import MyRides from './pages/MyRides';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';

const ProtectedRoute = ({ children, requireDriver, requirePassenger }) => {
  const { isAuthenticated, isDriver, isPassenger, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireDriver && !isDriver) {
    return <Navigate to="/" />;
  }

  if (requirePassenger && !isPassenger) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <ScrollToTop />
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/rides" element={<RideList />} />
          <Route path="/rides/:id" element={<RideDetail />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route
            path="/edit-profile"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-ride"
            element={
              <ProtectedRoute requireDriver>
                <CreateRide />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-rides"
            element={
              <ProtectedRoute requireDriver>
                <MyRides />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute requirePassenger>
                <MyBookings />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
