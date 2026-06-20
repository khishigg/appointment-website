import { Container, Row, Col } from "react-bootstrap";
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaMobileAlt } from "react-icons/fa";
import { FaFacebookF } from 'react-icons/fa';
import { FaTwitter } from 'react-icons/fa6';
import { FaInstagram } from 'react-icons/fa';
import mapImage from "../assets/map.png";

export default function Footer() {
  return (
    <footer className="footer text-light">
      <Container>
        <Row className="gy-4">
          {/* About section */}
          <Col md={3} sm={6}>
            <h5 className="footer-title">Бидний тухай</h5>
            <p className="footer-text">
              The lysine contingency – it’s intended to prevent the spread of
              the animals in case they ever got off the island.
            </p>
            <div className="social-icons">
              <span className="icon"><FaFacebookF /></span>
              <span className="icon"><FaTwitter /></span>
              <span className="icon"><FaInstagram /></span>
            </div>
          </Col>

          {/* Head Office */}
          <Col md={3} sm={6}>
            <h5 className="footer-title">Хаяг</h5>
            <ul className="list-unstyled">
              <li><FaMapMarkerAlt /> СБД, 9-р хороо, Хоймор оффис, 504 тоот.</li>
              <li><FaEnvelope /> info@ashidsoft.mn</li>
              <li><FaPhoneAlt /> +976 80013319</li>
            </ul>
          </Col>

          {/* Company Links */}
          <Col md={3} sm={6}>
            <h5 className="footer-title">Үйл ажиллагаа</h5>
            <ul className="list-unstyled">
              <li>Бидний тухай</li>
              <li>Манай боломжууд</li>
              <li>Хамтрагч</li>
              <li>Сэтгэгдэл</li>
              <li>Холбоо барих</li>
            </ul>
          </Col>

         
          <Col md={3} sm={6}>
            <h5 className="footer-title">Газрын зураг</h5>
            <img
              src={mapImage}
              alt="Branches Map"
              className="img-fluid rounded shadow-sm"
              style={{backgroundColor : ' rgba(0, 130, 200, 0.9)'}}
            />
          </Col>
        </Row>

        <Row>
          <Col className="text-center mt-4">
            <p className="footer-bottom">
              © 2025 Ашид Софт ХХК.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
