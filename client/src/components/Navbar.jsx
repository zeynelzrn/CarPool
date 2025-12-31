import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CarSolidIcon, PlusIcon, ListIcon, SearchIcon, TicketIcon, UserIcon } from './Icons';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { isAuthenticated, user, logout, isDriver, isPassenger } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out border-b border-white/0
      ${scrolled 
        ? 'bg-[#004225]/90 backdrop-blur-md py-3 shadow-xl border-white/10' 
        : 'bg-transparent py-6' 
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        
        {/* --- LOGO --- */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className={`p-2 rounded-xl transition-all duration-300 ${scrolled ? 'bg-white/10' : 'bg-white/20 backdrop-blur-sm'}`}>
             <CarSolidIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
            Car<span className="text-emerald-300">Pool</span> {/* Koyu zemin üzerinde açık yeşil yazı */}
          </span>
        </Link>

        {/* --- MENÜ --- */}
        <div className="flex items-center gap-8 text-white">
           {isAuthenticated ? (
             <>
               {/* SÜRÜCÜ MENÜSÜ */}
               {isDriver && (
                 <>
                   <Link to="/create-ride" className="hover:text-emerald-200 transition-colors font-medium flex items-center gap-1.5">
                     <PlusIcon className="w-4 h-4" />
                     <span>İlan Oluştur</span>
                   </Link>
                   <Link to="/my-rides" className="hover:text-emerald-200 transition-colors font-medium flex items-center gap-1.5">
                     <ListIcon className="w-4 h-4" />
                     <span>İlanlarım</span>
                   </Link>
                 </>
               )}

               {/* YOLCU MENÜSÜ */}
               {isPassenger && (
                 <>
                   <Link to="/rides" className="hover:text-emerald-200 transition-colors font-medium flex items-center gap-1.5">
                     <SearchIcon className="w-4 h-4" />
                     <span>Yolculuk Ara</span>
                   </Link>
                   <Link to="/my-bookings" className="hover:text-emerald-200 transition-colors font-medium flex items-center gap-1.5">
                     <TicketIcon className="w-4 h-4" />
                     <span>Rezervasyonlarım</span>
                   </Link>
                 </>
               )}

               {/* KULLANICI PROFİLİ VE ÇIKIŞ */}
               <div className="flex items-center gap-4 pl-4 border-l border-white/20"> {/* border-blue yerine white/20 */}
                 
                 <Link
                   to={`/profile/${user._id}`}
                   className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-all cursor-pointer border border-white/10"
                 >
                   <UserIcon className="w-4 h-4" />
                   <span className="text-sm font-medium">
                     {user.username}
                   </span>
                   {/* Rol Rozeti: Mavi yerine Zümrüt/Beyaz uyumu */}
                   <span className="text-xs bg-emerald-500/80 text-white px-2 py-0.5 rounded-full border border-emerald-400/50">
                     {user.role === 'driver' ? 'Sürücü' : 'Yolcu'}
                   </span>
                 </Link>

                 <button
                   onClick={logout}
                   className="bg-white/10 hover:bg-red-500/80 hover:text-white text-red-100 px-4 py-2 rounded-lg transition-all font-medium text-sm backdrop-blur-sm"
                 >
                   Çıkış
                 </button>
               </div>
             </>
           ) : (
             <>
               {/* GUEST MENÜSÜ */}
               <Link to="/rides" className="hover:text-emerald-200 transition-colors font-medium">
                 Yolculuklar
               </Link>
               
               <Link
                 to="/login"
                 className="text-white hover:text-emerald-200 font-medium transition-colors"
               >
                 Giriş Yap
               </Link>
               
               {/* Kayıt Ol Butonu: Yeşil zemin üzerinde Beyaz buton daha şık durur */}
               <Link
                 to="/register"
                 className="bg-white text-[#004225] px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-all hover:shadow-lg font-bold flex items-center gap-2"
               >
                 Kayıt Ol
               </Link>
             </>
           )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;