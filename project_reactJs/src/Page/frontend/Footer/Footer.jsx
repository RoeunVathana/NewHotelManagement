import "./Footer.css";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
} from "react-icons/fa";
import "./footer.css"

const Footer = () => {
  return (
    <footer className="hotel-footer">
      <div className="footer-container">

        {/* Hotel Info */}
        <div className="footer-column">
          <h2 className="footer-logo">
            BABEL <span>HOTEL</span>
          </h2>

          <p className="footer-description">
            Experience luxury, comfort, and unforgettable memories.
            Stay with us and enjoy premium hospitality in the heart of the city.
          </p>

          <div className="social-icons">
            <a href="#">
              <FaFacebookF />
            </a>

            <a href="#">
              <FaInstagram />
            </a>

            <a href="#">
              <FaTwitter />
            </a>

            <a href="#">
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-column">
          <h3>Quick Links</h3>

          <ul>
            <li>
              <a href="/">Home</a>
            </li>

            <li>
              <a href="/rooms">Rooms</a>
            </li>

            <li>
              <a href="/services">Services</a>
            </li>

            <li>
              <a href="/gallery">Gallery</a>
            </li>

            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-column">
          <h3>Contact Us</h3>

          <div className="contact-item">
            <FaMapMarkerAlt />
            <span>No. 123, Street 51, Phnom Penh, Cambodia</span>
          </div>

          <div className="contact-item">
            <FaPhoneAlt />
            <span>+855 12 345 678</span>
          </div>

          <div className="contact-item">
            <FaEnvelope />
            <span>info@babelhotel.com</span>
          </div>

          <div className="contact-item">
            <FaClock />
            <span>24 Hours Service</span>
          </div>
        </div>

        {/* Newsletter */}
        <div className="footer-column">
          <h3>Newsletter</h3>

          <p>
            Subscribe to receive exclusive offers and latest hotel news.
          </p>

          <form className="newsletter">
            <input
              type="email"
              placeholder="Enter your email"
            />

            <button type="submit">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} BABEL HOTEL. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;  