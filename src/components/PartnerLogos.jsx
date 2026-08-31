import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiRefreshCw } from "react-icons/fi";
import { Link } from "react-router-dom";

const MOBILE_ROW_COUNT = 4;
const DESKTOP_ROW_COUNT = 3;
const STATIC_LOGO_LIMIT = 3;
const MOBILE_SLOT_STRIDE = 108;
const DESKTOP_SLOT_STRIDE = 160;
const rowDirections = ["left", "right", "left", "right"];

const handleLogoLoad = (event) => {
  const image = event.currentTarget;

  if (image.dataset.layout) return;

  const ratio = image.naturalWidth && image.naturalHeight
    ? image.naturalWidth / image.naturalHeight
    : 1;

  image.dataset.layout = ratio >= 1.4
    ? "landscape"
    : ratio <= 0.8
      ? "portrait"
      : "square";
};

const normalizeClinicLogos = (clinics) => {
  const seenUrls = new Set();

  return clinics.reduce((logos, clinic, index) => {
    const src = String(clinic?.logoUrl || "").trim();
    if (!src || seenUrls.has(src)) return logos;

    seenUrls.add(src);
    const name = String(clinic?.name || "Эмнэлэг").trim() || "Эмнэлэг";
    const id = clinic?.id ?? index;

    logos.push({
      id: `${id}:${src}`,
      src,
      alt: `${name} лого`,
    });

    return logos;
  }, []);
};

const getAdaptiveRowCount = (logoCount, maxRows) => {
  if (logoCount <= STATIC_LOGO_LIMIT) return 1;
  return Math.min(maxRows, Math.ceil(logoCount / 3));
};

const fillLogoRow = (logos, targetCount) => {
  if (logos.length === 0) return [];

  const itemCount = Math.max(logos.length, targetCount);
  return Array.from({ length: itemCount }, (_, index) => ({
    logo: logos[index % logos.length],
    instanceIndex: index,
    decorative: index >= logos.length,
  }));
};

const createLogoRows = (logos, maxRows, targetItemsPerRow, animated) => {
  const rowCount = getAdaptiveRowCount(logos.length, maxRows);
  const rows = Array.from({ length: rowCount }, () => []);

  logos.forEach((logo, index) => {
    rows[index % rowCount].push(logo);
  });

  return rows
    .filter((row) => row.length > 0)
    .map((row) => fillLogoRow(row, animated ? targetItemsPerRow : row.length));
};

