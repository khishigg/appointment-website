import { createElement, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import ashidLogo from "../assets/ASHID-LOGO.png";
import { FiArrowLeft, FiCalendar, FiChevronRight, FiClock, FiHome, FiLogIn, FiLogOut, FiMenu, FiUser, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/AuthStore";

const MotionOverlay = motion.div;
const MotionDrawer = motion.aside;
const mobileNavigationItems = [
  { label: "Нүүр хуудас", to: "/", icon: FiHome },
  { label: "Цаг авах", to: "/booking", icon: FiCalendar },
  { label: "Захиалгын түүх", to: "/my-appointments", icon: FiClock },
];

export default function MyNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const menuToggleRef = useRef(null);
  const drawerRef = useRef(null);
  const wasMenuOpenRef = useRef(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, role, logout } = useAuthStore();
  const displayName = user?.name || user?.username || "Хэрэглэгч";
  const profileRole = role || user?.role || "User";
  const profileInitial = displayName.trim().charAt(0).toUpperCase() || "Х";
  const isBookingPage = location.pathname === "/booking";
  const isSubpage = location.pathname !== "/";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /**
   * Navbar нь `fixed="top"` — урсгалаас гардаг тул хуудас бүр өөрөө дээд зайгаа
   * гаргах ёстой болдог. Тоог гараар таамаглавал буруу: navbar-ын өндөр гүйхэд
   * 40px padding → 19px болж ӨӨРЧЛӨГДДӨГ (index.css:2244 / :2255).
   *
   * Тиймээс бодит өндрийг хэмжиж `--app-header-height`-д бичнэ.
   * ⚠️ ЗӨВХӨН гүйгээгүй (хамгийн өндөр) үеийн утгыг бичнэ — эс тэгвэл гүйлгэхэд
   * navbar намсаж, хуудасны padding хамт багасан агуулга үсэрнэ.
   */
  useEffect(() => {
    const element = navRef.current;
    if (!element) return undefined;

    // ЗӨВХӨН ӨСГӨНӨ. Ингэснээр:
    //  · гүйхэд navbar намсахад хуудасны padding багасаж агуулга ҮСРЭХГҮЙ
    //  · шилжилтийн дунд (0.5s transition) хэмжсэн бага утга бичигдэхгүй
    //  · логоны зураг ачаалагдаж navbar өндөрсөхөд утга зөв шинэчлэгдэнэ
    let maxHeight = 0;

    const applyHeight = () => {
      const height = element.offsetHeight;
      if (height <= maxHeight) return;

      maxHeight = height;
      document.documentElement.style.setProperty("--app-header-height", `${height}px`);
    };

    applyHeight();

    // Логоны зураг ачаалагдах, фонт солигдох зэрэгт navbar өндөр өөрчлөгдөнө.
    const observer = new ResizeObserver(applyHeight);
    observer.observe(element);

    // Дэлгэцийн хэмжээ өөрчлөгдвөл navbar жинхэнэ утгаараа намсаж болно —
    // тэр үед хамгийн их утгыг тэглэж дахин хэмжинэ.
    const handleResize = () => {
      maxHeight = 0;
      applyHeight();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [isBookingPage, isAuthenticated]);

  useEffect(() => {
    if (!isMenuOpen) {
      if (wasMenuOpenRef.current) {
        menuToggleRef.current?.focus();
        wasMenuOpenRef.current = false;
      }
      return undefined;
    }

    wasMenuOpenRef.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const drawer = drawerRef.current;
      const focusableElements = drawer
        ? [...drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        : [];

      if (focusableElements.length === 0) {
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && (activeElement === firstFocusable || activeElement === drawer)) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => drawerRef.current?.focus());

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  if (isBookingPage) {
    return (
      <nav
        className={`navbar-custom booking-topbar ${scrolled ? "navbar-scrolled" : ""}`}
      >
        <div className="page-container booking-topbar-container">
          <Link
            to="/"
            className="booking-topbar-back"
            aria-label="Нүүр хуудас руу буцах"
          >
            <FiArrowLeft size={21} />
          </Link>
          <h1 className="booking-topbar-title">Эмнэлгийн мэдээлэл</h1>
          <button
            type="button"
            className="booking-topbar-menu"
            aria-label="Цэс"
          >
            <FiMenu size={20} />
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav
      ref={navRef}
      className={`navbar-custom fixed inset-x-0 top-0 flex items-center ${scrolled ? "navbar-scrolled" : ""} ${isSubpage ? "navbar-subpage" : ""} ${isMenuOpen ? "navbar-custom--menu-open" : ""}`}
    >
      <div className="page-container flex items-center justify-between">
        <Link to="/" className="app-navbar-brand shrink-0 whitespace-nowrap py-[5px] flex items-center relative left-2 gap-2 m-0">
          <img
            src={ashidLogo}
            alt="Ashid Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="navbar-brand-text">ASHID SOFT</span>
        </Link>

        <button
          ref={menuToggleRef}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          className="navbar-toggler-custom min-[992px]:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <div className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        <div className="desktop-navbar-content hidden min-[992px]:flex">
          <div className="flex mx-auto flex-row text-center py-2 min-[992px]:py-0">
            <Link to="/" aria-current={location.pathname === '/' ? 'page' : undefined} className={`app-nav-link min-[992px]:px-4 font-medium ${location.pathname === '/' ? 'text-[var(--primary-600)]' : ''}`}>Нүүр хуудас</Link>
            <Link to="/" className="app-nav-link min-[992px]:px-4 font-medium">Бидний тухай</Link>
            <Link to="/booking" aria-current={location.pathname === '/booking' ? 'page' : undefined} className={`app-nav-link min-[992px]:px-4 font-medium ${location.pathname === '/booking' ? 'text-[var(--primary-600)]' : ''}`}>Цаг авах</Link>
            <Link to="/my-appointments" aria-current={location.pathname === '/my-appointments' ? 'page' : undefined} className={`app-nav-link min-[992px]:px-4 font-medium ${location.pathname === '/my-appointments' ? 'text-[var(--primary-600)]' : ''}`}>Захиалгын түүх</Link>
          </div>

          <div className="desktop-auth-actions">
            {isAuthenticated ? (
              <>
                <div className="desktop-profile" title={`${displayName} (${profileRole})`}>
                  <span className="desktop-profile__avatar" aria-hidden="true">
                    {profileInitial}
                  </span>
                  <span className="desktop-profile__info">
                    <strong>{displayName}</strong>
                    <small>{profileRole}</small>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="desktop-logout"
                  aria-label="Системээс гарах"
                  title="Гарах"
                >
                  <FiLogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" state={{ from: location }} className="desktop-login">
                  <FiLogIn size={17} />
                  <span>Нэвтрэх</span>
                </Link>
                <Link to="/register" className="btn-nav-register">
                  Бүртгүүлэх
                </Link>
              </>
            )}
          </div>
        </div>

        {typeof document !== "undefined" && createPortal(
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <MotionOverlay
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMenuOpen(false)}
                  className="mobile-sidebar-overlay"
                />

                <MotionDrawer
                  ref={drawerRef}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  id="mobile-navigation"
                  className="mobile-sidebar-content"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="mobile-navigation-title"
                  tabIndex={-1}
                >
                  <div className="mobile-navigation">
                    <header className="mobile-navigation__header">
                      <h2 id="mobile-navigation-title">{isAuthenticated ? "Миний бүртгэл" : "Цэс"}</h2>
                      <button type="button" aria-label="Цэс хаах" className="mobile-navigation__close" onClick={() => setIsMenuOpen(false)}>
                        <FiX size={22} />
                      </button>
                    </header>

                    {isAuthenticated ? (
                      <section className="mobile-navigation__profile" aria-label="Хэрэглэгчийн мэдээлэл">
                        <span className="mobile-navigation__avatar" aria-hidden="true">{profileInitial}</span>
                        <span className="mobile-navigation__profile-copy">
                          <strong>{displayName}</strong>
                          <small>{user?.username || displayName}</small>
                        </span>
                      </section>
                    ) : (
                      <section className="mobile-navigation__guest" aria-label="Зочин хэрэглэгч">
                        <span className="mobile-navigation__avatar" aria-hidden="true"><FiUser size={22} /></span>
                        <span className="mobile-navigation__profile-copy">
                          <strong>Зочин хэрэглэгч</strong>
                          <small>Захиалгаа удирдахын тулд нэвтэрнэ үү.</small>
                        </span>
                      </section>
                    )}

                    <nav className="mobile-navigation__section" aria-label="Үндсэн цэс">
                      <p className="mobile-navigation__section-title">Үндсэн цэс</p>
                      <ul className="mobile-navigation__list">
                        {mobileNavigationItems.map(({ label, to, icon }) => (
                          <li key={to}>
                            <Link
                              to={to}
                              aria-current={location.pathname === to ? "page" : undefined}
                              className="mobile-navigation__item"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {createElement(icon, { "aria-hidden": true })}
                              <span>{label}</span>
                              <FiChevronRight className="mobile-navigation__chevron" aria-hidden="true" />
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>

                    {isAuthenticated ? (
                      <section className="mobile-navigation__section" aria-label="Бүртгэл">
                        <p className="mobile-navigation__section-title">Бүртгэл</p>
                        <button type="button" className="mobile-navigation__item mobile-navigation__item--action mobile-navigation__item--danger" onClick={() => { logout(); setIsMenuOpen(false); }}>
                          <FiLogOut aria-hidden="true" />
                          <span>Гарах</span>
                        </button>
                      </section>
                    ) : (
                      <div className="mobile-navigation__actions">
                        <Link to="/login" state={{ from: location }} className="mobile-navigation__login" onClick={() => setIsMenuOpen(false)}>
                          Нэвтрэх
                        </Link>
                        <Link to="/register" className="mobile-navigation__register" onClick={() => setIsMenuOpen(false)}>
                          Бүртгүүлэх
                        </Link>
                      </div>
                    )}
                  </div>
                </MotionDrawer>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
      </div>
    </nav>
  );
}
