import React, { useState, useEffect } from "react";
import { FaMapMarkerAlt, FaLocationArrow } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX, FiFilter, FiMapPin } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import Input from "./ui/Input";
import MapDiscoveryModal from "./MapDiscoveryModal";
import { getClinics } from "../api/clinics";
import { isAdminRole, useAuthStore } from "../store/AuthStore";

const aimags = [
  "Архангай", "Баян-Өлгий", "Баянхонгор", "Булган", "Говь-Алтай",
  "Говьсүмбэр", "Дархан-Уул", "Дорнод", "Дорноговь", "Дундговь",
  "Завхан", "Орхон", "Өвөрхангай", "Өмнөговь", "Сүхбаатар",
  "Сэлэнгэ", "Төв", "Увс", "Ховд", "Хөвсгөл", "Хэнтий"
];

const mockResults = [
  { id: 1, name: "Интермед Эмнэлэг", logo: "🏥", city: "Улаанбаатар", district: "Хан-Уул" },
  { id: 2, name: "Грандмед Эмнэлэг", logo: "🏛️", city: "Улаанбаатар", district: "Хан-Уул" },
  { id: 3, name: "Сонгдо Эмнэлэг", logo: "🏥", city: "Улаанбаатар", district: "Чингэлтэй" },
  { id: 4, name: "Архангай Нэгдсэн Эмнэлэг", logo: "🏥", city: "Орон нутаг", province: "Архангай" },
  { id: 5, name: "Баян-Өлгий Оношилгоо Төв", logo: "🏛️", city: "Орон нутаг", province: "Баян-Өлгий" },
  { id: 6, name: "Баянхонгор Сувилал", logo: "🌿", city: "Орон нутаг", province: "Баянхонгор" },
  { id: 7, name: "Булган Төв Эмнэлэг", logo: "🏥", city: "Орон нутаг", province: "Булган" },
  { id: 8, name: "Говь-Алтай Нэгдсэн Эмнэлэг", logo: "🩹", city: "Орон нутаг", province: "Говь-Алтай" },
  { id: 9, name: "Говьсүмбэр Эмнэлэг", logo: "🏠", city: "Орон нутаг", province: "Говьсүмбэр" },
  { id: 10, name: "Дархан Нэгдсэн Эмнэлэг", logo: "🏥", city: "Орон нутаг", province: "Дархан-Уул" },
  { id: 11, name: "Дорнод Бүсийн Төв", logo: "🏛️", city: "Орон нутаг", province: "Дорнод" },
  { id: 12, name: "Дорноговь Оношилгоо", logo: "🔬", city: "Орон нутаг", province: "Дорноговь" },
  { id: 13, name: "Дундговь Эмнэлэг", logo: "🏥", city: "Орон нутаг", province: "Дундговь" },
  { id: 14, name: "Завхан Төв Эмнэлэг", logo: "🏛️", city: "Орон нутаг", province: "Завхан" },
  { id: 15, name: "Орхон Медипас Эмнэлэг", logo: "🥼", city: "Орон нутаг", province: "Орхон" },
  { id: 16, name: "Өвөрхангай Нэгдсэн", logo: "🏥", city: "Орон нутаг", province: "Өвөрхангай" },
  { id: 17, name: "Өмнөговь Тавантолгой Эмнэлэг", logo: "🏗️", city: "Орон нутаг", province: "Өмнөговь" },
  { id: 18, name: "Сүхбаатар Аймгийн Эмнэлэг", logo: "🏙️", city: "Орон нутаг", province: "Сүхбаатар" },
  { id: 19, name: "Сэлэнгэ Нэгдсэн Эмнэлэг", logo: "🏥", city: "Орон нутаг", province: "Сэлэнгэ" },
  { id: 20, name: "Төв Аймгийн Оношилгоо", logo: "🔬", city: "Орон нутаг", province: "Төв" },
  { id: 21, name: "Увс Баруун Тур Эмнэлэг", logo: "🏥", city: "Орон нутаг", province: "Увс" },
  { id: 22, name: "Ховд Бүсийн Төв Эмнэлэг", logo: "🏛️", city: "Орон нутаг", province: "Ховд" },
  { id: 23, name: "Хөвсгөл Далай Эмнэлэг", logo: "🌊", city: "Орон нутаг", province: "Хөвсгөл" },
  { id: 24, name: "Хэнтий Хаан Эмнэлэг", logo: "👑", city: "Орон нутаг", province: "Хэнтий" },
  { id: 25, name: "Улсын Нэгдүгээр Төв Эмнэлэг", logo: "🏥", city: "Улаанбаатар", district: "Сүхбаатар" },
];

import { createPortal } from "react-dom";

const normalizeTenant = (tenant) => {
  const name = tenant.name ?? tenant.Name ?? "Нэргүй эмнэлэг";

  return {
    id: tenant.id ?? tenant.Id,
    name,
    logo: name.trim().charAt(0).toUpperCase() || "Э",
  };
};

const getItemMeta = (item, isAdmin) => {
  if (isAdmin) return null;

  return item.city === "Улаанбаатар"
    ? `${item.city}, ${item.district}`
    : `${item.province}`;
};

const openHospital = ({ navigate, item, isAdmin, onClose, setQuery }) => {
  setQuery("");
  navigate(
    isAdmin ? `/booking?clinicId=${encodeURIComponent(item.id)}` : "/booking",
    { state: { hospital: item } }
  );
  onClose();
};

