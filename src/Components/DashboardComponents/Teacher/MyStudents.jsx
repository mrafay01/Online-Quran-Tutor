"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from 'react-router-dom'
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
  Eye,
} from "lucide-react"

const MyStudents = () => {
  const { username, role } = useParams()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("my-students")
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (!username || !role) return
    setLoading(true)
    fetch(`http://localhost:5000/GetTeacherStudents?username=${username}`)
      .then(res => res.json())
      .then(async (data) => {
        if (data.error) {
          setError(data.error)
          setLoading(false)
          return
        }
        
        const courses = Array.isArray(data.courses) ? data.courses : []
        
        // Fetch progress data for each student in each course
        const coursesWithProgress = await Promise.all(
          courses.map(async (course) => {
            if (!course.students || course.students.length === 0) {
              return course
            }
            
            const studentsWithProgress = await Promise.all(
              course.students.map(async (student) => {
                try {
                  const progressRes = await fetch(`http://localhost:5000/GetStudentProgress?username=${student.username}`)
                  const progressData = await progressRes.json()
                  
                  // Find the specific course progress
                  const courseProgress = progressData.progress?.find(c => c.courseId === course.courseId)
                  
                  return {
                    ...student,
                    lessonsCompleted: courseProgress?.completedLessons || 0,
                    totalLessons: courseProgress?.totalCourseLessons || 0,
                    courseCompletionPercent: courseProgress?.progressPercent || 0
                  }
                } catch (err) {
                  console.error(`Failed to fetch progress for student ${student.username}:`, err)
                  return {
                    ...student,
                    lessonsCompleted: 0,
                    totalLessons: 0,
                    courseCompletionPercent: 0
                  }
                }
              })
            )
            
            return {
              ...course,
              students: studentsWithProgress
            }
          })
        )
        
        setCourses(coursesWithProgress)
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

  const handleViewProgress = (student, course) => {
    const queryParams = new URLSearchParams({
      student_username: student.username,
      course_id: course.courseId,
      student_name: student.name,
      course_name: course.courseName,
    }).toString();
    
    navigate(`/${role}/${username}/lesson-progress?${queryParams}`);
  };

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
          {/* Students by Course */}
          {courses.length === 0 ? (
            <div className="no-data">No students found.</div>
          ) : (
            courses.map(course => (
              <div key={course.courseId} className="course-students-section" style={{ marginBottom: 40, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: 24, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
                <h2 style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#2d4a2d', fontSize: '1.3rem' }}>{course.courseName}</h2>
                <p style={{ color: '#666', marginBottom: 16 }}>{course.courseDescription}</p>
                {(!course.students || course.students.length === 0) ? (
                  <div style={{ color: '#888', marginBottom: 16 }}>No students enrolled in this course.</div>
                ) : (
                  <div className="students-grid">
                    {course.students.map(student => (
                      <div key={student.studentId} className="student-card" style={{ border: '1px solid #e0e0e0', borderRadius: '12px', boxShadow: '0 2px 8px rgba(44,62,80,0.08)', margin: '18px 0', padding: '18px 20px', background: '#fff', display: 'flex', alignItems: 'center', gap: '24px', minWidth: '220px', maxWidth: '100%' }}>
                        <div className="student-avatar">
                          <img src={student.avatar || "/placeholder.svg"} alt={student.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid #cbe7cb' }} />
                        </div>
                        <div className="student-info" style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontWeight: 700, color: '#2d4a2d' }}>{student.name}</h4>
                          <p style={{ margin: '4px 0 10px 0', color: '#4a5c2c', fontWeight: 500 }}>@{student.username}</p>
                          <div style={{ marginBottom: 8, color: '#555' }}>Lessons: {student.lessonsCompleted} / {student.totalLessons}</div>
                          <div style={{ marginBottom: 8, color: '#555' }}>Completion: {student.courseCompletionPercent}%</div>
                        </div>
                        <div className="student-actions">
                          <button
                            onClick={() => handleViewProgress(student, course)}
                            style={{
                              background: '#4a5c2c',
                              color: '#fff',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: '0.9rem',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#b6e2b6';
                              e.target.style.color = '#4a5c2c';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#4a5c2c';
                              e.target.style.color = '#fff';
                            }}
                          >
                            <Eye size={16} />
                            View Progress
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default MyStudents
