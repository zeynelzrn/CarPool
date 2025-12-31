import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// İkonları kaldırdım, çünkü yeni tasarım daha sade ve tipografi odaklı.

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'passenger',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
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
      await register(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-[#004225] selection:text-white flex flex-col">
      
      {/* --- 1. ÜST HERO ALANI --- */}
      <div className="relative h-80 w-full bg-[#004225] overflow-hidden">
        {/* Dekoratif Arka Plan Efektleri */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        
        {/* Başlık */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-20 text-center px-4">
             <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md">Aramıza Katıl</h1>
             <p className="text-emerald-100 mt-3 text-lg font-medium max-w-lg">
               Saniyeler içinde hesabını oluştur, yolculuğun tadını çıkar.
             </p>
        </div>
      </div>

      {/* --- 2. YÜZEN FORM KARTI --- */}
      <div className="container mx-auto px-4 relative z-20 -mt-24 mb-12 flex justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-lg border border-gray-100">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Hesap Oluştur</h2>
            <p className="text-gray-500 mt-2 text-sm">Gerekli bilgileri girerek başla.</p>
          </div>

          {/* Hata Mesajı */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Kullanıcı Adı */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                placeholder="kullaniciadi"
                className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                E-posta Adresi
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ornek@mail.com"
                className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
              />
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Şifre
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
              />
              <p className="text-xs text-gray-400 mt-1 ml-1">En az 6 karakter olmalıdır.</p>
            </div>

            {/* Rol Seçimi (Select Box) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Kullanım Amacı (Rol)
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all appearance-none cursor-pointer"
                >
                  <option value="passenger">Yolcu (Araç Arıyorum)</option>
                  <option value="driver">Sürücü (Yolcu Arıyorum)</option>
                </select>
                {/* Custom Chevron Icon for Select */}
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004225] text-white font-bold py-4 rounded-xl hover:bg-[#00331b] hover:shadow-lg transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Hesap Oluşturuluyor...</span>
                </>
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>

          {/* Alt Footer */}
          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              Zaten bir hesabın var mı?{' '}
              <Link to="/login" className="text-[#004225] font-bold hover:underline ml-1">
                Giriş Yap
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;