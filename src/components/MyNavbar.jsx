import { useEffect, useRef, useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import ashidLogo from "../assets/ASHID-LOGO.png";
import { FiArrowLeft, FiLogIn, FiLogOut, FiMenu, FiUser, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../store/AuthStore";

export default function MyNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
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

  if (isBookingPage) {
    return (
      <Navbar
        className={`navbar-custom booking-topbar ${scrolled ? "navbar-scrolled" : ""}`}
      >
        <Container className="booking-topbar-container">
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
        </Container>
      </Navbar>
    );
  }

  return (
    <Navbar
      ref={navRef}
      expand="lg"
      fixed="top"
      className={`navbar-custom ${scrolled ? "navbar-scrolled" : ""} ${isSubpage ? "navbar-subpage" : ""}`}
    >
      <Container className="d-flex align-items-center">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center position-relative left-2 gap-2 m-0">
          <img
            src={ashidLogo}
            alt="Ashid Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="navbar-brand-text">ASHID SOFT</span>
        </Navbar.Brand>

        <button
          className="navbar-toggler-custom d-lg-none"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation"
        >
          <div className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>

        <div className="desktop-navbar-content d-none d-lg-flex">
          <Nav className="mx-auto text-center py-2 py-lg-0">
            <Nav.Link as={Link} to="/" className={`px-lg-3 fw-medium ${location.pathname === '/' ? 'active text-primary' : ''}`}>Нүүр хуудас</Nav.Link>
            <Nav.Link as={Link} to="/" className="px-lg-3 fw-medium">Бидний тухай</Nav.Link>
            <Nav.Link as={Link} to="/booking" className={`px-lg-3 fw-medium ${location.pathname === '/booking' ? 'active text-primary' : ''}`}>Цаг авах</Nav.Link>
            <Nav.Link as={Link} to="/my-appointments" className={`px-lg-3 fw-medium ${location.pathname === '/my-appointments' ? 'active text-primary' : ''}`}>Захиалгын түүх</Nav.Link>
          </Nav>

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

        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="mobile-sidebar-overlay"
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="mobile-sidebar-content"
              >
                <div className="p-4 d-flex flex-column h-100">
                  <div className="d-flex justify-content-end mb-4">
                    <button className="btn-close-sidebar" onClick={() => setIsMenuOpen(false)}>
                      <FiX size={24} />
                    </button>
                  </div>

                  <div className="sidebar-menu-sections flex-grow-1">
                    <Nav className="flex-column gap-3 mb-4">
                      <Nav.Link as={Link} to="/" className="sidebar-nav-link" onClick={() => setIsMenuOpen(false)}>Нүүр хуудас</Nav.Link>
                      <Nav.Link as={Link} to="/" className="sidebar-nav-link" onClick={() => setIsMenuOpen(false)}>Бидний тухай</Nav.Link>
                      <Nav.Link as={Link} to="/booking" className="sidebar-nav-link" onClick={() => setIsMenuOpen(false)}>Цаг авах</Nav.Link>
                      <Nav.Link as={Link} to="/my-appointments" className="sidebar-nav-link" onClick={() => setIsMenuOpen(false)}>Захиалгын түүх</Nav.Link>
                    </Nav>

                    <div className="d-flex flex-column gap-3">
                      {isAuthenticated ? (
                        <>
                          <div className="d-flex align-items-center gap-2 text-secondary fw-medium p-3 bg-light rounded-3 mb-2">
                            <FiUser size={20} className="text-primary" />
                            <span className="fs-5">{displayName}</span>
                          </div>
                          <button onClick={() => { logout(); setIsMenuOpen(false); }} className="btn-sidebar-login d-flex align-items-center justify-content-center gap-2 text-danger border-danger">
                            <FiLogOut /> Гарах
                          </button>
                        </>
                      ) : (
                        <>
                          <Link to="/login" state={{ from: location }} className="btn-sidebar-login" onClick={() => setIsMenuOpen(false)}>
                            Нэвтрэх
                          </Link>
                          <Link to="/register" className="btn-sidebar-register" onClick={() => setIsMenuOpen(false)}>
                            Бүртгүүлэх
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </Container>
    </Navbar>
  );
}
