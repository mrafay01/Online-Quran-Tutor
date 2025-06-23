"use client"

import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom'
import Sidebar from '../Sidebar'
import { Menu, Plus, Baby, BookOpen, Clock, Calendar, Award, Edit, Eye, MoreVertical, User } from "lucide-react"
import '../dashboard.css'

const MyChildren = () => {
  const { username, role } = useParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("children")
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username || !role) return
    setLoading(true)
    fetch(`http://localhost:5000/GetParentChildren?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setChildren(data)
        setLoading(false)
      })
      .catch(err => {
        setError("Failed to fetch children data")
        setLoading(false)
      })
  }, [username, role])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const handleSectionChange = (section) => setActiveSection(section)

  // Create userInfo object for Sidebar
  const userInfo = {
    name: username,
    role: role,
    avatar: "/placeholder.svg"
  }

  if (loading) return <div className="loading">Loading children data...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="dashboard-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userInfo={userInfo}
        unreadNotifications={2}
      />

      <div className="main-content">
        <div className="top-bar">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="page-title">
            <h1>My Children</h1>
            <p className="page-subtitle">Monitor your children's learning progress</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Children Overview Stats */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Children Overview</h2>
              <button className="btn btn-primary">
                <Plus size={16} />
                Add Child
              </button>
            </div>
            <div className="children-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <Baby size={24} />
                </div>
                <div className="stat-info">
                  <h4>{children.length}</h4>
                  <p>Total Children</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <BookOpen size={24} />
                </div>
                <div className="stat-info">
                  <h4>{children.reduce((acc, child) => acc + child.currentCourses.length, 0)}</h4>
                  <p>Active Courses</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <h4>{children.reduce((acc, child) => acc + child.hoursThisWeek, 0)}</h4>
                  <p>Hours This Week</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Award size={24} />
                </div>
                <div className="stat-info">
                  <h4>{children.reduce((acc, child) => acc + child.achievements, 0)}</h4>
                  <p>Total Achievements</p>
                </div>
              </div>
            </div>
          </section>

          {/* Children Details */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Children Progress</h2>
            </div>
            <div className="children-grid">
              {children.map((child) => (
                <div key={child.id} className="child-card">
                  <div className="child-header">
                    <div className="child-avatar">
                      <img src={child.avatar || "/placeholder.svg"} alt={child.name} />
                    </div>
                    <div className="child-info">
                      <h4>{child.name}</h4>
                      <p className="child-age">Age: {child.age}</p>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-light)" }}>
                        Enrolled: {new Date(child.enrolledDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="dropdown">
                      <button className="dropdown-btn">
                        <MoreVertical size={16} />
                      </button>
                      <div className="dropdown-content">
                        <button>
                          <Eye size={14} /> View Details
                        </button>
                        <button>
                          <Edit size={14} /> Edit Profile
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="child-progress">
                    <div className="progress-item">
                      <span>Overall Progress</span>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${child.overallProgress}%` }}></div>
                      </div>
                      <span className="progress-percentage">{child.overallProgress}%</span>
                    </div>

                    <div className="child-stats">
                      <div className="child-stat">
                        <BookOpen size={14} />
                        <span>{child.currentCourses.length} Courses</span>
                      </div>
                      <div className="child-stat">
                        <Clock size={14} />
                        <span>{child.hoursThisWeek}h This Week</span>
                      </div>
                      <div className="child-stat">
                        <Award size={14} />
                        <span>{child.achievements} Achievements</span>
                      </div>
                    </div>

                    {/* Current Courses */}
                    <div className="current-courses mt-3">
                      <h5 style={{ marginBottom: "10px", color: "var(--primary-dark)" }}>Current Courses</h5>
                      {child.currentCourses.map((course, index) => (
                        <div
                          key={index}
                          className="course-item"
                          style={{
                            background: "rgba(92, 114, 74, 0.05)",
                            padding: "8px",
                            borderRadius: "6px",
                            marginBottom: "8px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "5px",
                            }}
                          >
                            <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{course.name}</span>
                            <span style={{ fontSize: "0.8rem", color: "var(--primary)" }}>{course.progress}%</span>
                          </div>
                          <div className="progress-bar-container" style={{ height: "4px" }}>
                            <div className="progress-bar" style={{ width: `${course.progress}%` }}></div>
                          </div>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-light)", margin: "5px 0 0 0" }}>
                            <User size={12} /> {course.teacher}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Upcoming Session */}
                    {child.upcomingSession && (
                      <div
                        className="upcoming-session mt-3"
                        style={{
                          background: "rgba(92, 114, 74, 0.1)",
                          padding: "10px",
                          borderRadius: "8px",
                        }}
                      >
                        <h6 style={{ marginBottom: "5px", color: "var(--primary-dark)" }}>Next Session</h6>
                        <p style={{ fontSize: "0.9rem", margin: "0" }}>{child.upcomingSession.course}</p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-light)", margin: "2px 0" }}>
                          <User size={12} /> {child.upcomingSession.teacher}
                        </p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-light)", margin: "2px 0" }}>
                          <Calendar size={12} /> {new Date(child.upcomingSession.date).toLocaleDateString()} at{" "}
                          {child.upcomingSession.time}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="child-actions mt-3">
                    <button className="btn btn-primary" style={{ flex: 1 }}>
                      View Full Progress
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Recent Activity</h2>
            </div>
            <div className="activity-grid">
              {children.map((child) => (
                <div key={child.id} className="activity-card">
                  <h4>{child.name}'s Recent Activity</h4>
                  <div className="activity-list">
                    {child.recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          {activity.type === "lesson_completed" ? <BookOpen size={16} /> : <Award size={16} />}
                        </div>
                        <div className="activity-details">
                          <p>{activity.description}</p>
                          <span className="activity-time">{new Date(activity.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default MyChildren
