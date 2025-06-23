"use client"

import { useState, useEffect } from "react"
import Sidebar from '../Sidebar'
import {
  Menu,
  CheckCircle,
  Clock,
  Award,
  TrendingUp,
  Calendar,
  Target,
  User,
  Download,
  MessageSquare,
} from "lucide-react"
import '../dashboard.css'
import { useParams } from "react-router-dom"

const ChildrenProgress = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("children-progress")
  const [selectedChild, setSelectedChild] = useState("all")
  const [selectedTimeframe, setSelectedTimeframe] = useState("month")
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { username } = useParams()

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
        // Optionally set an error state
      });
  }, [username]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const handleSectionChange = (section) => setActiveSection(section)

  const getSelectedChildData = () => {
    if (selectedChild === "all" || !progressData) return null
    return progressData.children.find((child) => child.id === Number.parseInt(selectedChild))
  }

  const getOverallStats = () => {
    if (!progressData) return {}
    return {
      totalChildren: progressData.children.length,
      totalHours: progressData.children.reduce((acc, child) => acc + child.totalHours, 0),
      averageProgress: Math.round(
        progressData.children.reduce((acc, child) => acc + child.overallProgress, 0) / progressData.children.length,
      ),
    }
  }

  if (loading) return <div className="loading">Loading progress data...</div>

  const selectedChildData = getSelectedChildData()
  const overallStats = getOverallStats()

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
          {/* Overall Stats */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Overall Progress Summary</h2>
              <button className="btn btn-secondary">
                <Download size={16} />
                Export Report
              </button>
            </div>
            <div className="children-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <User size={24} />
                </div>
                <div className="stat-info">
                  <h4>{overallStats.totalChildren}</h4>
                  <p>Children Enrolled</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <h4>{overallStats.totalHours}h</h4>
                  <p>Total Study Time</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <h4>{overallStats.averageProgress}%</h4>
                  <p>Average Progress</p>
                </div>
              </div>
            </div>
          </section>

          {/* Child Selection */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Detailed Progress</h2>
              <div className="d-flex gap-2">
                <select
                  className="form-select"
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  style={{ minWidth: "200px" }}
                >
                  <option value="all">All Children</option>
                  {progressData.children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
                <select
                  className="form-select"
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  style={{ minWidth: "150px" }}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
            </div>

            {selectedChild === "all" ? (
              /* All Children Overview */
              <div className="children-progress-grid">
                {progressData.children.map((child) => (
                  <div key={child.id} className="child-progress-card">
                    <div className="child-header">
                      <div className="child-avatar">
                        <img src={child.avatar || "/placeholder.svg"} alt={child.name} />
                      </div>
                      <div className="child-info">
                        <h3>{child.name}</h3>
                        <p>Age: {child.age}</p>
                        <p className="enrollment-date">
                          📅 Enrolled: {new Date(child.enrolledDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="child-progress-summary">
                      <div className="progress-item">
                        <div className="progress-text">
                          <span>Overall Progress</span>
                          <span>{child.overallProgress}%</span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar" style={{ width: `${child.overallProgress}%` }}></div>
                        </div>
                      </div>

                      <div className="child-stats">
                        <div className="child-stat">
                          <Clock size={14} />
                          <span>{child.totalHours}h total</span>
                        </div>
                        <div className="child-stat">
                          <Target size={14} />
                          <span>{child.averageScore}% avg score</span>
                        </div>
                        <div className="child-stat">
                          <Award size={14} />
                          <span>{child.currentStreak} day streak</span>
                        </div>
                      </div>

                      <div className="current-courses">
                        <h5>Current Courses ({child.courses.length})</h5>
                        {child.courses.map((course) => (
                          <div key={course.id} className="course-summary">
                            <div className="course-info">
                              <span className="course-name">{course.title}</span>
                              <span className="course-progress">{course.progress}%</span>
                            </div>
                            <div className="progress-bar-container" style={{ height: "4px" }}>
                              <div className="progress-bar" style={{ width: `${course.progress}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="child-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => setSelectedChild(child.id.toString())}
                        style={{ flex: 1 }}
                      >
                        View Details
                      </button>
                      <button className="btn btn-secondary">
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Detailed Child Progress */
              selectedChildData && (
                <div className="detailed-child-progress">
                  {/* Child Overview */}
                  <div className="child-overview">
                    <div className="child-profile">
                      <div className="child-avatar">
                        <img src={selectedChildData.avatar || "/placeholder.svg"} alt={selectedChildData.name} />
                      </div>
                      <div className="child-details">
                        <h3>{selectedChildData.name}</h3>
                        <p>Age: {selectedChildData.age}</p>
                        <p>📅 Enrolled: {new Date(selectedChildData.enrolledDate).toLocaleDateString()}</p>
                        <div className="child-quick-stats">
                          <span>🔥 {selectedChildData.currentStreak} day streak</span>
                        </div>
                      </div>
                    </div>
                    <div className="progress-circle">
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(92, 114, 74, 0.1)" strokeWidth="10" />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth="10"
                          strokeDasharray={`${selectedChildData.overallProgress * 3.14} 314`}
                          strokeLinecap="round"
                          transform="rotate(-90 60 60)"
                        />
                      </svg>
                      <div className="progress-percentage">{selectedChildData.overallProgress}%</div>
                    </div>
                  </div>

                  {/* Weekly Activity Chart */}
                  <div className="weekly-activity">
                    <h4>Weekly Activity</h4>
                    <div className="activity-chart">
                      {selectedChildData.weeklyActivity.map((day, index) => (
                        <div key={index} className="activity-day">
                          <div className="activity-bar-container">
                            <div
                              className="activity-bar lessons-bar"
                              style={{ height: `${(day.lessons / 3) * 100}%` }}
                              title={`${day.lessons} lessons`}
                            ></div>
                          </div>
                          <div className="day-label">{day.day}</div>
                          <div className="day-stats">
                            <div>{day.lessons} lessons</div>
                            <div>{day.hours}h</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Course Progress */}
                  <div className="courses-progress">
                    <h4>Course Progress</h4>
                    <div className="courses-list">
                      {selectedChildData.courses.map((course) => (
                        <div key={course.id} className="course-progress-item">
                          <div className="course-header">
                            <div className="course-info">
                              <h5>{course.title}</h5>
                              <p>👨‍🏫 {course.teacher}</p>
                            </div>
                            <div className="course-stats">
                              <span className="progress-percentage">{course.progress}%</span>
                              <span className="lessons-count">
                                {course.completedLessons}/{course.totalLessons} lessons
                              </span>
                            </div>
                          </div>

                          <div className="progress-bar-container">
                            <div className="progress-bar" style={{ width: `${course.progress}%` }}></div>
                          </div>

                          <div className="course-details">
                            <div className="course-metrics">
                              <div className="metric">
                                <Clock size={14} />
                                <span>{course.timeSpent}h studied</span>
                              </div>
                              <div className="metric">
                                <Target size={14} />
                                <span>{course.averageScore}% avg score</span>
                              </div>
                              <div className="metric">
                                <Calendar size={14} />
                                <span>Last: {new Date(course.lastAccessed).toLocaleDateString()}</span>
                              </div>
                            </div>

                            {course.recentLessons.length > 0 && (
                              <div className="recent-lessons">
                                <h6>Recent Lessons</h6>
                                {course.recentLessons.map((lesson, index) => (
                                  <div key={index} className="recent-lesson">
                                    <CheckCircle size={16} style={{ color: "var(--success)" }} />
                                    <div className="lesson-details">
                                      <span className="lesson-title">{lesson.title}</span>
                                      <div className="lesson-meta">
                                        <span>Score: {lesson.score}%</span>
                                        <span>Time: {lesson.timeSpent}</span>
                                        <span>{new Date(lesson.completedDate).toLocaleDateString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upcoming Sessions */}
                  {selectedChildData.upcomingSessions.length > 0 && (
                    <div className="upcoming-sessions">
                      <h4>Upcoming Sessions</h4>
                      <div className="sessions-list">
                        {selectedChildData.upcomingSessions.map((session, index) => (
                          <div key={index} className="session-item">
                            <div className="session-info">
                              <h5>{session.course}</h5>
                              <p>👨‍🏫 {session.teacher}</p>
                            </div>
                            <div className="session-time">
                              <Calendar size={16} />
                              <span>
                                {new Date(session.date).toLocaleDateString()} at {session.time}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default ChildrenProgress
