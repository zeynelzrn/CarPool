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
    <div className="bg-gray-50 font-sans selection:bg-[#004225] selection:text-white flex flex-col">
      
      {/* --- 1. ÜST HERO ALANI --- */}
      <div className="relative h-72 w-full bg-[#004225] overflow-hidden">
        {/* Dekoratif Efektler */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>

        {/* Başlık Alanı */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-16 text-center">
          
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md mb-2 flex items-center gap-3">
            <SearchIcon className="w-10 h-10 text-emerald-300" />
            Yolculuk Ara
          </h1>
          <p className="text-emerald-100 text-lg font-medium">
            Sana en uygun rotayı bul ve hemen yerini ayırt.
          </p>
        </div>
      </div>

      {/* --- 2. YÜZEN ARAMA PANELİ (Floating Search Bar) --- */}
      <div className="container mx-auto px-4 relative z-20 -mt-24">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100">
          
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 items-end">
              
              {/* Nereden */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <LocationIcon className="w-4 h-4 text-[#004225]" /> Nereden
                </label>
                <input
                  type="text"
                  name="origin"
                  value={filters.origin}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all font-medium text-gray-900"
                  placeholder="Şehir..."
                />
              </div>

              {/* Nereye */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <LocationIcon className="w-4 h-4 text-[#004225]" /> Nereye
                </label>
                <input
                  type="text"
                  name="destination"
                  value={filters.destination}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all font-medium text-gray-900"
                  placeholder="Şehir..."
                />
              </div>

              {/* Tarih */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#004225]" /> Tarih
                </label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all font-medium text-gray-900"
                />
              </div>

              {/* Max Fiyat */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-2">
                  <MoneyIcon className="w-4 h-4 text-[#004225]" /> Max Fiyat
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all font-medium text-gray-900"
                  placeholder="₺ Limit"
                />
              </div>

              {/* Sıralama & Buton (Hizalama için flex container) */}
              <div className="flex gap-2">
                 {/* Sırala - Küçük Select */}
                <div className="w-1/2">
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Sırala</label>
                   <select
                    name="sortBy"
                    value={filters.sortBy}
                    onChange={handleFilterChange}
                    className="w-full px-2 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#004225] text-sm font-medium"
                  >
                    <option value="date">Tarih</option>
                    <option value="price">Fiyat</option>
                  </select>
                </div>

                {/* Ara Butonu */}
                <button
                  type="submit"
                  className="w-1/2 bg-[#004225] text-white rounded-xl hover:bg-[#00331b] hover:shadow-lg transition-all duration-300 transform active:scale-95 flex items-center justify-center h-[46px] self-end mb-[1px]" // h-[46px] input yüksekliğine denk gelmesi için
                >
                  <SearchIcon className="w-6 h-6" />
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>

      {/* --- 3. LİSTELEME ALANI --- */}
      <div className="container mx-auto px-4 mt-12 pb-24">
        
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#004225]"></div>
            <p className="text-gray-500 mt-4 font-medium">Yolculuklar taranıyor...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="text-6xl mb-4">🛣️</div>
            <h3 className="text-xl font-bold text-gray-900">Henüz bir yolculuk bulunamadı.</h3>
            <p className="text-gray-500 mt-2">Arama kriterlerini değiştirerek tekrar deneyebilirsin.</p>
          </div>
        ) : (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {rides.map((ride) => (
              <Link
                key={ride._id}
                to={`/rides/${ride._id}`}
                className="group relative bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#004225]/30 transition-all duration-300 transform hover:-translate-y-1 block"
              >
                {/* Sol Yeşil Çizgi Dekoru */}
                <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#004225] rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                  
                  {/* Sol Taraf: Rota ve Sürücü Bilgisi */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {new Date(ride.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {new Date(ride.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#004225] transition-colors mb-4 flex flex-wrap items-center gap-2">
                      {ride.origin} 
                      <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      {ride.destination}
                    </h3>

                    <div className="flex items-center gap-4">
                      {/* Sürücü Bilgisi */}
                      <div className="flex items-center gap-2">
                         {/* Avatar Placeholder */}
                        <div className="w-8 h-8 rounded-full bg-[#004225]/10 flex items-center justify-center text-[#004225] font-bold text-xs">
                            {ride.driver?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-700">{ride.driver.username}</span>
                            {/* Rating Display */}
                            <div onClick={(e) => e.preventDefault()}>
                                <RatingDisplay
                                    userId={ride.driver._id}
                                    userName={ride.driver.username}
                                    compact={true}
                                />
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Taraf: Fiyat ve Koltuk */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 mt-2 md:mt-0">
                    
                    <div className="text-right">
                      <p className="text-3xl font-bold text-[#004225]">
                        {ride.price} ₺
                      </p>
                      <p className="text-xs text-gray-400 font-medium">yolcu başına</p>
                    </div>

                    <div className="mt-2 md:mt-4 flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                       <div className={`w-2 h-2 rounded-full ${ride.availableSeats > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                       <span className="text-sm font-semibold text-emerald-800">
                         {ride.availableSeats} koltuk boş
                       </span>
                    </div>

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