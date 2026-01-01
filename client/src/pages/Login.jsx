import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Icon importunu kaldırdım çünkü yeni tasarımda text odaklı başlık kullanıyoruz, 
// istersen tekrar ekleyebilirsin ama bu sade tasarımda gerek kalmıyor.

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
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
      await login(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-[#004225] selection:text-white flex flex-col">
      
      {/* --- 1. ÜST HERO ALANI (Dekoratif Yeşil Alan) --- */}
      <div className="relative h-72 w-full bg-[#004225] overflow-hidden">
        {/* Arka plan desenleri/blurları */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
        
        {/* Başlık (Ortalanmış) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-16 text-center">
             <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">Welcome Back</h1>
             <p className="text-emerald-100 mt-2 font-medium">Continue your journey from where you left off.</p>
        </div>
      </div>

      {/* --- 2. YÜZEN FORM KARTI (Floating Card) --- */}
      <div className="container mx-auto px-4 relative z-20 -mt-24 mb-12 flex justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-lg border border-gray-100">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign In to Your Account</h2>
            <p className="text-gray-500 mt-2 text-sm">Please enter your information.</p>
          </div>

          {/* Hata Mesajı Alanı */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="example@mail.com"
                className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
              />
            </div>

            {/* Password Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-[#004225] hover:underline">
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004225] text-white font-bold py-4 rounded-xl hover:bg-[#00331b] hover:shadow-lg transition-all duration-300 transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Alt Footer */}
          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-500 text-sm">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-[#004225] font-bold hover:underline ml-1">
                Join Us (Sign Up)
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;