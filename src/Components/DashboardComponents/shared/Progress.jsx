"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../Sidebar'
import { Menu, BookOpen, Clock, Award, Target } from "lucide-react"
import AvatarImg from '../../Assets/Images/boy-avatar.png'
import '../dashboard.css'
import timezoneOptions from '../../../timezone-options.json'

const Progress = () => {
  const { username, role } = useParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("progress")
  const [progressData, setProgressData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username || !role) return
    setLoading(true)
    fetch(`http://localhost:5000/Get${role.charAt(0).toUpperCase() + role.slice(1)}Progress?username=${username}`)
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

  if (loading) return <div className="loading">Loading progress data...</div>
  if (error) return <div className="error">{error}</div>
  if (!progressData) return <div className="no-data">No progress data found.</div>

  // Create userInfo object from URL params and fetched data
  const userInfo = {
    name: progressData.name || username,
    role: role,
    avatar: AvatarImg
  }

  return (
    <div className="dashboard-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userInfo={userInfo}
        unreadNotifications={5}
      />

      <div className="main-content">
        <div className="top-bar">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="page-title">
            <h1>Progress Overview</h1>
            <p className="page-subtitle">Track your learning journey</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Overall Progress Stats */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Overall Progress</h2>
            </div>
            <div className="progress-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <BookOpen size={24} />
                </div>
                <div className="stat-info">
                  <h4>
                    {progressData.completedCourses}/{progressData.totalCourses}
                  </h4>
                  <p>Courses Completed</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <h4>{progressData.totalHours}h</h4>
                  <p>Total Study Time</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Target size={24} />
                </div>
                <div className="stat-info">
                  <h4>{progressData.overallProgress}%</h4>
                  <p>Overall Progress</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Award size={24} />
                </div>
                <div className="stat-info">
                  <h4>{progressData.currentStreak}</h4>
                  <p>Day Streak</p>
                </div>
              </div>
            </div>
          </section>

          {/* Course Progress */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Course Progress</h2>
            </div>
            <div className="courses-progress-grid">
              {progressData.courses.map((course) => (
                <div key={course.id} className="course-progress-card">
                  <div className="course-header">
                    <h3>{course.title}</h3>
                  </div>
                  <p className="course-teacher">👨‍🏫 {course.teacher}</p>

                  <div className="course-progress-details">
                    <div className="progress-item">
                      <div className="progress-text">
                        <span>Progress</span>
                        <span>
                          {course.completedLessons}/{course.totalLessons} lessons
                        </span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${course.progress}%` }}></div>
                      </div>
                      <div className="progress-percentage">{course.progress}%</div>
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

export default Progress
