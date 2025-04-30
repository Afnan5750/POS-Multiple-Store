import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaTachometerAlt,
  FaShoppingCart,
  FaBox,
  FaUsers,
  FaChartBar,
  FaUserShield,
  FaFileInvoiceDollar,
  FaSignOutAlt,
  FaAngleDown,
  FaFileInvoice,
  FaChartLine,
  FaExclamationTriangle,
  FaBoxes,
  FaThList,
  FaTag,
  FaExclamationCircle,
  FaStar,
} from "react-icons/fa";
import "./Sidebar.css";
import defaultLogo from "../../assets/images/pos-logo.png";

const Sidebar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [logo, setLogo] = useState(defaultLogo);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/auth/getuser",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.storeDetail?.logo) {
          setLogo(`http://localhost:5000${response.data.storeDetail.logo}`);
        } else {
          setLogo(defaultLogo); // fallback
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
        setLogo(defaultLogo); // fallback
      }
    };

    fetchLogo();
  }, []);

  useEffect(() => {
    // Determine active dropdown based on current URL
    if (location.pathname.startsWith("/sales")) {
      setActiveDropdown("sales");
    } else if (location.pathname.startsWith("/inventory")) {
      setActiveDropdown("inventory");
    } else if (location.pathname.startsWith("/reports")) {
      setActiveDropdown("reports");
    } else {
      setActiveDropdown(null); // Close all dropdowns if no match
    }
  }, [location.pathname]);

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");

    if (confirmLogout) {
      localStorage.removeItem("token");
      console.log("User logged out");

      navigate("/login");
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link to="/dashboard">
          <img
            src={logo}
            alt="POS Logo"
            className="sidebar-logo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultLogo;
            }}
          />
        </Link>
      </div>

      <ul className="sidebar-menu">
        <li
          className={`sidebar-item ${
            location.pathname === "/dashboard" ? "active" : ""
          }`}
        >
          <Link to="/dashboard" className="sidebar-link">
            <FaTachometerAlt className="sidebar-icon" />
            <span className="sidebar-text">Dashboard</span>
            <span className="shortcut">Alt + D</span>
          </Link>
        </li>

        <li className="sidebar-item" onClick={() => toggleDropdown("sales")}>
          <div className="sidebar-link">
            <FaShoppingCart className="sidebar-icon" />
            <span className="sidebar-text">Sales & Billing</span>
            <FaAngleDown
              className={`dropdown-icon ${
                activeDropdown === "sales" ? "open" : ""
              }`}
            />
          </div>
        </li>
        <ul
          className={`dropdown-menu ${
            activeDropdown === "sales" ? "active" : ""
          }`}
        >
          <li
            className={`sidebar-item ${
              location.pathname === "/sales/new-sale" ? "active" : ""
            }`}
          >
            <Link to="/sales/new-sale" className="sidebar-link">
              <FaShoppingCart className="sidebar-icon small-icon" />
              <span className="sidebar-text">New Sale</span>
              <span className="shortcut">Alt + N</span>
            </Link>
          </li>
          <li
            className={`sidebar-item ${
              location.pathname === "/sales/invoices" ? "active" : ""
            }`}
          >
            <Link to="/sales/invoices" className="sidebar-link">
              <FaFileInvoice className="sidebar-icon small-icon" />
              <span className="sidebar-text">Invoices</span>
              <span className="shortcut">Alt + I</span>
            </Link>
          </li>
        </ul>

        <li
          className="sidebar-item"
          onClick={() => toggleDropdown("inventory")}
        >
          <div className="sidebar-link">
            <FaBox className="sidebar-icon" />
            <span className="sidebar-text">Inventory</span>
            <FaAngleDown
              className={`dropdown-icon ${
                activeDropdown === "inventory" ? "open" : ""
              }`}
            />
          </div>
        </li>
        <ul
          className={`dropdown-menu ${
            activeDropdown === "inventory" ? "active" : ""
          }`}
        >
          <li
            className={`sidebar-item ${
              location.pathname === "/inventory/products" ? "active" : ""
            }`}
          >
            <Link to="/inventory/products" className="sidebar-link">
              <FaBoxes className="sidebar-icon small-icon" />
              <span className="sidebar-text">Products</span>
              <span className="shortcut">Alt + P</span>
            </Link>
          </li>
          <li
            className={`sidebar-item ${
              location.pathname === "/inventory/category" ? "active" : ""
            }`}
          >
            <Link to="/inventory/category" className="sidebar-link">
              <FaThList className="sidebar-icon small-icon" />
              <span className="sidebar-text">Category</span>
              <span className="shortcut">Alt + C</span>
            </Link>
          </li>
          <li
            className={`sidebar-item ${
              location.pathname === "/inventory/expired-products"
                ? "active"
                : ""
            }`}
          >
            <Link to="/inventory/expired-products" className="sidebar-link">
              <FaExclamationTriangle className="sidebar-icon small-icon" />
              <span className="sidebar-text">Expired Products</span>
              <span className="shortcut">Alt + E</span>
            </Link>
          </li>
          <li
            className={`sidebar-item ${
              location.pathname === "/inventory/low-stock" ? "active" : ""
            }`}
          >
            <Link to="/inventory/low-stock" className="sidebar-link">
              <FaExclamationCircle className="sidebar-icon small-icon" />
              <span className="sidebar-text">Low Stock</span>
              <span className="shortcut">Alt + L</span>
            </Link>
          </li>
        </ul>

        {/* <li
          className={`sidebar-item ${
            location.pathname === "/customers" ? "active" : ""
          }`}
        >
          <Link to="/customers" className="sidebar-link">
            <FaUsers className="sidebar-icon" />
            <span className="sidebar-text">Customers</span>
          </Link>
        </li> */}

        <li
          className={`sidebar-item ${
            location.pathname === "/price-checker" ? "active" : ""
          }`}
        >
          <Link to="/price-checker" className="sidebar-link">
            <FaTag className="sidebar-icon" /> {/* Price Tag Icon */}
            <span className="sidebar-text">Price Checker</span>
            <span className="shortcut">Ctrl + Alt + P</span>
          </Link>
        </li>

        {/* <li
          className={`sidebar-item ${
            location.pathname === "/suppliers" ? "active" : ""
          }`}
        >
          <Link to="/suppliers" className="sidebar-link">
            <FaTruck className="sidebar-icon" />
            <span className="sidebar-text">Suppliers</span>
          </Link>
        </li> */}

        {/* Reports & Analytics Dropdown */}
        <li className="sidebar-item" onClick={() => toggleDropdown("reports")}>
          <div className="sidebar-link">
            <FaChartBar className="sidebar-icon" />
            <span className="sidebar-text">Reports & Analytics</span>
            <FaAngleDown
              className={`dropdown-icon ${
                activeDropdown === "reports" ? "open" : ""
              }`}
            />
          </div>
        </li>
        <ul
          className={`dropdown-menu ${
            activeDropdown === "reports" ? "active" : ""
          }`}
        >
          {/* Sales Reports */}
          {/* <li
            className={`sidebar-item ${
              location.pathname === "/reports/sales-reports" ? "active" : ""
            }`}
          >
            <Link to="/reports/sales-reports" className="sidebar-link">
              <FaChartLine className="sidebar-icon small-icon" />
              <span className="sidebar-text">Sales Reports</span>
            </Link>
          </li> */}

          {/* Invoice Reports */}
          <li
            className={`sidebar-item ${
              location.pathname === "/reports/invoice-reports" ? "active" : ""
            }`}
          >
            <Link to="/reports/invoice-reports" className="sidebar-link">
              <FaFileInvoiceDollar className="sidebar-icon small-icon" />
              <span className="sidebar-text">Invoice Reports</span>
              <span className="shortcut">Ctrl + Alt + I</span>
            </Link>
          </li>
          <li
            className={`sidebar-item ${
              location.pathname === "/reports/top-selling-products"
                ? "active"
                : ""
            }`}
          >
            <Link to="/reports/top-selling-products" className="sidebar-link">
              <FaStar className="sidebar-icon small-icon" />
              <span className="sidebar-text">Top Selling Product</span>
              <span className="shortcut">Alt + T</span>
            </Link>
          </li>
        </ul>

        <li
          className={`sidebar-item ${
            location.pathname === "/profile" ? "active" : ""
          }`}
        >
          <Link to="/profile" className="sidebar-link">
            <FaUserShield className="sidebar-icon" />
            <span className="sidebar-text">Profile</span>
            <span className="shortcut">Ctrl + Shift + P</span>
          </Link>
        </li>
        {/* <li
          className={`sidebar-item ${
            location.pathname === "/settings" ? "active" : ""
          }`}
        >
          <Link to="/settings" className="sidebar-link">
            <FaCog className="sidebar-icon" />
            <span className="sidebar-text">Settings</span>
          </Link>
        </li> */}
      </ul>
      <li className="sidebar-item sidebar-logout" onClick={handleLogout}>
        <div className="sidebar-link">
          <FaSignOutAlt className="sidebar-icon logout-sidebar-icon" />
          <span className="sidebar-text">Logout</span>
          <span className="shortcut">Ctrl + L</span>
        </div>
      </li>
    </div>
  );
};

export default Sidebar;
