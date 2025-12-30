import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideService } from '../services/rideService';
import { PlusIcon, LocationIcon, CalendarIcon, MoneyIcon } from '../components/Icons';

const CITIES = {
  'İstanbul': { lat: 41.0082, lng: 28.9784 },
  'Ankara': { lat: 39.9334, lng: 32.8597 },
  'İzmir': { lat: 38.4237, lng: 27.1428 },
  'Bursa': { lat: 40.1826, lng: 29.0665 },
  'Antalya': { lat: 36.8969, lng: 30.7133 },
  'Adana': { lat: 37.0000, lng: 35.3213 },
  'Gaziantep': { lat: 37.0662, lng: 37.3833 },
  'Konya': { lat: 37.8746, lng: 32.4932 },
  'Kayseri': { lat: 38.7205, lng: 35.4826 },
  'Eskişehir': { lat: 39.7767, lng: 30.5206 },
};

const CreateRide = () => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    price: '',
    totalSeats: '',
    carBrand: '',
    carModel: '',
    carYear: '',
    carColor: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const originCoords = CITIES[formData.origin];
      const destCoords = CITIES[formData.destination];

      if (!originCoords || !destCoords) {
        setError('Lütfen geçerli şehirler seçin');
        setLoading(false);
        return;
      }

      const rideData = {
        origin: formData.origin,
        destination: formData.destination,
        date: formData.date,
        price: Number(formData.price),
        totalSeats: Number(formData.totalSeats),
        coordinates: {
          startLat: originCoords.lat,
          startLng: originCoords.lng,
          endLat: destCoords.lat,
          endLng: destCoords.lng,
        },
        carInfo: {
          brand: formData.carBrand,
          model: formData.carModel,
          year: formData.carYear ? Number(formData.carYear) : undefined,
          color: formData.carColor,
        },
      };

      await rideService.createRide(rideData);
      navigate('/my-rides');
    } catch (err) {
      setError(err.response?.data?.message || 'İlan oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative py-8">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)',
        }}
      ></div>

      <div className="relative z-10 container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <PlusIcon className="w-10 h-10 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-800">
              Yolculuk İlanı Oluştur
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Yolculuğunuzu paylaşın</p>
        </div>

        <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-200">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-6 animate-pulse">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <LocationIcon className="w-4 h-4 text-blue-600" />
                Nereden
              </label>
              <select
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="">Şehir Seçin</option>
                {Object.keys(CITIES).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <LocationIcon className="w-4 h-4 text-blue-600" />
                Nereye
              </label>
              <select
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="">Şehir Seçin</option>
                {Object.keys(CITIES).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                Tarih ve Saat
              </label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MoneyIcon className="w-4 h-4 text-blue-600" />
                Fiyat (Kişi Başı - ₺)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Toplam Koltuk Sayısı
              </label>
              <input
                type="number"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                required
                min="1"
                max="8"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="4"
              />
            </div>

            <div className="border-t-2 border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Araç Bilgileri (İsteğe Bağlı)</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Marka
                  </label>
                  <input
                    type="text"
                    name="carBrand"
                    value={formData.carBrand}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Örn: Toyota"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    name="carModel"
                    value={formData.carModel}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Örn: Corolla"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Yıl
                  </label>
                  <input
                    type="number"
                    name="carYear"
                    value={formData.carYear}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Örn: 2020"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Renk
                  </label>
                  <input
                    type="text"
                    name="carColor"
                    value={formData.carColor}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Örn: Beyaz"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
            >
              {loading ? 'Oluşturuluyor...' : 'İlan Oluştur'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRide;
