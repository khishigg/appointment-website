import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiX, FiFilter } from "react-icons/fi";
import { motion as Motion, AnimatePresence } from "framer-motion";
import Input from "./ui/Input";
import MapDiscoveryModal from "./MapDiscoveryModal";
import { createPortal } from "react-dom";
import { getClinics, resolveClinicAssetUrl } from "../api/clinics";
import { getCoordinatePair } from './map/locationData';
import { useMapOverlayStore } from '../store/MapOverlayStore';

const ALL_AIMAGS = "Бүх аймаг";


const normalizeTenant = (tenant) => {
  const position = getCoordinatePair(tenant);
  const name = tenant.name ?? tenant.Name ?? "Нэргүй эмнэлэг";
  const logo = tenant.logo ?? tenant.Logo ?? "";

  return {
    id: tenant.id ?? tenant.Id,
    phone: tenant.phoneNumber ?? tenant.PhoneNumber ?? tenant.phone ?? tenant.Phone ?? "",
    position,
    bookingEnabled: tenant.bookingEnabled ?? tenant.BookingEnabled ?? true,
    name,
    logoUrl: resolveClinicAssetUrl(logo),
    logoInitial: name.trim().charAt(0).toUpperCase() || "Э",
    address: tenant.address ?? tenant.Address ?? "",
    city: tenant.city ?? tenant.City ?? "",
    province:
      tenant.province ?? tenant.Province ?? tenant.state ?? tenant.State ?? "",
  };
};

// Backend хаягийг латинаар буцаадаг ("… , Ulaanbaatar 16060") тул хоёр бичлэгт тэсвэртэй.
const UB_PATTERN = /ulaanbaatar|улаанбаатар/i;
const isUlaanbaatar = (item) =>
  UB_PATTERN.test(item.city) || (!item.city && UB_PATTERN.test(item.address));

// Байршлын өгөгдөл ирдэггүй бол шүүлтүүрийг ОГТ харуулахгүй (хуурмаг chip үүсгэхгүй).
const hasLocationData = (items) =>
  items.some((item) => item.city || item.province || UB_PATTERN.test(item.address));

// Аймгийн жагсаалтыг hardcode хийхгүй — ирсэн датагаас гаргана.
const getProvinces = (items) =>
  [...new Set(items.map((item) => item.province).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "mn")
  );

const matchesFilter = (item, filterType, selectedAimag) => {
  if (filterType === "city") return isUlaanbaatar(item);

  if (filterType === "locality") {
    if (selectedAimag !== ALL_AIMAGS) return item.province === selectedAimag;
    return Boolean(item.province) || (!isUlaanbaatar(item) && Boolean(item.city));
  }

  // "Бусад" — УБ ч биш, аймаг нь ч тодорхойлогдоогүй. Өмнө нь энэ салаа
  // БАЙХГҮЙ байсан тул "Бүгд"-тэй ижил ажилладаг алдаатай байв.
  if (filterType === "others") return !isUlaanbaatar(item) && !item.province;

  return true;
};

const getItemMeta = (item) => item.address || "";

const openHospital = ({ navigate, item, onClose, setQuery }) => {
  if (!item.bookingEnabled) return;

  setQuery("");
  // clinicId-г ҮРГЭЛЖ дамжуулна — өмнө нь зочин үед дамждаггүй тул BookingPage
  // юу ч ачаалахгүй хоосон нээгддэг байв.
  navigate(`/booking?clinicId=${encodeURIComponent(item.id)}`, {
    state: { hospital: item },
  });
  onClose();
};

/** Эмнэлгийн лого — дугуй container дотор төвлөрсөн зураг, алдвал/байхгүй бол нэрийн эхний үсэг. */
const ClinicLogo = ({ item }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [item.logoUrl]);

  if (!item.logoUrl || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-full border border-gray-200 bg-gray-50 font-semibold text-gray-600">
        {item.logoInitial}
      </div>
    );
  }

  return (
    <img
      src={item.logoUrl}
      alt={`${item.name} logo`}
      aria-hidden="true"
      className="h-full w-full rounded-full object-cover"
      onError={() => setFailed(true)}
    />
  );
};

