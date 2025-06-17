import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5"; // 🔥 Notification icon from React Icons
import logo from "../Components/Assets/Images/Logo.png";
import "./Assets/Style/Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const notificationRef = useRef();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    "Your class has been scheduled.",
    "New course materials are available.",
    "Profile updated successfully.",
    "Reminder: Live session at 5 PM.",
  ]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`}>
      <div className="leftbox">
        <img src={logo || "/placeholder.svg"} alt="Logo" />
      </div>

      <div className="hamburger" onClick={() => setIsOpen(!isOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className={`midbox ${isOpen ? "active" : ""}`}>
        <ul id="list">
          <li className="options">
            <NavLink
              to="/"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu}
            >
              HOME
            </NavLink>
          </li>
          <li className="options">
            <NavLink
              to="/courses"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu}
            >
              COURSES
            </NavLink>
          </li>
          <li className="options">
            <NavLink
              to="/teachers"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu}
            >
              TEACHERS
            </NavLink>
          </li>
          <li className="options">
            <NavLink
              to="/about-us"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu}
            >
              ABOUT US
            </NavLink>
          </li>
          <li className="options">
            <NavLink
              to="/contact-us"
              className={({ isActive }) => (isActive ? "active" : "")}
              onClick={closeMenu}
            >
              CONTACT US
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="rightbox">
        <NavLink to="/loginsignup" className="nav-login-btn">
          LOGIN
        </NavLink>

        <div className="notification-wrapper" ref={notificationRef}>
          <div
            className="notification-bell-icon"
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(!showNotifications);
            }}
          >
            <IoNotificationsOutline className="notification-icon" />
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </div>
          {showNotifications && (
            <div className="notification-panel fade-slide">
              <div className="notification-panel-header">
                <h4>Notifications</h4>
                {notifications.length > 0 && (
                  <button
                    className="clear-button"
                    onClick={() => setNotifications([])}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <ul>
                {notifications.length > 0 ? (
                  notifications.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))
                ) : (
                  <li className="no-notification">No new notifications</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
