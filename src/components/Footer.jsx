import { Container } from "react-bootstrap";
import { FiMail, FiPhone } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="footer" aria-label="Хөл хэсэг">
      <Container>
        <div className="footer__content">
          <div className="footer__brand">
            <p className="footer__name">ASHID SOFT</p>
            <p className="footer__description">
              Эмнэлэг хайж, онлайнаар цаг авах.
            </p>
          </div>

          <address className="footer__contacts" aria-label="Холбоо барих">
            <a className="footer__contact" href="mailto:info@ashidsoft.mn">
              <FiMail aria-hidden="true" />
              <span>info@ashidsoft.mn</span>
            </a>
            <a className="footer__contact" href="tel:+97680013319">
              <FiPhone aria-hidden="true" />
              <span>+976 80013319</span>
            </a>
          </address>
        </div>

        <p className="footer__copyright">© 2026 Ашид Софт ХХК.</p>
      </Container>
    </footer>
  );
}
