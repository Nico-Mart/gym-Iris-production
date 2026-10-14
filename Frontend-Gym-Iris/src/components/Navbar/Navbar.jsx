import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../assets/images/Logo.jpg";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const smoothScrollToY = (targetY, duration = 1400) => {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    const easeInOutCubic = (value) =>
      value < 0.5
        ? 4 * value * value * value
        : 1 - Math.pow(-2 * value + 2, 3) / 2;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);
      window.scrollTo(0, startY + distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const smoothScrollTo = (sectionId) => {
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    const yPosition = section.getBoundingClientRect().top + window.scrollY - 72;
    smoothScrollToY(yPosition, 1450);
  };

  const handleGoInicio = () => {
    setIsMobileMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: "inicio" } });
      return;
    }

    smoothScrollToY(0, 1300);
  };

  const handleGoSection = (sectionId) => {
    setIsMobileMenuOpen(false);

    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
      return;
    }

    smoothScrollTo(sectionId);
  };

  const handleGoAdmin = () => {
    setIsMobileMenuOpen(false);
    navigate("/admin");
  };

  const isDevBypass = import.meta.env.VITE_ALLOW_DEV_ADMIN === "true";

  const handleGoDevAdmin = () => {
    setIsMobileMenuOpen(false);
    navigate("/dev-admin");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = location.pathname === "/";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHome ? "bg-black shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            onClick={handleGoInicio}
            className="flex items-center space-x-2"
          >
            <img
              src={logo}
              alt="Logo Gym Iris"
              className="h-10 w-10 rounded-full object-cover border border-gray-700 brightness-105 contrast-100 saturate-100"
            />
            <span className="text-white text-xl font-bold brightness-105 contrast-100 saturate-100">
              Gym <span className="text-lime-500">Iris</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              type="button"
              onClick={handleGoInicio}
              className="text-white hover:text-lime-500 transition-colors"
            >
              Inicio
            </button>
            <button
              type="button"
              onClick={() => handleGoSection("about-us")}
              className="text-white hover:text-lime-500 transition-colors"
            >
              Sobre Nosotros
            </button>
            <button
              type="button"
              onClick={() => handleGoSection("contactanos")}
              className="text-white hover:text-lime-500 transition-colors"
            >
              Contáctanos
            </button>
            {isHome && (
              <>
                <button
                  type="button"
                  onClick={handleGoAdmin}
                  className="ml-2 bg-lime-500 hover:bg-lime-600 text-black font-semibold py-2 px-4 rounded-full shadow-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-lime-300"
                >
                  Iniciar sesión
                </button>
                {isDevBypass && (
                  <button
                    type="button"
                    onClick={handleGoDevAdmin}
                    className="ml-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-3 rounded-full shadow transition transform hover:scale-105"
                    title="Dev-only: ir directo al admin (desactivar en producción)"
                  >
                    Dev Admin
                  </button>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black border-t border-gray-800">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <button
              type="button"
              onClick={handleGoInicio}
              className="block text-white hover:text-lime-500 py-2 transition-colors"
            >
              Inicio
            </button>
            <button
              type="button"
              onClick={() => handleGoSection("about-us")}
              className="block text-white hover:text-lime-500 py-2 transition-colors"
            >
              Sobre Nosotros
            </button>
            <button
              type="button"
              onClick={() => handleGoSection("contactanos")}
              className="block text-white hover:text-lime-500 py-2 transition-colors"
            >
              Contáctanos
            </button>
            {isHome && (
              <>
                <button
                  type="button"
                  onClick={handleGoAdmin}
                  className="block w-full bg-lime-500 hover:bg-lime-600 text-black font-semibold py-3 px-4 rounded-full shadow-lg transition transform hover:scale-105 text-center focus:outline-none focus:ring-2 focus:ring-lime-300"
                >
                  Iniciar sesión
                </button>
                {isDevBypass && (
                  <button
                    type="button"
                    onClick={handleGoDevAdmin}
                    className="block w-full mt-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-4 rounded-full shadow transition transform hover:scale-105 text-center"
                  >
                    Dev Admin
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
