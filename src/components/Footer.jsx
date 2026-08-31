import { createElement } from "react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { FiGlobe } from "react-icons/fi";
import { Link } from "react-router-dom";
import ashidLogo from "../assets/ASHID-LOGO.png";

const products = ["Ashid Desktop", "Ashid Website", "Ashid Appointment"];

const specialties = [
  "Шүдний",
  "Нүдний",
  "Хүүхдийн",
  "Мэдрэлийн",
  "Гоо сайхны",
  "Мал эмнэлэг",
];

const socialChannels = [
  { label: "Facebook", icon: FaFacebookF },
  { label: "Instagram", icon: FaInstagram },
  { label: "YouTube", icon: FaYoutube },
  { label: "Website", icon: FiGlobe },
];

export default function Footer() {
  return (
    <footer className="footer" aria-label="Хөл хэсэг">
      <div className="page-container footer__container">
        <Link to="/" className="footer__brand" aria-label="Ashid Soft нүүр хуудас">
          <img src={ashidLogo} alt="Ashid Logo" className="footer__brand-logo" />
          <span className="footer__brand-name">ASHID SOFT</span>
        </Link>

        <ul className="footer__products" aria-label="Ashid бүтээгдэхүүнүүд">
          {products.map((product) => (
            <li key={product}>
              <span className="footer__product-dot" aria-hidden="true" />
              <span>{product}</span>
            </li>
          ))}
        </ul>

        <hr className="footer__divider" />

        <ul className="footer__specialties" aria-label="Эмнэлгийн төрлүүд">
          {specialties.map((specialty) => <li key={specialty}>{specialty}</li>)}
        </ul>

        <ul className="footer__socials" aria-label="Сошиал сувгууд">
          {socialChannels.map(({ label, icon }) => (
            <li key={label} className="footer__social" title={label}>
              {createElement(icon, { "aria-hidden": true })}
              <span className="sr-only">{label}</span>
            </li>
          ))}
        </ul>

        <div className="footer__closing">
          <p className="footer__copyright">© 2026 Ашид Софт ХХК.</p>
        </div>
      </div>
    </footer>
  );
}
