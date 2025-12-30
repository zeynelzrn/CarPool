import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Araç Paylaşım Platformu
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Güvenli ve ekonomik yolculuklar için doğru adres
          </p>

          {isAuthenticated ? (
            <div className="space-y-4">
              <p className="text-lg text-gray-700">
                Hoş geldin, <span className="font-semibold">{user.username}</span>!
              </p>
              <div className="flex gap-4 justify-center">
                {user.role === 'driver' ? (
                  <>
                    <Link
                      to="/create-ride"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                      Yolculuk İlanı Oluştur
                    </Link>
                    <Link
                      to="/my-rides"
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                    >
                      İlanlarım
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/rides"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                      Yolculuk Ara
                    </Link>
                    <Link
                      to="/my-bookings"
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                    >
                      Rezervasyonlarım
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-4 justify-center">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition text-lg"
              >
                Giriş Yap
              </Link>
              <Link
                to="/register"
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition text-lg"
              >
                Kayıt Ol
              </Link>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Güvenli</h3>
            <p className="text-gray-600">
              Tüm kullanıcılar doğrulanmış hesaplarla güvenli yolculuklar yapıyor
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Ekonomik</h3>
            <p className="text-gray-600">
              Yakıt maliyetlerini paylaşarak bütçenize katkı sağlayın
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Kolay</h3>
            <p className="text-gray-600">
              Birkaç tıkla yolculuğunuzu bulun veya ilan verin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
