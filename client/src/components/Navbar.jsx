import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CarSolidIcon, PlusIcon, ListIcon, SearchIcon, TicketIcon, UserIcon } from './Icons';
import { useState, useEffect } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { isAuthenticated, user, logout, isDriver, isPassenger } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Menü açıkken body scroll'u engelle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out border-b border-white/0
      ${scrolled || isOpen
        ? 'bg-[#004225] backdrop-blur-md py-3 shadow-xl border-white/10'
        : 'bg-transparent py-4 md:py-6'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">

        {/* --- LOGO --- */}
        <Link to="/" className="flex items-center gap-2 md:gap-3 group" onClick={closeMenu}>
          <div className={`p-1.5 md:p-2 rounded-xl transition-all duration-300 ${scrolled || isOpen ? 'bg-white/10' : 'bg-white/20 backdrop-blur-sm'}`}>
             <CarSolidIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <span className="text-xl md:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
            Car<span className="text-emerald-300">Pool</span>
          </span>
        </Link>

        {/* --- HAMBURGER BUTTON (Mobil) --- */}
        <button
          className="md:hidden text-white p-2 focus:outline-none z-50"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <FaTimes className="w-6 h-6" />
          ) : (
            <FaBars className="w-6 h-6" />
          )}
        </button>

        {/* --- MASAÜSTÜ MENÜ (md ve üzeri) --- */}
        <div className="hidden md:flex items-center gap-8 text-white">
           {isAuthenticated ? (
             <>
               {/* SÜRÜCÜ MENÜSÜ */}
               {isDriver && (
                 <>
                   <Link to="/create-ride" className="hover:text-emerald-200 transition-colors font-medium flex items-center gap-1.5">
                     <PlusIcon className="w-4 h-4" />
                     <span>Create Listing</span>
                   </Link>
                   <Link to="/my-rides" className="hover:text-emerald-200 transition-colors font-medium flex items-center gap-1.5">
                     <ListIcon className="w-4 h-4" />
                     <span>My Listings</span>
                   </Link>
                 </>
               )}

               {/* YOLCU MENÜSÜ */}
               {isPassenger && (
                 <>
                   <Link to="/rides" className="hover:text-emerald-200 transition-colors font-medium flex items-center gap-1.5">
                     <SearchIcon className="w-4 h-4" />
                     <span>Find a Ride</span>
                   </Link>
                   <Link to="/my-bookings" className="hover:text-emerald-200 transition-colors font-medium flex items-center gap-1.5">
                     <TicketIcon className="w-4 h-4" />
                     <span>My Bookings</span>
                   </Link>
                 </>
               )}

               {/* KULLANICI PROFİLİ VE ÇIKIŞ */}
               <div className="flex items-center gap-4 pl-4 border-l border-white/20">
                 <Link
                   to={`/profile/${user._id}`}
                   className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-all cursor-pointer border border-white/10"
                 >
                   <UserIcon className="w-4 h-4" />
                   <span className="text-sm font-medium">
                     {user.username}
                   </span>
                   <span className="text-xs bg-emerald-500/80 text-white px-2 py-0.5 rounded-full border border-emerald-400/50">
                     {user.role === 'driver' ? 'Driver' : 'Passenger'}
                   </span>
                 </Link>

                 <button
                   onClick={handleLogout}
                   className="bg-white/10 hover:bg-red-500/80 hover:text-white text-red-100 px-4 py-2 rounded-lg transition-all font-medium text-sm backdrop-blur-sm"
                 >
                   Logout
                 </button>
               </div>
             </>
           ) : (
             <>
               {/* GUEST MENÜSÜ */}
               <Link to="/rides" className="hover:text-emerald-200 transition-colors font-medium">
                 Rides
               </Link>

               <Link
                 to="/login"
                 className="text-white hover:text-emerald-200 font-medium transition-colors"
               >
                 Sign In
               </Link>

               <Link
                 to="/register"
                 className="bg-white text-[#004225] px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-all hover:shadow-lg font-bold flex items-center gap-2"
               >
                 Sign Up
               </Link>
             </>
           )}
        </div>
      </div>

      {/* --- MOBİL MENÜ (Tam Ekran Panel) --- */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full h-screen bg-[#004225] z-40 transition-all duration-500 ease-in-out ${
          isOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible'
        }`}
      >
        {/* Dekoratif Arka Plan */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-2xl"></div>
        </div>

        {/* Menü İçeriği - Ortalanmış */}
        <div className="relative h-full flex flex-col items-center justify-center px-8">

          {isAuthenticated ? (
            <>
              {/* Kullanıcı Bilgisi - Üstte */}
              <div className={`absolute top-24 left-0 right-0 flex flex-col items-center transition-all duration-500 delay-100 ${
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
              }`}>
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-3xl mb-3 ring-4 ring-white/10">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <p className="text-white font-semibold text-xl">{user.username}</p>
                <span className="text-sm bg-emerald-500/80 text-white px-3 py-1 rounded-full mt-2">
                  {user.role === 'driver' ? 'Driver' : 'Passenger'}
                </span>
              </div>

              {/* Menü Linkleri - Ortada (Kullanıcı bilgisi ile çakışmayı önlemek için mt-32) */}
              <nav className={`flex flex-col items-center gap-6 mt-32 transition-all duration-500 delay-200 ${
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                {isDriver && (
                  <>
                    <Link
                      to="/create-ride"
                      onClick={closeMenu}
                      className="flex items-center gap-3 text-white text-2xl font-medium hover:text-emerald-300 transition-colors"
                    >
                      <PlusIcon className="w-7 h-7" />
                      <span>Create Listing</span>
                    </Link>
                    <Link
                      to="/my-rides"
                      onClick={closeMenu}
                      className="flex items-center gap-3 text-white text-2xl font-medium hover:text-emerald-300 transition-colors"
                    >
                      <ListIcon className="w-7 h-7" />
                      <span>My Listings</span>
                    </Link>
                  </>
                )}

                {isPassenger && (
                  <>
                    <Link
                      to="/rides"
                      onClick={closeMenu}
                      className="flex items-center gap-3 text-white text-2xl font-medium hover:text-emerald-300 transition-colors"
                    >
                      <SearchIcon className="w-7 h-7" />
                      <span>Find a Ride</span>
                    </Link>
                    <Link
                      to="/my-bookings"
                      onClick={closeMenu}
                      className="flex items-center gap-3 text-white text-2xl font-medium hover:text-emerald-300 transition-colors"
                    >
                      <TicketIcon className="w-7 h-7" />
                      <span>My Bookings</span>
                    </Link>
                  </>
                )}

                <Link
                  to={`/profile/${user._id}`}
                  onClick={closeMenu}
                  className="flex items-center gap-3 text-white text-2xl font-medium hover:text-emerald-300 transition-colors"
                >
                  <UserIcon className="w-7 h-7" />
                  <span>My Profile</span>
                </Link>

                {/* Ayırıcı Çizgi */}
                <div className="w-16 h-0.5 bg-white/20 my-2"></div>

                {/* Çıkış Butonu */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-red-300 text-xl font-medium hover:text-red-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </nav>
            </>
          ) : (
            <>
              {/* Guest Menü - Ortalanmış */}
              <nav className={`flex flex-col items-center gap-8 transition-all duration-500 delay-200 ${
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <Link
                  to="/rides"
                  onClick={closeMenu}
                  className="flex items-center gap-3 text-white text-2xl font-medium hover:text-emerald-300 transition-colors"
                >
                  <SearchIcon className="w-7 h-7" />
                  <span>Rides</span>
                </Link>

                {/* Ayırıcı Çizgi */}
                <div className="w-16 h-0.5 bg-white/20 my-2"></div>

                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="text-white text-2xl font-medium hover:text-emerald-300 transition-colors"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="bg-white text-[#004225] text-xl font-bold px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-all shadow-lg"
                >
                  Sign Up
                </Link>
              </nav>
            </>
          )}

          {/* Alt Bilgi */}
          <div className={`absolute bottom-8 text-center transition-all duration-500 delay-300 ${
            isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <p className="text-white/40 text-sm">
              Car<span className="text-emerald-300/60">Pool</span> © 2025
            </p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