const LogoRows = ({ rows, className, animated, onLogoError }) => (
  <div
    className={`partner-logo-rows ${animated ? "" : "partner-logo-rows--static"} ${className}`}
    aria-label="Бүртгэлтэй эмнэлгүүдийн лого"
  >
    {rows.map((logos, rowIndex) => {
      const direction = rowDirections[rowIndex];
      const segments = animated ? [false, true] : [false];

      return (
        <div
          key={`${direction}-${rowIndex}`}
          className={`partner-logo-row ${animated ? `partner-logo-row--${direction}` : "partner-logo-row--static"}`}
        >
          <div className="partner-logo-row__track">
            {segments.map((isDuplicate) => (
              <ul
                key={isDuplicate ? "duplicate" : "original"}
                className="partner-logo-row__segment"
                aria-hidden={isDuplicate || undefined}
              >
                {logos.map(({ logo, instanceIndex, decorative }) => (
                  <li
                    key={`${logo.id}-${instanceIndex}-${isDuplicate ? "duplicate" : "original"}`}
                    className="partner-logo-slot"
                    aria-hidden={decorative || undefined}
                  >
                    <span className="partner-logo-slot__media">
                      <img
                        src={logo.src}
                        alt={isDuplicate || decorative ? "" : logo.alt}
                        className="partner-logo-img"
                        loading="lazy"
                        onLoad={handleLogoLoad}
                        onError={() => onLogoError(logo.id)}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

const LogoLoadingState = () => (
  <div className="partner-logo-loading" role="status" aria-live="polite">
    <span className="sr-only">Эмнэлгүүдийн логог уншиж байна</span>
    {Array.from({ length: 8 }, (_, index) => (
      <span key={index} className="partner-logo-skeleton" aria-hidden="true" />
    ))}
  </div>
);

const LogoMessageState = ({ message, onRetry, isError = false }) => (
  <div className="partner-logo-state" role={isError ? "alert" : "status"}>
    <p>{message}</p>
    {typeof onRetry === "function" ? (
      <button type="button" onClick={onRetry} className="partner-logo-state__retry">
        <FiRefreshCw aria-hidden="true" />
        Дахин оролдох
      </button>
    ) : null}
  </div>
);

export default function PartnerLogos({ clinicData }) {
  const isLoading = clinicData?.isLoading === true;
  const hasLoadError = Boolean(clinicData?.error || clinicData?.needsAuth);
  const retry = clinicData?.retry;
  const [failedLogoIds, setFailedLogoIds] = useState(() => new Set());
  const [viewportWidth, setViewportWidth] = useState(() => (
    typeof window === "undefined" ? 1280 : window.innerWidth
  ));

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", updateViewportWidth);
    return () => window.removeEventListener("resize", updateViewportWidth);
  }, []);

  const apiLogos = useMemo(
    () => normalizeClinicLogos(Array.isArray(clinicData?.clinics) ? clinicData.clinics : []),
    [clinicData?.clinics]
  );
  const logos = useMemo(
    () => apiLogos.filter((logo) => !failedLogoIds.has(logo.id)),
    [apiLogos, failedLogoIds]
  );
  const animated = logos.length > STATIC_LOGO_LIMIT;
  const mobileTargetCount = Math.ceil(Math.min(viewportWidth, 767) / MOBILE_SLOT_STRIDE) + 1;
  const desktopTargetCount = Math.ceil(Math.min(Math.max(viewportWidth, 768), 1320) / DESKTOP_SLOT_STRIDE) + 1;
  const mobileRows = useMemo(
    () => createLogoRows(logos, MOBILE_ROW_COUNT, mobileTargetCount, animated),
    [animated, logos, mobileTargetCount]
  );
  const desktopRows = useMemo(
    () => createLogoRows(logos, DESKTOP_ROW_COUNT, desktopTargetCount, animated),
    [animated, desktopTargetCount, logos]
  );

  const handleLogoError = (logoId) => {
    setFailedLogoIds((current) => {
      if (current.has(logoId)) return current;
      const next = new Set(current);
      next.add(logoId);
      return next;
    });
  };

  let logoContent;
  if (isLoading) {
    logoContent = <LogoLoadingState />;
  } else if (hasLoadError) {
    logoContent = (
      <LogoMessageState
        message="Эмнэлгүүдийн мэдээллийг ачаалж чадсангүй."
        onRetry={retry}
        isError
      />
    );
  } else if (logos.length === 0) {
    logoContent = <LogoMessageState message="Одоогоор харуулах эмнэлгийн лого алга." />;
  } else {
    logoContent = (
      <>
        <LogoRows
          rows={desktopRows}
          className="partner-logo-rows--desktop"
          animated={animated}
          onLogoError={handleLogoError}
        />
        <LogoRows
          rows={mobileRows}
          className="partner-logo-rows--mobile"
          animated={animated}
          onLogoError={handleLogoError}
        />
      </>
    );
  }

  return (
    <section className="partner-logos-section" aria-labelledby="partner-logos-title">
      <div className="page-container partner-logos-section__container">
        <header className="partner-logos-header">
          <h2 id="partner-logos-title">Манай программд бүртгэлтэй эмнэлгүүд</h2>
          <p className="partner-logos-header__description">
            Олон клиник, эмнэлэг манай платформыг ашиглан цаг захиалгаа хялбар удирдаж,
            өвчтөнүүддээ илүү хурдан, чанартай үйлчилгээ үзүүлж байна.
          </p>
          <Link to="/register" className="partner-logos-header__action">
            <span>Бидэнтэй нэгдэх</span>
            <FiArrowRight aria-hidden="true" />
          </Link>
        </header>

        {logoContent}
      </div>
    </section>
  );
}
