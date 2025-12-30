import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CarSolidIcon, PlusIcon, ListIcon, SearchIcon, TicketIcon, UserIcon } from './Icons';

const Navbar = () => {
  const { isAuthenticated, user, logout, isDriver, isPassenger } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-xl sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform">
            <CarSolidIcon className="w-8 h-8 text-white" />
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              CarPool
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/" className="hover:text-blue-200 transition-colors font-medium">
                  Ana Sayfa
                </Link>

                {isDriver && (
                  <>
                    <Link to="/create-ride" className="hover:text-blue-200 transition-colors font-medium flex items-center gap-1.5">
                      <PlusIcon className="w-4 h-4" />
                      <span>İlan Oluştur</span>
                    </Link>
                    <Link to="/my-rides" className="hover:text-blue-200 transition-colors font-medium flex items-center gap-1.5">
                      <ListIcon className="w-4 h-4" />
                      <span>İlanlarım</span>
                    </Link>
                  </>
                )}

                {isPassenger && (
                  <>
                    <Link to="/rides" className="hover:text-blue-200 transition-colors font-medium flex items-center gap-1.5">
                      <SearchIcon className="w-4 h-4" />
                      <span>Yolculuk Ara</span>
                    </Link>
                    <Link to="/my-bookings" className="hover:text-blue-200 transition-colors font-medium flex items-center gap-1.5">
                      <TicketIcon className="w-4 h-4" />
                      <span>Rezervasyonlarım</span>
                    </Link>
                  </>
                )}

                <div className="flex items-center gap-4 pl-4 border-l border-blue-400">
                  <Link
                    to={`/profile/${user._id}`}
                    className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {user.username}
                    </span>
                    <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full">
                      {user.role === 'driver' ? 'Sürücü' : 'Yolcu'}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all hover:shadow-lg font-medium"
                  >
                    Çıkış
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/rides" className="hover:text-blue-200 transition-colors font-medium">
                  Yolculuklar
                </Link>
                <Link
                  to="/login"
                  className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all font-medium"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-all hover:shadow-lg font-medium"
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
