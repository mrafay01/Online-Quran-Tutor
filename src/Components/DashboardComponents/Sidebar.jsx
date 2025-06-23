"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, LogOut, Settings, User, X,
  Users, Book, Calendar, Clock, BarChart2, Baby, BookOpen
} from 'lucide-react';
import "./Sidebar.css";
import * as LucideIcons from 'lucide-react';

const Sidebar = ({
  isOpen,
  onToggle,
  activeSection,
  onSectionChange,
  unreadNotifications = 0,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const segments = window.location.pathname.split("/");
    const role = segments[1];
    const username = segments[2];

    if (!role || !username) return;

    const apiRole = role.charAt(0).toUpperCase() + role.slice(1);
    const apiUrl = `http://localhost:5000/Get${apiRole}Profile?username=${username}`;

    setLoading(true);
    fetch(apiUrl)
      .then(res => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then(data => {
        if (data.error) {
          setUserInfo(null);
          setError(data.error);
        } else {
          setUserInfo({ ...data, username, role: apiRole });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Sidebar fetch error:", err);
        setUserInfo(null);
        setError("Failed to fetch user info");
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    console.log("Logging out...");
    localStorage.clear(); // Clear auth token, user data, etc.
    sessionStorage.clear(); // If used
    // You can also dispatch Redux actions here if needed
    navigate("/loginSignup");
  };

  const getNavigationItems = () => {
    if (!userInfo) return [];
    const roleLower = userInfo.role?.toLowerCase();
    const username = userInfo.username;

    switch (roleLower) {
      case 'teacher':
        return [
          { id: "dashboard", label: "Dashboard", icon: Home, path: `/teacher/${username}/dashboard` },
          { id: "my-students", label: "My Students", icon: Users, path: `/teacher/${username}/my-students` },
          { id: "courses", label: "Courses", icon: Book, path: `/teacher/${username}/courses` },
          { id: "slots", label: "Slots", icon: Clock, path: `/teacher/${username}/slots` },
          { id: "profile", label: "Profile", icon: User, path: `/teacher/${username}/profile` },
        ];

      case 'parent':
        return [
          { id: "dashboard", label: "Dashboard", icon: Home, path: `/parent/${username}/dashboard` },
          { id: "my-children", label: "My Children", icon: Baby, path: `/parent/${username}/my-children` },
          { id: "courses", label: "Courses", icon: BookOpen, path: `/parent/${username}/courses` },
          { id: "children-progress", label: "Children Progress", icon: BarChart2, path: `/parent/${username}/children-progress` },
          { id: "schedule", label: "Schedule", icon: Calendar, path: `/parent/${username}/schedule` },
          { id: "profile", label: "Profile", icon: User, path: `/parent/${username}/profile` },
        ];

      case 'student':
      default:
        return [
          { id: "dashboard", label: "Dashboard", icon: Home, path: `/student/${username}/dashboard` },
          { id: "teachers", label: "Teachers", icon: Users, path: `/student/${username}/enroll-teacher` },
          { id: "courses", label: "Courses", icon: Book, path: `/student/${username}/courses` },
          { id: "schedule", label: "Schedule", icon: Calendar, path: `/student/${username}/schedule` },
          { id: "slots", label: "Slots", icon: Clock, path: `/student/${username}/slots` },
          { id: "progress", label: "Progress", icon: BarChart2, path: `/student/${username}/progress` },
          { id: "profile", label: "Profile", icon: User, path: `/student/${username}/profile` },
        ];
    }
  };

  const footerItems = userInfo ? [
    { id: "settings", label: "Settings", icon: Settings, path: `/${userInfo.role.toLowerCase()}/${userInfo.username}/setting` },
    { id: "logout", label: "Logout", icon: LogOut, className: "logout", action: handleLogout }
  ] : [];

  const handleNavClick = (path, sectionId, action) => {
    if (sectionId === "logout" && typeof action === "function") {
      action();
      return;
    }

    onSectionChange(sectionId);
    if (isMobile) onToggle();
    navigate(path);
  };

  const navItems = userInfo ? getNavigationItems() : [];

  if (error) return <div>{error}</div>;
  if (loading || !userInfo) return <div>Loading Sidebar...</div>;

  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">Online Quran Tutor</h2>
        {isMobile && (
          <button className="close-sidebar" onClick={onToggle}>
            <X size={24} />
          </button>
        )}
      </div>

      <div className="sidebar-user">
        <img src={userInfo.avatar || "/placeholder.svg"} alt="User" className="user-avatar" />
        <div className="user-info">
          <h3>{userInfo.name}</h3>
          <p>{userInfo.role}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => {
            const Icon = item.icon || LucideIcons["Home"];
            return (
              <li key={item.id} className={activeSection === item.id ? "active" : ""}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.path, item.id);
                  }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <ul>
          {footerItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className={activeSection === item.id ? "active" : ""}>
                <a
                  href="#"
                  className={item.className || ""}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.path, item.id, item.action);
                  }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
