import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CarSolidIcon, PlusIcon, ListIcon, SearchIcon, TicketIcon, ShieldIcon, MoneyIcon, LightningIcon } from '../components/Icons';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-purple-900/80"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-white/20 backdrop-blur-md p-6 rounded-full shadow-2xl">
              <CarSolidIcon className="w-20 h-20 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Araç Paylaşım Platformu
          </h1>
          <p className="text-xl text-white/90 mb-12 font-medium drop-shadow-md">
            Güvenli ve ekonomik yolculuklar için doğru adres
          </p>

          {isAuthenticated ? (
            <div className="space-y-6">
              <p className="text-2xl text-white drop-shadow-md">
                Hoş geldin, <span className="font-bold text-yellow-300">{user.username}</span>
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                {user.role === 'driver' ? (
                  <>
                    <Link
                      to="/create-ride"
                      className="bg-white/90 backdrop-blur-sm text-blue-700 px-8 py-4 rounded-xl hover:bg-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg flex items-center gap-2"
                    >
                      <PlusIcon className="w-5 h-5" />
                      Yolculuk İlanı Oluştur
                    </Link>
                    <Link
                      to="/my-rides"
                      className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-xl hover:bg-white/30 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg flex items-center gap-2"
                    >
                      <ListIcon className="w-5 h-5" />
                      İlanlarım
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/rides"
                      className="bg-white/90 backdrop-blur-sm text-blue-700 px-8 py-4 rounded-xl hover:bg-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg flex items-center gap-2"
                    >
                      <SearchIcon className="w-5 h-5" />
                      Yolculuk Ara
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-xl hover:bg-white/30 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg flex items-center gap-2"
                    >
                      <TicketIcon className="w-5 h-5" />
                      Rezervasyonlarım
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/login"
                className="bg-white/90 backdrop-blur-sm text-blue-700 px-8 py-4 rounded-xl hover:bg-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg"
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="bg-green-500/90 backdrop-blur-sm text-white px-8 py-4 rounded-xl hover:bg-green-500 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-white/20">
            <div className="mb-4 text-blue-600">
              <ShieldIcon className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">Güvenli</h3>
            <p className="text-gray-600 leading-relaxed">
              Tüm kullanıcılar doğrulanmış hesaplarla güvenli yolculuklar yapıyor
            </p>
          </div>
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-white/20">
            <div className="mb-4 text-green-600">
              <MoneyIcon className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">Ekonomik</h3>
            <p className="text-gray-600 leading-relaxed">
              Yakıt maliyetlerini paylaşarak bütçenize katkı sağlayın
            </p>
          </div>
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-white/20">
            <div className="mb-4 text-yellow-600">
              <LightningIcon className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">Kolay</h3>
            <p className="text-gray-600 leading-relaxed">
              Birkaç tıkla yolculuğunuzu bulun veya ilan verin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
