import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout, isDriver, isPassenger } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold">
            Carpool
          </Link>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/" className="hover:text-blue-200 transition">
                  Ana Sayfa
                </Link>

                {isDriver && (
                  <>
                    <Link to="/create-ride" className="hover:text-blue-200 transition">
                      İlan Oluştur
                    </Link>
                    <Link to="/my-rides" className="hover:text-blue-200 transition">
                      İlanlarım
                    </Link>
                  </>
                )}

                {isPassenger && (
                  <>
                    <Link to="/rides" className="hover:text-blue-200 transition">
                      Yolculuk Ara
                    </Link>
                    <Link to="/my-bookings" className="hover:text-blue-200 transition">
                      Rezervasyonlarım
                    </Link>
                  </>
                )}

                <div className="flex items-center gap-4">
                  <span className="text-sm">
                    {user.username} ({user.role === 'driver' ? 'Sürücü' : 'Yolcu'})
                  </span>
                  <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition"
                  >
                    Çıkış
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/rides" className="hover:text-blue-200 transition">
                  Yolculuklar
                </Link>
                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 px-4 py-2 rounded hover:bg-green-600 transition"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
