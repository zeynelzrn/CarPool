import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rideService } from '../services/rideService';
import { PlusIcon, LocationIcon, CalendarIcon, MoneyIcon, CarSolidIcon } from '../components/Icons';

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
    carPlate: '',
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
        setError('Please select valid cities');
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
        carDetails: {
          brand: formData.carBrand,
          model: formData.carModel,
          year: formData.carYear ? Number(formData.carYear) : undefined,
          color: formData.carColor,
          plate: formData.carPlate,
        },
      };

      await rideService.createRide(rideData);
      navigate('/my-rides');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-[#004225] selection:text-white flex flex-col">
      
      {/* --- 1. ÜST HERO ALANI --- */}
      <div className="relative h-80 w-full bg-[#004225] overflow-hidden">
        {/* Dekoratif Efektler */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-20 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>

        {/* Başlık */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-16 text-center px-4">
           
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md mb-2 flex items-center gap-3">
              <PlusIcon className="w-10 h-10 text-emerald-300" />   
                Create New Ride
            </h1>
            <p className="text-emerald-100 text-lg font-medium opacity-90">
                Set your route, share costs, meet new people.
            </p>
        </div>
      </div>

      {/* --- 2. YÜZEN FORM KARTI --- */}
      <div className="container mx-auto px-4 relative z-20 -mt-24 pb-12 flex justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-4xl border border-gray-100">
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-8 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* BÖLÜM 1: Rota Bilgileri */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <LocationIcon className="w-5 h-5 text-[#004225]" /> Route Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">From</label>
                    <div className="relative">
                        <select
                            name="origin"
                            value={formData.origin}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Select City</option>
                            {Object.keys(CITIES).map((city) => (
                            <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    </div>

                    <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
                    <div className="relative">
                        <select
                            name="destination"
                            value={formData.destination}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Select City</option>
                            {Object.keys(CITIES).map((city) => (
                            <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* BÖLÜM 2: Detaylar */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-[#004225]" /> Date and Details
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Date and Time</label>
                        <input
                            type="datetime-local"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            Price (₺) <span className="text-xs font-normal text-gray-400">Per Person</span>
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            placeholder="150"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Seats</label>
                        <input
                            type="number"
                            name="totalSeats"
                            value={formData.totalSeats}
                            onChange={handleChange}
                            required
                            min="1"
                            max="8"
                            placeholder="3"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* BÖLÜM 3: Araç Bilgileri (Gri Kutu) */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <CarSolidIcon className="w-5 h-5 text-[#004225]" /> 
                 Vehicle Information <span className="text-xs font-normal text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200 ml-2">Optional</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Brand</label>
                  <input
                    type="text"
                    name="carBrand"
                    value={formData.carBrand}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#004225] transition-all"
                    placeholder="e.g. Fiat"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Model</label>
                  <input
                    type="text"
                    name="carModel"
                    value={formData.carModel}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#004225] transition-all"
                    placeholder="e.g. Egea"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Year</label>
                  <input
                    type="number"
                    name="carYear"
                    value={formData.carYear}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#004225] transition-all"
                    placeholder="2022"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Color</label>
                  <input
                    type="text"
                    name="carColor"
                    value={formData.carColor}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#004225] transition-all"
                    placeholder="White"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">License Plate</label>
                  <input
                    type="text"
                    name="carPlate"
                    value={formData.carPlate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#004225] transition-all uppercase"
                    placeholder="34 ABC 123"
                  />
                </div>
              </div>
            </div>

            {/* Submit Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004225] text-white py-4 rounded-xl hover:bg-[#00331b] hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed font-bold text-lg flex justify-center items-center gap-2"
            >
              {loading ? (
                 <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating...</span>
                 </>
              ) : (
                 <>
                    <PlusIcon className="w-6 h-6" />
                    Publish Listing
                 </>
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRide;