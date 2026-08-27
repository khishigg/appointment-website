import { Container } from "react-bootstrap";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const logoModules = import.meta.glob("../assets/logos/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  import: "default",
});

const knownLogoMeta = {
  "1787542192.jpg": { layout: "portrait" },
  "1787542656.jpg": { layout: "square" },
  "1787542686.jpg": { layout: "square" },
  "1787542719.jpg": { layout: "landscape" },
  "1787542735.jpg": { layout: "landscape", scale: 1.16 },
  "1787542748.jpg": { layout: "landscape" },
  "1787542760.jpg": { layout: "landscape" },
  "1787542769.jpg": { layout: "square" },
  "1787542781.jpg": { layout: "landscape" },
  "1787542968.jpg": { layout: "square" },
  "1787543202.jpg": { layout: "square" },
  "1787543490.jpg": { layout: "square" },
  "1787543632.jpg": { layout: "square" },
  "1787544007.jpg": { layout: "square" },
  "1787544645.jpg": { layout: "square" },
  "1787544714.jpg": { layout: "landscape", scale: 1.12 },
  "1787544833.jpg": { layout: "square" },
  "1787544964.jpg": { layout: "square" },
  "1787548344.jpg": { layout: "landscape", scale: 1.12 },
  "global_greyscale.png": { alt: "Global", layout: "landscape" },
  "gurvansor_greyscale.png": { alt: "Gurvan Sor", layout: "landscape" },
  "niislel_greyscale (1).png": { alt: "Niislel", layout: "landscape" },
  "niislel_greyscale.png": { alt: "Niislel", layout: "landscape" },
  "premiumedited1.png": { alt: "Premium", layout: "landscape" },
  "prodent-greyscale.png": { alt: "ProDent", layout: "landscape" },
  "uranlombo-greyscale.png": { alt: "Uran Lombo", layout: "landscape" },
};

const getFileName = (path) => path.split("/").pop() || "";
const isTimestampFile = (fileName) => /^\d+\.[^.]+$/.test(fileName);

const partnerLogos = Object.entries(logoModules)
  .map(([path, src]) => {
    const fileName = getFileName(path);
    const meta = knownLogoMeta[fileName] || {};

    return {
      id: path,
      src,
      fileName,
      alt: meta.alt || "Эмнэлгийн лого",
      layout: meta.layout,
      scale: meta.scale || 1,
    };
  })
  .filter((logo, index, logos) => logos.findIndex(({ src }) => src === logo.src) === index)
  .sort((first, second) => {
    const firstIsTimestamp = isTimestampFile(first.fileName);
    const secondIsTimestamp = isTimestampFile(second.fileName);

    if (firstIsTimestamp !== secondIsTimestamp) return Number(firstIsTimestamp) - Number(secondIsTimestamp);

    return first.fileName.localeCompare(second.fileName);
  });

const createLogoRows = (rowCount) => {
  const rows = Array.from({ length: rowCount }, () => []);

  partnerLogos.forEach((logo, index) => {
    rows[index % rows.length].push(logo);
  });

  return rows;
};

const desktopLogoRows = createLogoRows(3);
const mobileLogoRows = createLogoRows(4);

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

const LogoRows = ({ rows, className }) => (
  <div className={`partner-logo-rows ${className}`} aria-label="Бүртгэлтэй эмнэлгүүдийн лого">
    {rows.map((logos, rowIndex) => {
      const direction = rowDirections[rowIndex];

      return (
        <div key={direction + rowIndex} className={`partner-logo-row partner-logo-row--${direction}`}>
          <div className="partner-logo-row__track">
            {[false, true].map((isDuplicate) => (
              <ul
                key={isDuplicate ? "duplicate" : "original"}
                className="partner-logo-row__segment"
                aria-hidden={isDuplicate || undefined}
              >
                {logos.map((logo) => (
                  <li key={`${logo.id}-${isDuplicate ? "duplicate" : "original"}`} className="partner-logo-card">
                    <img
                      src={logo.src}
                      alt={isDuplicate ? "" : logo.alt}
                      className="partner-logo-img"
                      data-layout={logo.layout}
                      style={{ "--partner-logo-scale": logo.scale }}
                      loading="lazy"
                      onLoad={handleLogoLoad}
                    />
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

export default function PartnerLogos() {
  return (
    <section className="partner-logos-section" aria-labelledby="partner-logos-title">
      <Container className="partner-logos-section__container">
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

        <LogoRows rows={desktopLogoRows} className="partner-logo-rows--desktop" />
        <LogoRows rows={mobileLogoRows} className="partner-logo-rows--mobile" />
      </Container>
    </section>
  );
}
