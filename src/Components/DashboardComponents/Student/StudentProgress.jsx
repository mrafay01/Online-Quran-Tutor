"use client"

import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom'
import Sidebar from '../Sidebar'
import { Menu, BookOpen, CheckCircle, Clock, Play, Award, TrendingUp, Calendar, Target, Download } from "lucide-react"
import '../dashboard.css'

const StudentProgress = () => {
  const { username, role } = useParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("progress")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username || !role) return
    setLoading(true)
    fetch(`http://localhost:5000/GetStudentProgress?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setProgressData(data)
        setLoading(false)
      })
      .catch(err => {
        setError("Failed to fetch progress data")
        setLoading(false)
      })
  }, [username, role])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const handleSectionChange = (section) => setActiveSection(section)

  const getSelectedCourseData = () => {
    if (selectedCourse === "all" || !progressData) return null
    return progressData.courses.find((course) => course.id === Number.parseInt(selectedCourse))
  }

  const getScoreColor = (score) => {
    if (score >= 90) return "var(--success)"
    if (score >= 80) return "var(--warning)"
    return "var(--danger)"
  }

  // Create userInfo object for Sidebar
  const userInfo = {
    name: username,
    role: role,
    avatar: "/placeholder.svg"
  }

  if (loading) return <div className="loading">Loading progress data...</div>
  if (error) return <div className="error">{error}</div>

  const selectedCourseData = getSelectedCourseData()

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
            <h1>Progress</h1>
            <p className="page-subtitle">Track your learning journey</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Overall Progress Stats */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Overall Progress</h2>
              <button className="btn btn-secondary">
                <Download size={16} />
                Export Report
              </button>
            </div>
            <div className="progress-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <BookOpen size={24} />
                </div>
                <div className="stat-info">
                  <h4>
                    {progressData.overallStats.completedLessons}/{progressData.overallStats.totalLessons}
                  </h4>
                  <p>Lessons Completed</p>
                </div>
                <div className="stat-trend">
                  <TrendingUp size={16} />
                  {Math.round(
                    (progressData.overallStats.completedLessons / progressData.overallStats.totalLessons) * 100,
                  )}
                  %
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <h4>{progressData.overallStats.totalHours}h</h4>
                  <p>Total Study Time</p>
                </div>
                <div className="stat-trend">
                  <Clock size={16} />
                  This month
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Target size={24} />
                </div>
                <div className="stat-info">
                  <h4>{progressData.overallStats.averageScore}%</h4>
                  <p>Average Score</p>
                </div>
                <div className="stat-trend">
                  <TrendingUp size={16} />
                  Excellent
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Award size={24} />
                </div>
                <div className="stat-info">
                  <h4>{progressData.overallStats.currentStreak}</h4>
                  <p>Day Streak</p>
                </div>
                <div className="stat-trend">
                  <Award size={16} />
                  Keep it up!
                </div>
              </div>
            </div>
          </section>

          {/* Course Selection */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Course Progress</h2>
              <select
                className="form-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{ minWidth: "200px" }}
              >
                <option value="all">All Courses Overview</option>
                {progressData.courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedCourse === "all" ? (
              /* All Courses Overview */
              <div className="courses-progress-grid">
                {progressData.courses.map((course) => (
                  <div key={course.id} className="course-progress-card">
                    <div className="course-header">
                      <h3>{course.title}</h3>
                      <span className={`status-badge ${course.status === "completed" ? "confirmed" : "pending"}`}>
                        {course.status === "completed" ? "Completed" : "In Progress"}
                      </span>
                    </div>
                    <p className="course-teacher">👨‍🏫 {course.teacher}</p>

                    <div className="course-progress-details">
                      <div className="progress-item">
                        <div className="progress-text">
                          <span>Lessons Progress</span>
                          <span>
                            {course.completedLessons}/{course.totalLessons}
                          </span>
                        </div>
                        <div className="progress-bar-container">
                          <div className="progress-bar" style={{ width: `${course.progress}%` }}></div>
                        </div>
                        <div className="progress-percentage">{course.progress}%</div>
                      </div>

                      <div className="course-stats">
                        <div className="course-stat">
                          <Clock size={14} />
                          <span>{course.timeSpent}h studied</span>
                        </div>
                        <div className="course-stat">
                          <Target size={14} />
                          <span>{course.averageScore}% avg score</span>
                        </div>
                        <div className="course-stat">
                          <Calendar size={14} />
                          <span>Last: {new Date(course.lastAccessed).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedCourse(course.id.toString())}
                      style={{ width: "100%", marginTop: "15px" }}
                    >
                      View Detailed Progress
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* Detailed Course Progress */
              selectedCourseData && (
                <div className="detailed-course-progress">
                  <div className="course-overview">
                    <div className="course-info">
                      <h3>{selectedCourseData.title}</h3>
                      <p>👨‍🏫 {selectedCourseData.teacher}</p>
                      <p>📅 Enrolled: {new Date(selectedCourseData.enrolledDate).toLocaleDateString()}</p>
                    </div>
                    <div className="course-progress-circle">
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
                            strokeDasharray={`${selectedCourseData.progress * 3.14} 314`}
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                          />
                        </svg>
                        <div className="progress-percentage">{selectedCourseData.progress}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Weekly Progress Chart */}
                  {selectedCourseData.weeklyProgress && (
                    <div className="weekly-progress">
                      <h4>Weekly Progress</h4>
                      <div className="progress-chart">
                        {selectedCourseData.weeklyProgress.map((week, index) => (
                          <div key={index} className="chart-bar">
                            <div className="bar-container" style={{ height: "100px" }}>
                              <div
                                className="bar target-bar"
                                style={{ height: `${(week.target / 5) * 100}%`, opacity: 0.3 }}
                              ></div>
                              <div
                                className="bar completed-bar"
                                style={{ height: `${(week.completed / 5) * 100}%` }}
                              ></div>
                            </div>
                            <div className="bar-label">{week.week}</div>
                            <div className="bar-value">
                              {week.completed}/{week.target}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lessons List */}
                  <div className="lessons-progress">
                    <h4>Lesson Progress</h4>
                    <div className="lessons-list">
                      {selectedCourseData.lessons.map((lesson) => (
                        <div key={lesson.id} className={`lesson-item ${lesson.completed ? "completed" : "pending"}`}>
                          <div className="lesson-status">
                            {lesson.completed ? (
                              <CheckCircle size={20} style={{ color: "var(--success)" }} />
                            ) : (
                              <Play size={20} style={{ color: "var(--text-light)" }} />
                            )}
                          </div>
                          <div className="lesson-info">
                            <h5>
                              Lesson {lesson.id}: {lesson.title}
                            </h5>
                            <div className="lesson-meta">
                              <span>
                                <Clock size={12} /> {lesson.duration}
                              </span>
                              {lesson.completed && (
                                <>
                                  <span>
                                    <Target size={12} /> Score: {lesson.score}%
                                  </span>
                                  <span>
                                    <Calendar size={12} /> {new Date(lesson.completedDate).toLocaleDateString()}
                                  </span>
                                  {lesson.attempts > 1 && (
                                    <span style={{ color: "var(--warning)" }}>🔄 {lesson.attempts} attempts</span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="lesson-actions">
                            {lesson.completed ? (
                              <div className="lesson-score" style={{ color: getScoreColor(lesson.score) }}>
                                {lesson.score}%
                              </div>
                            ) : (
                              <button className="btn btn-primary btn-sm">Start Lesson</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </section>

          {/* Recent Achievements */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Recent Achievements</h2>
            </div>
            <div className="achievements-grid">
              {progressData.achievements.map((achievement) => (
                <div key={achievement.id} className="achievement-card">
                  <div className="achievement-icon">
                    <span style={{ fontSize: "2rem" }}>{achievement.icon}</span>
                  </div>
                  <div className="achievement-info">
                    <h4>{achievement.title}</h4>
                    <p>{achievement.description}</p>
                    <span className="achievement-date">
                      Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                    </span>
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

export default StudentProgress
