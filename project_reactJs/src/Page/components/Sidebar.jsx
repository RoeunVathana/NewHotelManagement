import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../style/Sidebar.css";
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [

    { id: "dashboard", label: "📊 Dashboard", path: "/" },

    {
      id: "property",
      label: "📦 Property",
      path: "/property",
      submenu: [
        {id: "branches", label: "Branches", path: "/branches"},
        { id: "room", label: "Room", path: "/room" },
        { id: "room_type", label: "Room Type", path: "/room_type" },
      ],
    },

    {
      id: "guests_Walk_in",
      label: "💳 Guests & CRM",
      path: "/guests",
      submenu: [
        { id: "walk_in & reg", label: "Walk-in & Reg", path: "/walk_in_and_reg"},
      ],
    },
    {
      id: "position",
      label: "💳Position",
      path: "/position",
      submenu: [
        { id: "staff", label: "Staff", path: "/staff"},
        { id: "employees", label: "Employees", path: "/employees"},
      ],
    },

    {
      id: "Front_Office",
      label: "💳 Front Office",
      path: "/front_office",
      submenu: [
        { id: "complaints", label: "Complaints", path: "/complaints" },
        { id: "night_audit", label: "Night Audit", path: "/night_audit" },
        { id: "daily_summary", label: "Daily Summary", path: "/daily_summary" },
        { id: "employees", label: "List of Employees", path: "/employees" },
      ],
    },

    {
      id: "reports",
      label: "📈 Reports",
      path: "/reports",
      submenu: [
        { id: "sales-report", label: "Sales Report", path: "/sales" },
        {
          id: "customer-report",
          label: "Customer Report",
          path: "/customerReport",
        },
      ],
    },

    {
      id: "checkin_checkout",
      label: "📈 Check-in/Check-out",
      path: "/checkin_checkout",
      submenu: [
        { id: "CheckIn", label: "Check-in", path: "/check_in" },
        { id: "CheckOut", label: "Check-out", path: "/check_out" },
      ],
    },
    {
      id: "Housekeeping",
      label: "📈 Housekeeping",
      path: "/operations",
      submenu: [
        { id: "Housekeeping_board", label: "Housekeeping Board", path: "/housekeeping_board" },
      ],
    },

    {
      id: "reservations",
      label: "📈 Reservations",
      path: "/reservations",
    },
    { id: "pos_sale", label: "📊 POS_SALE", path: "/pos_sale" },
    
    {
      id: "pos",
      label: "📈 pos / Restaurant",
      path: "/pos_restaurant",
    },

    {
      id: "settings",
      label: "⚙️ Settings",
      path: "/settings",
      submenu: [
        { id: "role", label: "Roles", path: "/role" },
        {
          id: "user-management",
          label: "User",
          path: "/manageuser",
        },
        {
          id: "role-permission",
          label: "Permission",
          path: "/permission",
        },
        {
          id: "low-stock-alert",
          label: "Low Stock Alert",
          path: "/lowstockalert",
        },
      ],
    },
    {
      id: "inventory",
      label: "⚙️ Inventory / Folios",
      path: "/inventory",
    },

    
    {
      id: "index",
      label: "🌐 View Website",
      path: "/index",
    },
  ];

  const [expandedMenu, setExpandedMenu] = useState(null);

  const toggleSubmenu = (menuId) => {
    if (expandedMenu === menuId) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(menuId);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };
  

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>HOTEL MANAGEMENT</h2>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className="nav-item-wrapper">
            <button
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => {
                if (item.submenu) {
                  toggleSubmenu(item.id);
                } else {
                  handleNavigation(item.path);
                }
              }}
            >
              <span>{item.label}</span>
              {item.submenu && (
                <span
                  className={`submenu-toggle ${expandedMenu === item.id ? "open" : ""}`}
                >
                  ▼
                </span>
              )}
            </button>

            {item.submenu && expandedMenu === item.id && (
              <div className="submenu">
                {item.submenu.map((subitem) => (
                  <button
                    key={subitem.id}
                    className={`submenu-item ${
                      location.pathname === subitem.path ? "active" : ""
                    }`}
                    onClick={() => handleNavigation(subitem.path)}
                  >
                    {subitem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
