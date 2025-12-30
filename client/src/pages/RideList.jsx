import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rideService } from '../services/rideService';

const RideList = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    date: '',
  });

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async (searchFilters = {}) => {
    try {
      setLoading(true);
      const data = await rideService.getRides(searchFilters);
      setRides(data);
    } catch (error) {
      console.error('Yolculuklar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRides(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Yolculuk Ara
        </h1>

        <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nereden
              </label>
              <input
                type="text"
                name="origin"
                value={filters.origin}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Şehir adı"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nereye
              </label>
              <input
                type="text"
                name="destination"
                value={filters.destination}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Şehir adı"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarih
              </label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
              >
                Ara
              </button>
            </div>
          </div>
        </form>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">Henüz yolculuk ilanı bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {rides.map((ride) => (
              <Link
                key={ride._id}
                to={`/rides/${ride._id}`}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {ride.origin} → {ride.destination}
                      </h3>
                    </div>
                    <div className="text-gray-600 space-y-1">
                      <p>Sürücü: {ride.driver.username}</p>
                      <p>Tarih: {new Date(ride.date).toLocaleDateString('tr-TR')}</p>
                      <p>Müsait Koltuk: {ride.availableSeats}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{ride.price} ₺</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RideList;