const SearchResultsState = ({ isLoading, error, needsAuth, onRetry }) => {
  if (isLoading) {
    return <div className="tenant-search-state">Эмнэлгийн жагсаалтыг уншиж байна...</div>;
  }

  // 401 — зочныг хуудаснаас нь шидэхгүй, оронд нь нэвтрэх санал болгоно.
  if (needsAuth) {
    return (
      <div className="tenant-search-state" role="alert">
        <span>Эмнэлгийн жагсаалтыг харахын тулд нэвтэрнэ үү.</span>
        <Link to="/login">Нэвтрэх</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tenant-search-state tenant-search-state--error" role="alert">
        <span>{error}</span>
        <button type="button" onClick={onRetry}>Дахин оролдох</button>
      </div>
    );
  }

  return null;
};

const MobileSearchOverlay = ({
  isOpen,
  onClose,
  query,
  setQuery,
  items,
  isLoading,
  error,
  needsAuth,
  onRetry,
}) => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'city' | 'locality' | 'others'
  const [selectedAimag, setSelectedAimag] = useState(ALL_AIMAGS);
  const [showAimagDropdown, setShowAimagDropdown] = useState(false);

  // Шүүлтүүр нь ҮҮРГЭЭР биш, ДАТАГААР удирдагдана: байршлын мэдээлэл ирээгүй бол
  // chip/dropdown огт харагдахгүй (хуурмаг шүүлтүүр үзүүлэхгүй).
  const showFilters = hasLocationData(items);
  const provinces = getProvinces(items);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };

  return createPortal(
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 search-modal-container"
    >
      <div className="search-modal-header">
        <h2 className="search-modal-title">Эмнэлэг сонгох</h2>
        <button onClick={onClose} className="search-modal-close">
          <FiX size={28} />
        </button>
      </div>

      <div className="search-modal-search-row">
        <div className="search-modal-input-wrapper">
          <FiSearch className="search-modal-input-icon" size={20} />
          <input
            autoFocus
            type="text"
            className="search-modal-input"
            placeholder="Эмнэлэг хайх..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {provinces.length > 0 && (
          <button
            onClick={() => setShowAimagDropdown(!showAimagDropdown)}
            className="search-modal-filter-btn"
          >
            <FiFilter size={24} />
          </button>
        )}

        {/* Aimag Dropdown Overlay */}
        <AnimatePresence>
          {provinces.length > 0 && showAimagDropdown && (
            <Motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="position-absolute end-0 top-100 mt-2 w-100 px-5"
              style={{ zIndex: 120, right: 0 }}
            >
              <div
                className="bg-white rounded-2xl p-3 shadow-2xl border border-gray-100 overflow-y-auto no-scrollbar"
                style={{ maxHeight: '320px', width: '100%' }}
              >
                <div className="grid grid-cols-2 gap-2">
                  {[ALL_AIMAGS, ...provinces].map((aimag) => (
                    <button
                      key={aimag}
                      onClick={() => {
                        setSelectedAimag(aimag);
                        setFilterType('locality');
                        setShowAimagDropdown(false);
                      }}
                      className={`text-left px-3 py-2.5 rounded-xl text-[14px] transition-colors ${selectedAimag === aimag
                        ? 'bg-primary text-white fw-bold shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {aimag}
                    </button>
                  ))}
                </div>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {showFilters && (
        <div className="search-modal-chips-container no-scrollbar">
          {[
            { id: 'all', label: 'Бүгд' },
            { id: 'city', label: 'Улаанбаатар' },
            { id: 'locality', label: 'Орон нутаг' },
            { id: 'others', label: 'Бусад' },
          ].map((chip) => (
            <button
              key={chip.id}
              onClick={() => setFilterType(chip.id)}
              className={`search-modal-chip ${filterType === chip.id ? 'active' : ''}`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      <Motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="hospital-list-container no-scrollbar"
      >
        <div className="flex flex-col">
          <SearchResultsState
            isLoading={isLoading}
            error={error}
            needsAuth={needsAuth}
            onRetry={onRetry}
          />
          {!isLoading && !error && items
            .filter((item) =>
              item.name.toLowerCase().includes(query.toLowerCase()) &&
              matchesFilter(item, filterType, selectedAimag)
            )
            .map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  openHospital({ navigate, item, onClose, setQuery });
                }}
                className="hospital-list-item"
                disabled={!item.bookingEnabled}
              >
                <div className="hospital-item-logo-box">
                  <ClinicLogo item={item} />
                </div>

                <div className="hospital-item-info">
                  <div className="hospital-item-name">
                    {item.name}
                  </div>
                  {getItemMeta(item) ? (
                    <div className="hospital-item-meta">
                      {getItemMeta(item)}
                    </div>
                  ) : null}
                  {!item.bookingEnabled ? (
                    <div className="hospital-item-meta">Онлайн цаг авахгүй</div>
                  ) : null}
                </div>
              </button>
            ))}
          {!isLoading && !error && items.length === 0 && (
            <div className="tenant-search-state">Эмнэлэг олдсонгүй.</div>
          )}
        </div>
      </Motion.div>
    </Motion.div>,
    document.body
  );
};

const PremiumSearchOverlay = ({
  isOpen,
  onClose,
  query,
  setQuery,
  items,
  isLoading,
  error,
  needsAuth,
  onRetry,
}) => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'city' | 'locality' | 'others'
  const showFilters = hasLocationData(items);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isOpen) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2, staggerChildren: 0.03 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()) &&
    matchesFilter(item, filterType, ALL_AIMAGS)
  );

  return createPortal(
    <div className="search-premium-overlay" onClick={onClose}>
      <Motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="search-premium-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="search-modal-close-top">
          <FiX size={20} />
        </button>

        <div className="search-premium-header">
          <h2 className="search-premium-title">Хайлт</h2>
          <div className="search-premium-box">
            <FiSearch className="text-gray-400" size={20} />
            <input
              autoFocus
              type="text"
              className="search-premium-input"
              placeholder="Эмнэлгийн нэр, мэргэжил..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="search-premium-content no-scrollbar">
          {/* 📍 Location Filter Chips (Desktop Version) */}
          {showFilters && (
            <Motion.div variants={itemVariants} className="d-flex gap-1 mb-4">
              {[
                { id: 'all', label: 'Бүгд' },
                { id: 'city', label: 'Улаанбаатар' },
                { id: 'locality', label: 'Орон нутаг' },
                { id: 'others', label: 'Бусад' },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setFilterType(chip.id)}
                  className={`px-5 py-2.5 rounded-full text-[12px] font-bold transition-all border ${filterType === chip.id
                    ? 'bg-[#007AFF] text-white border-transparent shadow-md'
                    : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                    }`}
                >
                  {chip.label}
                </button>
              ))}
            </Motion.div>
          )}
          {/* 
          <motion.div variants={itemVariants} className="search-section-title">
            {query.length > 0 ? 'Хайлтын үр дүн' : 'Онцлох эмнэлгүүд'}
          </motion.div> */}

          <SearchResultsState
            isLoading={isLoading}
            error={error}
            needsAuth={needsAuth}
            onRetry={onRetry}
          />
          {!isLoading && !error && filteredItems.length > 0 ? (
            <div className="search-popular-grid">
              {filteredItems.slice(0, 10).map((item) => (
                <Motion.button
                  key={item.id}
                  type="button"
                  disabled={!item.bookingEnabled}
                  variants={itemVariants}
                  onClick={() => {
                    openHospital({ navigate, item, onClose, setQuery });
                  }}
                  className="search-popular-card"
                >
                  <div className="search-popular-logo">
                    <ClinicLogo item={item} />
                  </div>
                  <div>
                    <div className="search-popular-name">{item.name}</div>
                    {getItemMeta(item) ? (
                      <div className="search-popular-type">{getItemMeta(item)}</div>
                    ) : null}
                  </div>
                  {!item.bookingEnabled ? (
                    <span className="search-popular-type">Онлайн цаг авахгүй</span>
                  ) : null}
                </Motion.button>
              ))}
            </div>
          ) : !isLoading && !error ? (
            <div className="py-10 text-center text-gray-400 font-medium">
              Ийм эмнэлэг олдсонгүй
            </div>
          ) : null}
        </div>
      </Motion.div>
    </div>,
    document.body
  );
};

export default function SearchBar() {
  const setMapOverlayOpen = useMapOverlayStore((state) => state.setMapOverlayOpen);
  const [query, setQuery] = useState("");
  const [showPremiumOverlay, setShowPremiumOverlay] = useState(false);
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);
  const [clinicsError, setClinicsError] = useState("");
  const [needsAuth, setNeedsAuth] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Үүргээс ҮЛ ХАМААРАН бүх хэрэглэгчид бодит дата (mock бүрэн устсан).
  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingClinics(true);
    setClinicsError("");
    setNeedsAuth(false);

    // API layer route солихгүй; 401-ийг модал дотор өөрсдөө боловсруулна.
    getClinics({ signal: controller.signal })
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.items || data?.data || [];
        setClinics(list.map(normalizeTenant));
      })
      .catch((error) => {
        if (error.name === "AbortError") return;

        setClinics([]);
        if (error.status === 401) {
          setNeedsAuth(true);
        } else {
          setClinicsError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingClinics(false);
        }
      });

    return () => controller.abort();
  }, [reloadKey]);

  const searchItems = clinics;
  const retryTenants = () => setReloadKey((value) => value + 1);
  const openMapModal = () => {
    setMapOverlayOpen(true);
    setShowMapModal(true);
  };
  const closeMapModal = () => {
    setShowMapModal(false);
    setMapOverlayOpen(false);
  };

  useEffect(() => () => setMapOverlayOpen(false), [setMapOverlayOpen]);

  const handleSearch = () => {
    if (window.innerWidth < 768) {
      setShowMobileOverlay(true);
    } else {
      setShowPremiumOverlay(true);
    }
  };

  return (
    <>
      <div className={`search-island-wrapper`}>
        <div className="search-inner-wrapper d-flex flex-column flex-md-row align-items-stretch align-items-md-center gap-0">

          {/* 🔍 Search Input Wrapper (50%) */}
          <div className="search-input-section flex-grow-1">
            <Input
              placeholder="Эмнэлгийн нэрээр хайх"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={() => {
                if (window.innerWidth < 768) {
                  setShowMobileOverlay(true);
                } else {
                  setShowPremiumOverlay(true);
                }
              }}
              readOnly // Always open overlay for unified feel
              className="search-main-input border-0 shadow-none ps-0 cursor-pointer"
              containerClassName="mb-0 w-100"
              style={{ fontSize: "1rem" }}
            />
          </div>

          {/* 📏 Divider */}
          <div className="d-none d-md-block" style={{ height: '30px', width: '1px', background: 'rgba(0,0,0,0.08)', margin: '0 1.5rem' }}></div>

          {/* 📍 Location Input Sub-Island (50%) */}
          <div className="location-section flex-grow-1 d-flex align-items-center">
            <div className="location-sub-island d-flex align-items-center w-100">
              <Input
                placeholder="Газрын зургаар хайх"
                value=""
                onClick={openMapModal}
                readOnly
                className="location-inner-input border-0 shadow-none cursor-pointer hover:bg-gray-50 transition-colors"
                containerClassName="mb-0 w-100"
                style={{ fontSize: "1rem" }}
              />
            </div>
          </div>

          <button
            className="search-btn-primary ms-md-2"
            onClick={handleSearch}
            aria-label="Search"
          >
            <FiSearch size={18} className="search-btn-icon " />
            <span className="d-md-none fw-bold">Хайх</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showMobileOverlay && (
          <MobileSearchOverlay
            isOpen={showMobileOverlay}
            onClose={() => setShowMobileOverlay(false)}
            query={query}
            setQuery={setQuery}
            items={searchItems}
            isLoading={isLoadingClinics}
            error={clinicsError}
            needsAuth={needsAuth}
            onRetry={retryTenants}
          />
        )}
        {showPremiumOverlay && (
          <PremiumSearchOverlay
            isOpen={showPremiumOverlay}
            onClose={() => setShowPremiumOverlay(false)}
            query={query}
            setQuery={setQuery}
            items={searchItems}
            isLoading={isLoadingClinics}
            error={clinicsError}
            needsAuth={needsAuth}
            onRetry={retryTenants}
          />
        )}
        {showMapModal && (
          <MapDiscoveryModal
            isOpen={showMapModal}
            onClose={closeMapModal}
            clinics={clinics}
          />
        )}
      </AnimatePresence>
    </>
  );
}

