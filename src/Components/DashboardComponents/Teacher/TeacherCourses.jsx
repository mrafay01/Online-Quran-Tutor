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
    console.log('TeacherCourses useEffect', { username, role });
    if (!username || !role) return
    setLoading(true)
    fetch(`http://localhost:5000/GetTeacherCourses?username=${username}`)
      .then(res => {
        console.log('API response:', res);
        return res.json()
      })
      .then(data => {
        console.log('API data:', data);
        if (data.error) setError(data.error)
        else setCourses(data.courses)
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
                  <h4>{courses.length}</h4>
                  <p>Total Courses</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <h4>{courses.reduce((acc, c) => acc + (c.studentCount || 0), 0)}</h4>
                  <p>Total Students</p>
                </div>
              </div>
            </div>
          </section>

          {/* Course Management */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Course Management</h2>
              
            </div>

            <div className="courses-grid">
              {courses.map((course) => (
                <div key={course.courseId} className="course-card">
                  <div className="course-content">
                    <h3>{course.courseName}</h3>
                    <p style={{ fontSize: "0.95rem", color: "#444", marginBottom: "10px" }}>{course.courseDescription}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                      <Users size={16} />
                      <span style={{ fontWeight: 500 }}>{course.studentCount} students</span>
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
