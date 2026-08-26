import { Container } from "react-bootstrap";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const logoModules = import.meta.glob("../assets/logos/*.{png,jpg,jpeg,webp,svg}", {
  eager: true,
  import: "default",
});

const knownLogoAlt = {
  "global_greyscale.png": "Global",
  "gurvansor_greyscale.png": "Gurvan Sor",
  "niislel_greyscale.png": "Niislel",
  "premiumedited1.png": "Premium",
  "prodent-greyscale.png": "ProDent",
  "uranlombo-greyscale.png": "Uran Lombo",
};

const getFileName = (path) => path.split("/").pop() || "";
const isTimestampFile = (fileName) => /^\d+\.[^.]+$/.test(fileName);

const partnerLogos = Object.entries(logoModules)
  .map(([path, src]) => {
    const fileName = getFileName(path);

    return {
      id: path,
      src,
      fileName,
      alt: knownLogoAlt[fileName] || "Эмнэлгийн лого",
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
                      loading="lazy"
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
