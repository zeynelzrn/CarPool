import { Link } from 'react-router-dom';
import { CarSolidIcon } from './Icons';

const Footer = () => {
  return (
    <footer className="bg-[#004225] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Sol: Logo ve Slogan */}
          <div className="text-center md:text-left">
            <Link to="/" className="inline-flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-white/10">
                <CarSolidIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                Car<span className="text-emerald-300">Pool</span>
              </span>
            </Link>
            <p className="text-emerald-100/80 text-sm leading-relaxed">
              Yolculuklarını paylaş, masrafları azalt,
              yeni insanlarla tanış. Sürdürülebilir
              ulaşımın parçası ol.
            </p>
          </div>

          {/* Orta: Hızlı Linkler */}
          <div className="text-center">
            <h3 className="text-lg font-bold mb-4 text-white">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-emerald-100/80 hover:text-white transition-colors text-sm">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link to="/rides" className="text-emerald-100/80 hover:text-white transition-colors text-sm">
                  Yolculuklar
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-emerald-100/80 hover:text-white transition-colors text-sm">
                  Giriş Yap
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-emerald-100/80 hover:text-white transition-colors text-sm">
                  Kayıt Ol
                </Link>
              </li>
            </ul>
          </div>

          {/* Sağ: Sosyal Medya */}
          <div className="text-center md:text-right">
            <h3 className="text-lg font-bold mb-4 text-white">Bizi Takip Edin</h3>
            <div className="flex justify-center md:justify-end gap-4 mb-4">
              {/* Twitter/X */}
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
            <p className="text-emerald-100/60 text-xs">
              iletisim@carpool.com
            </p>
          </div>
        </div>

        {/* Alt Kısım: Telif Hakkı */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-emerald-100/60 text-sm">
            © 2025 CarPool. Tüm hakları saklıdır.
          </p>
          <p className="text-emerald-100/40 text-xs mt-2">
            SE 3355 – Final Project
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
