import { useState, useEffect } from "react";
import "./style.css";
import { NavLink } from "react-router-dom";
import { removeStoreUser } from "../../localStorage/userStore";

const LightMode = (props) => {
  const { title } = props;
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    document.body.classList.toggle("light-mode", !darkMode);
  }, [darkMode]);

  return (
    <div className="dashboard-header">
      <h2>{title}</h2>

      <div>
        <button
          className="live-btn"
          onClick={() => setDarkMode(!darkMode)}
          aria-pressed={darkMode}
        >
          <span></span>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <NavLink
          className="live-btn"
          style={{ marginLeft: "10px" }}
          to="/login"
          onClick={removeStoreUser}
        >
            <span></span>
            LogOut
        </NavLink>
      </div>
    </div>
  );
};

export default LightMode;
