"use client"

import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom'
import Sidebar from '../Sidebar'
import {
  Menu,
  Plus,
  Book,
  Users,
  Clock,
  Star,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  BookOpen,
  TrendingUp,
} from "lucide-react"
import '../dashboard.css'

const TeacherCourses = () => {
  const { username, role } = useParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("my-courses")
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username || !role) return
    setLoading(true)
    fetch(`http://localhost:5000/GetTeacherCourses?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setCourses(data)
        setLoading(false)
      })
      .catch(err => {
        setError("Failed to fetch courses data")
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

  const getStatusBadge = (status) => {
    const statusClasses = {
      published: "status-badge confirmed",
      draft: "status-badge pending",
      archived: "status-badge cancelled",
    }
    return statusClasses[status] || "status-badge"
  }

  const getLevelColor = (level) => {
    const colors = {
      Beginner: "#2ecc71",
      Intermediate: "#f39c12",
      Advanced: "#e74c3c",
    }
    return colors[level] || "#666"
  }

  if (loading) return <div className="loading">Loading courses...</div>
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
            <h1>My Courses</h1>
            <p className="page-subtitle">Manage your teaching courses</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Course Overview Stats */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Course Overview</h2>
            </div>
            <div className="teaching-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <Book size={24} />
                </div>
                <div className="stat-info">
                  <h4>{courses.filter((c) => c.status === "published").length}</h4>
                  <p>Published Courses</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <h4>{courses.reduce((acc, c) => acc + c.enrolledStudents, 0)}</h4>
                  <p>Total Students</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Star size={24} />
                </div>
                <div className="stat-info">
                  <h4>{(courses.reduce((acc, c) => acc + c.rating, 0) / courses.length).toFixed(1)}</h4>
                  <p>Average Rating</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <h4>{Math.round(courses.reduce((acc, c) => acc + c.completionRate, 0) / courses.length)}%</h4>
                  <p>Avg Completion</p>
                </div>
              </div>
            </div>
          </section>

          {/* Course Management */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Course Management</h2>
              <button className="btn btn-primary">
                <Plus size={16} />
                Create New Course
              </button>
            </div>

            <div className="courses-grid">
              {courses.map((course) => (
                <div key={course.id} className="course-card">
                  <div className="course-image" style={{ height: "150px", overflow: "hidden" }}>
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        background: getLevelColor(course.level),
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                      }}
                    >
                      {course.level}
                    </div>
                  </div>

                  <div className="course-content">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      <h3>{course.title}</h3>
                      <div className="dropdown">
                        <button className="dropdown-btn">
                          <MoreVertical size={16} />
                        </button>
                        <div className="dropdown-content">
                          <button>
                            <Eye size={14} /> View
                          </button>
                          <button>
                            <Edit size={14} /> Edit
                          </button>
                          <button>
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: "0.9rem", color: "var(--text-light)", marginBottom: "15px" }}>
                      {course.description}
                    </p>

                    <div
                      className="course-meta"
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "15px",
                        marginBottom: "15px",
                        fontSize: "0.8rem",
                        color: "var(--text-light)",
                      }}
                    >
                      <span>
                        <BookOpen size={14} /> {course.totalLessons} lessons
                      </span>
                      <span>
                        <Clock size={14} /> {course.duration}
                      </span>
                      <span>
                        <Users size={14} /> {course.enrolledStudents} students
                      </span>
                    </div>

                    <div
                      className="course-rating"
                      style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "15px" }}
                    >
                      <Star size={16} fill="currentColor" style={{ color: "#ffa500" }} />
                      <span>{course.rating}</span>
                      <span style={{ color: "var(--text-light)" }}>({course.totalReviews} reviews)</span>
                    </div>

                    <div className="course-progress mb-2">
                      <div className="progress-text">
                        <span>Completion Rate</span>
                        <span>{course.completionRate}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${course.completionRate}%` }}></div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "15px",
                      }}
                    >
                      <span className={getStatusBadge(course.status)}>
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </span>
                      <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--primary)" }}>
                        ${course.price}
                      </span>
                    </div>

                    <div className="course-actions">
                      <button className="btn btn-primary" style={{ flex: 1 }}>
                        Manage Course
                      </button>
                      <button className="btn btn-secondary">
                        <Eye size={16} />
                      </button>
                    </div>
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

export default TeacherCourses
