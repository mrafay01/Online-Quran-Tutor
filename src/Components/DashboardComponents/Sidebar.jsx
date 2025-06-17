"use client"

import { useState, useEffect } from "react"
import { Book, Calendar, Home, LogOut, Settings, User, X, BarChart2, Bell, FileText } from "lucide-react"
import "./Sidebar.css"

const Sidebar = ({
  isOpen,
  onToggle,
  activeSection,
  onSectionChange,
  userInfo = { name: "Ahmad Hassan", role: "Student", avatar: "/placeholder.svg?height=100&width=100" },
  unreadNotifications = 0,
}) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "my-courses", label: "My Courses", icon: Book },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "progress", label: "Progress", icon: BarChart2 },
    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadNotifications },
  ]

  const footerItems = [
    { id: "setting", label: "Settings", icon: Settings },
    { id: "profile", label: "Profile", icon: User },
    { id: "loginsignup", label: "Logout", icon: LogOut, className: "logout" },
  ]

  const handleNavClick = (sectionId) => {
    if (sectionId === "logout") {
      // Handle logout logic here
      console.log("Logout clicked")
      return
    }

    onSectionChange(sectionId)

    // Close sidebar on mobile after navigation
    if (isMobile) {
      onToggle()
    }

    if (sectionId == "schedule"){
        window.location.href = `/${sectionId}`
    }

    else if (sectionId == "loginsignup"){
        window.location.href = `/${sectionId}`
    }

    else if (sectionId == "profile"){
        window.location.href = `/${sectionId}`
    }

    else
        window.location.href = `/user/${sectionId}`
  }

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
          {navigationItems.map((item) => (
            <li key={item.id} className={activeSection === item.id ? "active" : ""}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(item.id)
                }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && <span className="notification-badge">{item.badge}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <ul>
          {footerItems.map((item) => (
            <li key={item.id} className={activeSection === item.id ? "active" : ""}>
              <a
                href="#"
                className={item.className || ""}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(item.id)
                }}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Sidebar
