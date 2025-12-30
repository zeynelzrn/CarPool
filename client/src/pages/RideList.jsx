import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { rideService } from '../services/rideService';
import RatingDisplay from '../components/RatingDisplay';
import { SearchIcon, LocationIcon, CalendarIcon, MoneyIcon } from '../components/Icons';

const RideList = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    origin: '',
    destination: '',
    date: '',
    maxPrice: '',
    sortBy: 'date', // date, price
  });

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async (searchFilters = {}) => {
    try {
      setLoading(true);
      const data = await rideService.getRides(searchFilters);
      
      // Frontend'de fiyat filtresi ve sıralama
      let filteredData = [...data];
      
      if (searchFilters.maxPrice) {
        filteredData = filteredData.filter(ride => ride.price <= Number(searchFilters.maxPrice));
      }
      
      // Sıralama
      if (searchFilters.sortBy === 'price') {
        filteredData.sort((a, b) => a.price - b.price);
      } else if (searchFilters.sortBy === 'date') {
        filteredData.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      
      setRides(filteredData);
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
    <div className="min-h-screen relative py-8">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2021&q=80)',
        }}
      ></div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <SearchIcon className="w-10 h-10 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-800">
              Yolculuk Ara
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Size uygun yolculuğu bulun</p>
        </div>

        <form onSubmit={handleSearch} className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-xl mb-8 border border-gray-200">
          <div className="grid md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <LocationIcon className="w-4 h-4 text-blue-600" />
                Nereden
              </label>
              <input
                type="text"
                name="origin"
                value={filters.origin}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Şehir adı"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <LocationIcon className="w-4 h-4 text-blue-600" />
                Nereye
              </label>
              <input
                type="text"
                name="destination"
                value={filters.destination}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Şehir adı"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                Tarih
              </label>
              <input
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MoneyIcon className="w-4 h-4 text-blue-600" />
                Max Fiyat (₺)
              </label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                min="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sırala
              </label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
              >
                <option value="date">Tarihe Göre</option>
                <option value="price">Fiyata Göre</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-semibold text-lg flex items-center justify-center gap-2"
          >
            <SearchIcon className="w-5 h-5" />
            Ara
          </button>
        </form>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Yükleniyor...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-12 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200">
            <p className="text-gray-600 text-lg">Henüz yolculuk ilanı bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {rides.map((ride) => (
              <Link
                key={ride._id}
                to={`/rides/${ride._id}`}
                className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 border border-gray-200 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {ride.origin} → {ride.destination}
                      </h3>
                    </div>
                    <div className="text-gray-600 space-y-2">
                      <div>
                        <p className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Sürücü:</span> {ride.driver.username}
                        </p>
                        {ride.driver && ride.driver._id && (
                          <div onClick={(e) => e.stopPropagation()} className="ml-0">
                            <RatingDisplay
                              userId={ride.driver._id}
                              userName={ride.driver.username}
                              compact={true}
                            />
                          </div>
                        )}
                      </div>
                      <p className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">Tarih:</span> {new Date(ride.date).toLocaleString('tr-TR')}
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-semibold">Müsait Koltuk:</span> 
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm font-bold">
                          {ride.availableSeats} / {ride.totalSeats}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {ride.price} ₺
                    </p>
                    <p className="text-sm text-gray-500 mt-1">kişi başı</p>
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
