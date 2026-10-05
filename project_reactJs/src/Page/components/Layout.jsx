import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
// import Navbar from "./Navbar";
import "../style/Layout.css";

const Layout = () => {

  return (
    <div className="app-container">
      <div className="main-layout">
        <Sidebar />
        <div className="content-area">
          {/* <Navbar /> */}
          <div className="page-container">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
