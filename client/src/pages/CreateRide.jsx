import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideService } from '../services/rideService';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Yolculuk İlanı Oluştur
        </h1>

        <div className="bg-white p-8 rounded-lg shadow-md">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nereden
              </label>
              <select
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Şehir Seçin</option>
                {Object.keys(CITIES).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nereye
              </label>
              <select
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Şehir Seçin</option>
                {Object.keys(CITIES).map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarih ve Saat
              </label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat (Kişi Başı - ₺)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="4"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-blue-300"
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
