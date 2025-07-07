"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../Sidebar'
import { Menu, Search, Book, Clock, User, Star, Play, BookOpen, Award, Download, CheckCircle } from "lucide-react"
import '../dashboard.css'

const ALL_COURSES = [
  { key: 'Nazra', label: 'Nazra', description: 'Quran Recitation Basics', image: '/placeholder.svg' },
  { key: 'Hifz', label: 'Hifz', description: 'Memorization Quran Surahs', image: '/placeholder.svg' },
  { key: 'Tajweed', label: 'Tajweed', description: 'Rules Mastery', image: '/placeholder.svg' },
  { key: 'Qiraat', label: 'Qiraat', description: 'Quranic Qiraat', image: '/placeholder.svg' },
]

const StudentCourses = () => {
  const { username, role } = useParams()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("my-courses")
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetch(`http://localhost:5000/GetStudentCourses?username=${username}`)
      .then(res => res.json())
      .then(data => {
        console.log("API response:", data);
        if (data.error) {
          setError(data.error);
          setLoading(false);
        } else {
          // Map API courses to expected structure
          const mappedCourses = Array.isArray(data.courses)
            ? data.courses.map(c => ({
                key: c.courseName?.split(' ')[0] || '', // e.g., "Nazra"
                title: c.courseName || '',
                teacher: c.teacherName || '',
                category: c.courseSubtitle || '',
                status: "in_progress", // or set based on your logic
                totalHours: 0, // or set if available
                certificateEligible: false, // or set if available
                ...c // keep all original fields too
              }))
            : [];
          setEnrolledCourses(mappedCourses);
          setLoading(false);
        }
      })
      .catch(err => {
        setError("Failed to fetch courses data");
        setLoading(false);
        console.error("Fetch error:", err);
      });
  }, [username]);

  useEffect(() => {
    let filtered = enrolledCourses

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((course) => course.status === filterStatus)
    }

    setFilteredCourses(filtered)
  }, [searchTerm, filterStatus, enrolledCourses])

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
      in_progress: "status-badge pending",
      completed: "status-badge confirmed",
      not_started: "status-badge cancelled",
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

  // Helper: check if enrolled
  const isEnrolled = (courseKey) =>
    enrolledCourses.some(
      (c) => c.key?.toLowerCase() === courseKey.toLowerCase() || c.title?.toLowerCase() === courseKey.toLowerCase()
    )

  // Enroll button handler
  const handleEnroll = (courseKey) => {
    navigate(`/student/${username}/enroll-teacher?courseId=${courseKey}`)
  }

  console.log("enrolledCourses:", enrolledCourses, "loading:", loading, "error:", error);

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
            <p className="page-subtitle">Browse and manage your enrolled courses</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Course Overview Stats */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Learning Overview</h2>
            </div>
            <div className="progress-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <Book size={24} />
                </div>
                <div className="stat-info">
                  <h4>{enrolledCourses.length}</h4>
                  <p>Enrolled Courses</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-info">
                  <h4>{enrolledCourses.filter((c) => c.status === "completed").length}</h4>
                  <p>Completed</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <h4>{enrolledCourses.reduce((acc, c) => acc + c.totalHours, 0)}</h4>
                  <p>Total Hours</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Award size={24} />
                </div>
                <div className="stat-info">
                  <h4>{enrolledCourses.filter((c) => c.certificateEligible).length}</h4>
                  <p>Certificates Available</p>
                </div>
              </div>
            </div>
          </section>

          {/* Search and Filter */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Course Library</h2>
            </div>

            <div className="d-flex gap-3 mb-3">
              <div className="search-bar" style={{ flex: 1, maxWidth: "400px" }}>
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search courses..."
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
                <option value="all">All Courses</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="not_started">Not Started</option>
              </select>
            </div>

            {/* Courses Grid */}
            <div className="courses-grid">
              {ALL_COURSES.map((course) => {
                const enrolled = isEnrolled(course.key)
                return (
                  <div key={course.key} className="course-card">
                    <img src={course.image} alt={course.label} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                    <h3>{course.label}</h3>
                    <p>{course.description}</p>
                    {enrolled ? (
                      <span className="enrolled-badge">Enrolled</span>
                    ) : (
                      <button className="btn btn-primary" onClick={() => handleEnroll(course.key)}>
                        Enroll
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center mt-3">
                <p>No courses found matching your criteria.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default StudentCourses
