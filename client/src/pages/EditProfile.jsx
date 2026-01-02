import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService'; // authService içinde getProfile veya me fonksiyonu olmalı
import { UserIcon } from '../components/Icons';

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    bio: '',
    // profilePicture'ı burada tutmuyoruz, sadece preview ve file olarak yöneteceğiz
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true); // Sayfa yükleniyor durumu
  const [imagePreview, setImagePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); // Yeni seçilen dosya
  const [removePhoto, setRemovePhoto] = useState(false); // Fotoğrafı kaldırma flag'i

  // 1. Sayfa Açılışında En Güncel Veriyi Çek
  useEffect(() => {
    const initProfile = async () => {
      try {
        // Önce eldeki user verisiyle formu doldur (Hız için)
        if (user) fillForm(user);

        // Sonra sunucudan Taze veri çek (Garanti için)
        // Eğer authService'de 'getProfile' yoksa 'getCurrentUser' veya benzerini kullan
        // Genelde login işleminde kullanılan endpoint'i tekrar çağırırız.
        // Eğer böyle bir metodun yoksa, aşağıdaki try-catch bloğunu kaldırıp sadece user'a güvenebilirsin.
        const freshUser = await authService.getProfile(); 
        if (freshUser) {
            setUser(freshUser); // Context'i güncelle
            fillForm(freshUser); // Formu taze veriyle doldur
        }
      } catch (err) {
        console.error("Güncel veri çekilemedi, context kullanılıyor.", err);
      } finally {
        setPageLoading(false);
      }
    };

    initProfile();
  }, []);

  // Formu Doldurma Yardımcısı
  const fillForm = (userData) => {
    setFormData({
      username: userData.username || '',
      phone: userData.phone || '',
      bio: userData.bio || userData.about || '', // Backend'de isim farklı olabilir diye kontrol
    });
    setImagePreview(userData.profilePicture || '');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }

      setSelectedFile(file); // Dosyayı kaydet
      setRemovePhoto(false); // Yeni fotoğraf seçildiğinde kaldırma flag'ini sıfırla

      // Önizleme oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fotoğrafı Kaldır
  const handleRemovePhoto = () => {
    setImagePreview('');
    setSelectedFile(null);
    setRemovePhoto(true); // Backend'e fotoğrafı sil sinyali gönder
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Gönderilecek objeyi hazırla
      const payload = { ...formData };

      // FOTOĞRAF MANTIĞI:
      // 1. Eğer "Fotoğrafı Kaldır" seçildiyse -> removeProfilePicture: true gönder
      // 2. Eğer yeni dosya seçildiyse -> Base64'e çevirip profilePicture olarak gönder
      // 3. Hiçbiri değilse -> profilePicture alanını gönderme (mevcut fotoğraf korunur)

      if (removePhoto) {
        // Fotoğrafı tamamen kaldır
        payload.removeProfilePicture = true;
      } else if (selectedFile) {
         // Yeni fotoğraf yükle
         const toBase64 = file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
         });

         payload.profilePicture = await toBase64(selectedFile);
      }

      // Backend'e gönder
      const updatedUser = await authService.updateProfile(payload);
      
      // Başarılı olursa Context'i güncelle ve yönlendir
      setUser(updatedUser);
      navigate('/profile/' + updatedUser._id);

    } catch (err) {
      console.error(err);
      
      // Hata olsa bile, kullanıcı "güncellendi ama hata verdi" diyorsa
      // sayfayı yenilemek veya profile gitmek mantıklı olabilir.
      // Ama biz yine de hatayı gösterelim.
      setError(err.response?.data?.message || 'An error occurred while updating profile.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#004225] border-t-transparent"></div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-[#004225] selection:text-white flex flex-col">
      
      {/* --- HERO ALANI --- */}
      <div className="relative h-72 w-full bg-[#004225] overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-10 -mb-10 blur-2xl"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pb-16 text-center">
             <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">Edit Profile</h1>
             <p className="text-emerald-100 mt-2 font-medium">Keep your information up to date, increase your reliability.</p>
        </div>
      </div>

      {/* --- FORM KARTI --- */}
      <div className="container mx-auto px-4 relative z-20 -mt-24 mb-12 flex justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 w-full max-w-2xl border border-gray-100">
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="font-medium text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Profil Fotoğrafı */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg ring-4 ring-[#004225]/10"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-white shadow-lg ring-4 ring-[#004225]/10">
                    <UserIcon className="w-16 h-16 text-[#004225]" />
                  </div>
                )}

                {/* Fotoğraf Yükle Butonu */}
                <label className="absolute bottom-0 right-0 bg-[#004225] text-white p-2.5 rounded-full cursor-pointer hover:bg-[#00331b] transition-all shadow-lg transform group-hover:scale-110 border-2 border-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-xs text-gray-400 mt-3 font-medium">Maximum file size: 2MB</p>

              {/* Fotoğrafı Kaldır Butonu - Sadece fotoğraf varsa göster */}
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="mt-3 flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium transition-colors hover:bg-red-50 px-3 py-1.5 rounded-lg"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove Photo
                </button>
              )}

              {/* Fotoğraf kaldırılacak uyarısı */}
              {removePhoto && (
                <p className="text-xs text-orange-500 mt-2 font-medium">
                  Photo will be removed when you save changes.
                </p>
              )}
            </div>

            {/* Kullanıcı Adı */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:bg-white focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
              />
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:bg-white focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all"
              />
            </div>

            {/* Hakkımda (Bio) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                About Me (Bio)
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="4"
                maxLength={500}
                className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:outline-none focus:bg-white focus:border-[#004225] focus:ring-1 focus:ring-[#004225] transition-all resize-none"
                placeholder="Tell us briefly about yourself..."
              />
              <div className="flex justify-end mt-1">
                 <p className="text-xs text-gray-400 font-medium">{formData.bio.length} / 500</p>
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-600 py-3 px-4 rounded-xl hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#004225] text-white py-3 px-4 rounded-xl hover:bg-[#00331b] hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed font-bold flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                     <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     <span>Saving...</span>
                  </>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;