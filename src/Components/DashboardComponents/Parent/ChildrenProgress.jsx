"use client"

import { useState, useEffect } from "react"
import Sidebar from '../Sidebar'
import { Menu, Clock, User, BookOpen, Award, TrendingUp, Calendar } from "lucide-react"
import '../dashboard.css'
import { useParams, useNavigate } from "react-router-dom"

const ChildrenProgress = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("children-progress")
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { username } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/parent/children-progress?username=${username}`)
      .then(res => res.json())
      .then(data => {
        setProgressData(data);
        setLoading(false);
      })
      .catch(err => {
        setProgressData(null);
        setLoading(false);
      });
  }, [username]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const handleSectionChange = (section) => setActiveSection(section)

  const handleViewLessons = (child, course) => {
    const queryParams = new URLSearchParams({
      student_username: child.username,
      course_id: course.id,
      teacher_username: course.teacher_username,
    }).toString();
    navigate(`/parent/${username}/children-progress-detail?${queryParams}`);
  };

  if (loading) return <div className="loading">Loading progress data...</div>

  return (
    <div className="dashboard-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        unreadNotifications={2}
      />

      <div className="main-content">
        <div className="top-bar">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="page-title">
            <h1>Children's Progress</h1>
            <p className="page-subtitle">Monitor your children's learning journey</p>
          </div>
        </div>

        <div className="dashboard-content">
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Progress Overview</h2>
            </div>
            <div className="children-progress-grid">
              {progressData && Array.isArray(progressData.children) && progressData.children.length > 0 ? (
                progressData.children.map((child) => (
                  <div key={child.id} className="child-progress-card">
                    <div className="child-header">
                      <div className="child-avatar">
                        {child.avatar ? (
                          <img src={child.avatar} alt={child.name} />
                        ) : (
                          <User size={48} style={{ color: '#ccc' }} />
                        )}
                      </div>
                      <div className="child-info">
                        <h3>{child.name}</h3>
                        {child.age !== undefined && <p>Age: {child.age}</p>}
                        {child.enrolledDate && (
                          <p className="enrollment-date">
                            <Calendar size={14} /> Enrolled: {new Date(child.enrolledDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="child-progress-summary">
                      <div className="progress-item">
                        <span>Overall Progress</span>
                        <div className="progress-bar-container">
                          <div className="progress-bar" style={{ width: `${child.overallProgress || 0}%` }}></div>
                        </div>
                        <span className="progress-percentage">{child.overallProgress || 0}%</span>
                      </div>
                      <div className="child-stats">
                        <div className="child-stat">
                          <Clock size={14} />
                          <span>{child.totalHours || 0}h total</span>
                        </div>
                        <div className="child-stat">
                          <BookOpen size={14} />
                          <span>{child.completedLessons || 0} / {child.totalLessons || 0} lessons</span>
                        </div>
                      </div>
                    </div>
                    {child.courses && child.courses.length > 0 ? (
                      child.courses.map(course => (
                        <div key={course.id} className="child-course-block" style={{ marginBottom: 12 }}>
                          <div style={{ fontWeight: 500, color: '#2d4a2d' }}>
                            {course.name}
                          </div>
                          <div style={{ fontSize: '0.95rem', color: '#666', marginBottom: 4 }}>
                            Teacher: {course.teacher_name}
                          </div>
                          <button
                            onClick={() => handleViewLessons(child, course)}
                            className="view-lessons-btn"
                          >
                            View Lessons
                          </button>
                        </div>
                      ))
                    ) : (
                      <span style={{ color: '#888', fontSize: '0.9rem' }}>No courses found</span>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ color: '#888', textAlign: 'center', padding: '2rem' }}>No children data found.</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default ChildrenProgress
