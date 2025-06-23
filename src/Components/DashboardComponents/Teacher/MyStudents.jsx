"use client"

import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom'
import Sidebar from '../Sidebar'
import '../dashboard.css'
import {
  Menu,
  Search,
  Plus,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Star,
  TrendingUp,
  BookOpen,
  MessageSquare,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react"

const MyStudents = () => {
  const { username, role } = useParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("my-students")
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username || !role) return
    setLoading(true)
    fetch(`http://localhost:5000/GetTeacherStudents?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else {
          setStudents(data)
          setFilteredStudents(data)
        }
        setLoading(false)
      })
      .catch(err => {
        setError("Failed to fetch students data")
        setLoading(false)
      })
  }, [username, role])

  useEffect(() => {
    let filtered = students

    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((student) => student.status === filterStatus)
    }

    setFilteredStudents(filtered)
  }, [searchTerm, filterStatus, students])

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
      active: "status-badge confirmed",
      inactive: "status-badge cancelled",
      pending: "status-badge pending",
    }
    return statusClasses[status] || "status-badge"
  }

  if (loading) return <div className="loading">Loading students...</div>
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
            <h1>My Students</h1>
            <p className="page-subtitle">Manage your students and their progress</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Students Overview Stats */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Students Overview</h2>
            </div>
            <div className="teaching-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <User size={24} />
                </div>
                <div className="stat-info">
                  <h4>{students.filter((s) => s.status === "active").length}</h4>
                  <p>Active Students</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <h4>{students.reduce((acc, s) => acc + s.totalHours, 0)}</h4>
                  <p>Total Hours Taught</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Star size={24} />
                </div>
                <div className="stat-info">
                  <h4>{(students.reduce((acc, s) => acc + s.rating, 0) / students.length).toFixed(1)}</h4>
                  <p>Average Rating</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <h4>{Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)}%</h4>
                  <p>Average Progress</p>
                </div>
              </div>
            </div>
          </section>

          {/* Search and Filter */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Student Management</h2>
              <button className="btn btn-primary">
                <Plus size={16} />
                Add Student
              </button>
            </div>

            <div className="d-flex gap-3 mb-3">
              <div className="search-bar" style={{ flex: 1, maxWidth: "400px" }}>
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ minWidth: "150px" }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Students Grid */}
            <div className="students-grid">
              {filteredStudents.map((student) => (
                <div key={student.id} className="student-card">
                  <div
                    className="student-header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "15px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <div className="student-avatar">
                        <img src={student.avatar || "/placeholder.svg"} alt={student.name} />
                      </div>
                      <div className="student-info">
                        <h4>{student.name}</h4>
                        <p className="student-course">{student.currentCourse}</p>
                        <span className={getStatusBadge(student.status)}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="dropdown">
                      <button className="dropdown-btn">
                        <MoreVertical size={16} />
                      </button>
                      <div className="dropdown-content">
                        <button>
                          <Edit size={14} /> Edit
                        </button>
                        <button>
                          <MessageSquare size={14} /> Message
                        </button>
                        <button>
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="student-details">
                    <div className="student-contact mb-2">
                      <p>
                        <Mail size={14} /> {student.email}
                      </p>
                      <p>
                        <Phone size={14} /> {student.phone}
                      </p>
                    </div>

                    <div className="student-progress mb-2">
                      <div className="progress-text">
                        <span>Progress</span>
                        <span>{student.progress}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${student.progress}%` }}></div>
                      </div>
                    </div>

                    <div className="student-stats">
                      <div className="child-stat">
                        <Clock size={14} />
                        <span>{student.totalHours}h total</span>
                      </div>
                      <div className="child-stat">
                        <BookOpen size={14} />
                        <span>
                          {student.completedSessions}/{student.totalSessions} sessions
                        </span>
                      </div>
                      <div className="child-stat">
                        <Star size={14} />
                        <span>{student.rating}/5.0</span>
                      </div>
                    </div>

                    {student.upcomingSession && (
                      <div
                        className="upcoming-session mt-2"
                        style={{
                          background: "rgba(92, 114, 74, 0.1)",
                          padding: "10px",
                          borderRadius: "8px",
                          fontSize: "0.9rem",
                        }}
                      >
                        <Calendar size={14} />
                        <span>Next: {new Date(student.upcomingSession).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="student-actions mt-3">
                    <button className="btn btn-primary" style={{ flex: 1 }}>
                      View Details
                    </button>
                    <button className="btn btn-secondary">
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center mt-3">
                <p>No students found matching your criteria.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default MyStudents
