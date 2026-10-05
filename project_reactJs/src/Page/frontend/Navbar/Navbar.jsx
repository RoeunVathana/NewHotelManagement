import { NavLink } from "react-router-dom";
import "./navbar.css";

const Navbar = () => {
  return (
    <div className="fixed-container">
      <nav className="navbar navbar-expand-xl navbar-light bg-white shadow-sm fixed-top">
        <div className="container">

          {/* Logo */}
          <NavLink className="navbar-brand logo" to="/index">
            BABEL SIEM REAP
          </NavLink>

          {/* Toggle */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Menu */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto text-center">

              <li className="nav-item">
                <NavLink className="nav-link" to="/boutique">
                  Boutique
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/index">
                  Guesthouse
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/experiences">
                  Experiences
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/about">
                  About<span style={{marginLeft: "5px"}}>Us</span>
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/environment">
                  Environmental
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/blog">
                  Blog
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/press">
                  Press
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink className="nav-link" to="/faq">
                  FAQ
                </NavLink>
              </li>

            </ul>

            <div className="d-flex justify-content-center mt-3 mt-xl-0">
              <NavLink className="btn book-btn" to="/booking">
                Book Now
              </NavLink>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;