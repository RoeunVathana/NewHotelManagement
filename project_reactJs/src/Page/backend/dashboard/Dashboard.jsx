import "./Dashboard.css";
import {
  BedDouble,
  LogIn,
  LogOut,
  DollarSign,
  Hourglass,
  DoorOpen,
  Bell,
  Wrench,
  SprayCan,
  MessageSquare,
  Shirt,
  Users,
  CalendarPlus,
  CalendarCheck,
  FileText,
  Building2,
} from "lucide-react";
import "./dashboard.css";
import LightMode from "../DartMode/LightMode";
// import { useNavigate } from "react-router";
// import { useEffect } from "react";
// import {getStoreUser} from "../../localStorage/userStore";
// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  // const navigate = useNavigate();
  // useEffect(() => {
  //   navigate("/payment");
  // }, [navigate]);
  const stats = [
    {
      title: "Occupancy",
      value: "0%",
      footer: "0/40 rooms",
      icon: <BedDouble />,
      color: "cyan",
    },
    {
      title: "Check-Ins Today",
      value: "0",
      footer: "0 expected",
      icon: <LogIn />,
      color: "green",
    },
    {
      title: "Check-Outs Today",
      value: "0",
      footer: "0 expected",
      icon: <LogOut />,
      color: "red",
    },
    {
      title: "Revenue Today",
      value: "$0.00",
      footer: "Month: $0.00",
      icon: <DollarSign />,
      color: "yellow",
    },
    {
      title: "Pending",
      value: "0",
      footer: "0 confirmed",
      icon: <Hourglass />,
      color: "gray",
    },
    {
      title: "Available Rooms",
      value: "40",
      footer: "0 dirty",
      icon: <DoorOpen />,
      color: "blue",
    },
  ];

  const alerts = [
    {
      title: "Pending Check-Ins",
      value: "0",
      icon: <CalendarCheck />,
      color: "yellow",
    },
    {
      title: "Overdue Check-Outs",
      value: "0",
      icon: <LogOut />,
      color: "red",
    },
    {
      title: "No-Shows",
      value: "0",
      icon: <Bell />,
      color: "gray",
    },
    {
      title: "Maintenance",
      value: "0",
      icon: <Wrench />,
      color: "cyan",
    },
    {
      title: "Dirty Rooms",
      value: "0",
      icon: <SprayCan />,
      color: "yellow",
    },
    {
      title: "Open Complaints",
      value: "0",
      icon: <MessageSquare />,
      color: "red",
    },
    {
      title: "Laundry",
      value: "0",
      icon: <Shirt />,
      color: "cyan",
    },
    {
      title: "Total Guests",
      value: "10",
      icon: <Users />,
      color: "blue",
    },
  ];

  const quickAccess = [
    {
      title: "New Reservation",
      subtitle: "Create booking",
      icon: <CalendarPlus />,
      color: "cyan",
    },
    {
      title: "All Reservations",
      subtitle: "View & manage",
      icon: <CalendarCheck />,
      color: "blue",
    },
    {
      title: "Guest Directory",
      subtitle: "10 guests",
      icon: <Users />,
      color: "green",
    },
    {
      title: "Room Management",
      subtitle: "40 available",
      icon: <Building2 />,
      color: "yellow",
    },
    {
      title: "Invoices",
      subtitle: "Billing & payments",
      icon: <FileText />,
      color: "red",
    },
    {
      title: "Housekeeping",
      subtitle: "0 dirty rooms",
      icon: <SprayCan />,
      color: "cyan",
    },
    {
      title: "Laundry",
      subtitle: "0 orders",
      icon: <Shirt />,
      color: "purple",
    },
    {
      title: "Complaints",
      subtitle: "0 open",
      icon: <MessageSquare />,
      color: "pink",
    },
  ];

  return (
    <div className="dashboard">
      <LightMode title="DASHBOARD OVERVIEW  " />
      {/* Statistics */}
      <div className="stats-grid">
        {stats.map((item, index) => (
          <div className={`stat-card ${item.color}`} key={index}>
            <div className="stat-content">
              <div className="stat-value">{item.value}</div>
              <div className="stat-title">{item.title}</div>
            </div>

            <div className="stat-icon">{item.icon}</div>

            <div className="stat-footer">{item.footer}</div>
          </div>
        ))}
      </div>

      {/* System Alerts */}
      <section className="dashboard-section">
        <h3 className="section-title">
          <Bell size={18} />
          System Alerts
        </h3>

        <div className="alert-grid">
          {alerts.map((item, index) => (
            <div className="alert-card" key={index}>
              <div className={`alert-icon ${item.color}`}>
                {item.icon}
              </div>

              <div>
                <div className="alert-title">{item.title}</div>
                <div className="alert-value">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Access */}
      <section className="dashboard-section">
        <h3 className="section-title">
          <Building2 size={18} />
          Quick Access
        </h3>

        <div className="quick-grid">
          {quickAccess.map((item, index) => (
            <div className="quick-card" key={index}>
              <div className={`quick-icon ${item.color}`}>
                {item.icon}
              </div>

              <div>
                <div className="quick-title">{item.title}</div>
                <div className="quick-subtitle">{item.subtitle}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom */}
      <div className="bottom-grid">
        <div className="room-status-card">
          <div className="bottom-header">
            <strong>▦ Room Status Board</strong>
            <span>40 rooms</span>
          </div>

          <div className="room-status">
            <span className="available">● Available</span>
            <span className="occupied">● Occupied</span>
            <span className="reserved">● Reserved</span>
            <span className="cleaning">● Cleaning</span>
            <span className="maint">● Maint</span>
            <span className="blocked">● Blocked</span>
          </div>
        </div>

        <div className="revenue-card">
          <strong>Revenue (Last 7 Days)</strong>

          <div className="empty-chart">
            $0.00
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;