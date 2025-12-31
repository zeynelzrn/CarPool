import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-[#004225] selection:text-white">
      
      {/* --- HERO BÖLÜMÜ (Görsel + Yüzen Kutu) --- */}
      <div className="relative">
        
        {/* 1. ARKA PLAN GÖRSELİ (Yüksekliği sınırladık) */}
        <div className="relative h-[600px] w-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center transform scale-105"
            style={{
              backgroundImage: "url('src/assets/bgg.jpg')", // Senin resmin
            }}
          >
             {/* Resim üzerine hafif koyu filtre (Yeşil tonlu) */}
            <div className="absolute inset-0 bg-[#004225]/30 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          {/* Yazı Alanı (Resmin üstünde) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pb-32">
            
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-lg max-w-4xl leading-tight">
              Yolculuklar, <br/>
              <span className="text-emerald-300">Paylaştıkça Güzel.</span>
            </h1>
          </div>
        </div>

        {/* 2. YÜZEN BEYAZ KUTU (Floating Card) - Profesyonelliği bu sağlar */}
        <div className="container mx-auto px-4 relative z-20 -mt-32 mb-20">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-5xl mx-auto border border-gray-100">
            
            {/* Karşılama Başlığı (Siyah/Koyu Gri - Okunabilir) */}
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {isAuthenticated ? `Hoş geldin, ${user.username}` : 'Nasıl seyahat etmek istersin?'}
              </h2>
              <p className="text-gray-500 text-lg">Güvenli, hızlı ve ekonomik yolculuklar için doğru yerdesin.</p>
            </div>

            {/* İŞLEM BUTONLARI */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Sol Kart: Yolculuk Ara */}
              <Link to="/rides" className="group relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-200 p-8 hover:border-[#004225] hover:shadow-xl transition-all duration-300">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-white rounded-xl shadow-sm group-hover:bg-[#004225] group-hover:text-white transition-colors duration-300">
                    <svg className="w-8 h-8 text-[#004225] group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  <span className="text-gray-300 group-hover:text-[#004225] transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#004225] transition-colors">Yolculuk Ara</h3>
                <p className="text-gray-500 font-medium">Gitmek istediğin yeri bul, hemen rezervasyon yap.</p>
              </Link>

              {/* Sağ Kart: İlan Ver / Kayıt Ol */}
           <Link 
  to={
    !isAuthenticated 
      ? "/register" 
      : user.role === 'driver' 
        ? "/create-ride" 
        : "/my-bookings"
  } 
  className="group relative overflow-hidden rounded-2xl bg-[#004225] p-8 hover:bg-[#00331b] hover:shadow-xl transition-all duration-300"
>
  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
  
  <div className="flex justify-between items-start mb-6 relative z-10">
    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
      {/* İkonu duruma göre değiştirebilirsin, şimdilik genel bir ikon bıraktım */}
      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    </div>
  </div>

  <h3 className="text-2xl font-bold text-white mb-2 relative z-10">
    {!isAuthenticated 
      ? 'Aramıza Katıl' 
      : user.role === 'driver' 
        ? 'İlan Oluştur' 
        : 'Rezervasyonlarım'}
  </h3>

  <p className="text-emerald-100 font-medium relative z-10">
    {!isAuthenticated 
      ? 'Sürücü veya yolcu ol, topluluğun bir parçası ol.' 
      : user.role === 'driver' 
        ? 'Yeni bir rota belirle ve yolcularını bekle.' 
        : 'Mevcut seyahatlerini görüntüle ve yönet.'}
  </p>
</Link>

            </div>

            {/* Alt Bilgi */}
            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-8 text-gray-500 font-medium text-sm">
              <span className="flex items-center gap-2"><span className="text-green-500">✓</span> Doğrulanmış Profil</span>
              <span className="flex items-center gap-2"><span className="text-green-500">✓</span> 7/24 Destek</span>
              <span className="flex items-center gap-2"><span className="text-green-500">✓</span> Güvenli Ödeme</span>
            </div>

          </div>
        </div>
      </div>

      {/* --- NEDEN BİZ (Clean Layout) --- */}
      <div className="container mx-auto px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Neden CarPool?</h2>
          <p className="text-gray-600">Binlerce kullanıcı her gün işe, okula veya tatile giderken bizi tercih ediyor.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "🛡️", title: "Güvenli Seyahat", desc: "Tüm üyelerimiz kimlik doğrulamasından geçer." },
              { icon: "💰", title: "Cebine Dost", desc: "Yol masraflarını paylaşarak tasarruf et." },
              { icon: "⚡", title: "Hızlı & Pratik", desc: "Saniyeler içinde sana uygun aracı bul." }
            ].map((item, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
};

export default Home;