const SearchResultsState = ({ isLoading, error, onRetry }) => {
  if (isLoading) {
    return <div className="tenant-search-state">Эмнэлгийн жагсаалтыг уншиж байна...</div>;
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
  isAdmin,
  isLoading,
  error,
  onRetry,
}) => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all'); // 'all', 'city', 'locality'
  const [selectedAimag, setSelectedAimag] = useState("Бүх аймаг");
  const [showAimagDropdown, setShowAimagDropdown] = useState(false);
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
    <motion.div
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

        {!isAdmin && (
          <button
            onClick={() => setShowAimagDropdown(!showAimagDropdown)}
            className="search-modal-filter-btn"
          >
            <FiFilter size={24} />
          </button>
        )}

        {/* Aimag Dropdown Overlay */}
        <AnimatePresence>
          {!isAdmin && showAimagDropdown && (
            <motion.div
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
                  {["Бүх аймаг", ...aimags].map((aimag) => (
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isAdmin && (
        <div className="search-modal-chips-container no-scrollbar">
          {[
            { id: 'all', label: 'Бүгд' },
            { id: 'city', label: 'Улаанбаатар' },
            { id: 'locality', label: 'Орон нутаг' },
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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="hospital-list-container no-scrollbar"
      >
        <div className="flex flex-col">
          <SearchResultsState
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
          />
          {!isLoading && !error && items
            .filter(item => {
              const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
              if (isAdmin) return matchesQuery;
              if (filterType === 'all') return matchesQuery;
              if (filterType === 'city') return matchesQuery && item.city === 'Улаанбаатар';
              if (filterType === 'locality') {
                if (selectedAimag === "Бүх аймаг") return matchesQuery && item.city === 'Орон нутаг';
                return matchesQuery && item.province === selectedAimag;
              }
              return matchesQuery;
            })
            .map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  openHospital({ navigate, item, isAdmin, onClose, setQuery });
                }}
                className="hospital-list-item"
              >
                <div className="hospital-item-logo-box">
                  {item.logo}
                </div>

                <div className="hospital-item-info">
                  <div className="hospital-item-name">
                    {item.name}
                  </div>
                  {!isAdmin ? (
                    <div className="hospital-item-meta">
                      {getItemMeta(item, isAdmin)}
                    </div>
                  ) : null}
                </div>
              </button>
            ))}
          {!isLoading && !error && items.length === 0 && (
            <div className="tenant-search-state">Эмнэлэг олдсонгүй.</div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

const PremiumSearchOverlay = ({
  isOpen,
  onClose,
  query,
  setQuery,
  items,
  isAdmin,
  isLoading,
  error,
  onRetry,
}) => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('all'); // 'all', 'city', 'locality'

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

  const filteredItems = items.filter(item => {
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
    if (isAdmin) return matchesQuery;
    if (filterType === 'all') return matchesQuery;
    if (filterType === 'city') return matchesQuery && item.city === 'Улаанбаатар';
    if (filterType === 'locality') return matchesQuery && item.city === 'Орон нутаг';
    return matchesQuery;
  });

  return createPortal(
    <div className="search-premium-overlay" onClick={onClose}>
      <motion.div
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
          {!isAdmin && (
            <motion.div variants={itemVariants} className="d-flex gap-1 mb-4">
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
            </motion.div>
          )}
          {/* 
          <motion.div variants={itemVariants} className="search-section-title">
            {query.length > 0 ? 'Хайлтын үр дүн' : 'Онцлох эмнэлгүүд'}
          </motion.div> */}

          <SearchResultsState
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
          />
          {!isLoading && !error && filteredItems.length > 0 ? (
            <div className="search-popular-grid">
              {filteredItems.slice(0, 10).map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  onClick={() => {
                    openHospital({ navigate, item, isAdmin, onClose, setQuery });
                  }}
                  className="search-popular-card"
                >
                  <div className="search-popular-logo">{item.logo}</div>
                  <div>
                    <div className="search-popular-name">{item.name}</div>
                    {!isAdmin ? (
                      <div className="search-popular-type">{getItemMeta(item, isAdmin)}</div>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : !isLoading && !error ? (
            <div className="py-10 text-center text-gray-400 font-medium">
              Ийм эмнэлэг олдсонгүй
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default function SearchBar() {
  const role = useAuthStore((state) => state.role);
  const isAdmin = isAdminRole(role);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [showPremiumOverlay, setShowPremiumOverlay] = useState(false);
  const [showMobileOverlay, setShowMobileOverlay] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [adminTenants, setAdminTenants] = useState([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [tenantsError, setTenantsError] = useState("");
  const [tenantReloadKey, setTenantReloadKey] = useState(0);

  useEffect(() => {
    if (!isAdmin) {
      setAdminTenants([]);
      setIsLoadingTenants(false);
      setTenantsError("");
      return undefined;
    }

    const controller = new AbortController();
    setIsLoadingTenants(true);
    setTenantsError("");

    getClinics({ signal: controller.signal })
      .then((data) => {
        const tenants = Array.isArray(data) ? data : data?.items || data?.data || [];
        setAdminTenants(tenants.map(normalizeTenant));
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setAdminTenants([]);
          setTenantsError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingTenants(false);
        }
      });

    return () => controller.abort();
  }, [isAdmin, tenantReloadKey]);

  const searchItems = isAdmin ? adminTenants : mockResults;
  const retryTenants = () => setTenantReloadKey((value) => value + 1);

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
                placeholder="Google map ашиглах"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onClick={() => setShowMapModal(true)}
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
            isAdmin={isAdmin}
            isLoading={isLoadingTenants}
            error={tenantsError}
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
            isAdmin={isAdmin}
            isLoading={isLoadingTenants}
            error={tenantsError}
            onRetry={retryTenants}
          />
        )}
        {showMapModal && (
          <MapDiscoveryModal
            isOpen={showMapModal}
            onClose={() => setShowMapModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

