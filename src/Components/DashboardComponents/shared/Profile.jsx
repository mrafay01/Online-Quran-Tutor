"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../Sidebar'
import { Menu, User, Mail, Phone, Calendar, MapPin, Edit, Save, Camera, Award, BookOpen, Clock, Target } from "lucide-react"
import AvatarImg from '../../Assets/Images/boy-avatar.png'
import '../dashboard.css'

const Profile = () => {
  const { username, role } = useParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("profile")
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (!username || !role) return
    setLoading(true)
    fetch(`http://localhost:5000/Get${role.charAt(0).toUpperCase() + role.slice(1)}Profile?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setProfileData(data)
        setLoading(false)
      })
      .catch(err => {
        setError("Failed to fetch profile data")
        setLoading(false)
      })
  }, [username, role])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const handleSectionChange = (section) => setActiveSection(section)

  // Create userInfo object from URL params and fetched data
  const userInfo = {
    name: profileData?.name || username,
    role: role,
    avatar: AvatarImg
  }

  if (loading) return <div className="loading">Loading profile...</div>
  if (error) return <div className="error">{error}</div>
  if (!profileData) return <div className="no-data">No profile data found.</div>

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
            <h1>Profile</h1>
            <p className="page-subtitle">Manage your personal information</p>
          </div>
        </div>

        <div className="profile-content">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar">
              <img src={profileData.avatar || AvatarImg} alt={profileData.name} />
              <button className="avatar-edit">
                <Camera size={16} />
              </button>
            </div>
            <div className="profile-info">
              <h2>{profileData.name}</h2>
              <p className="profile-role">{profileData.role}</p>
              <p className="profile-bio">{profileData.bio}</p>
              <button
                className="edit-btn"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit size={16} />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>

          <div className="profile-sections">
            {/* Personal Information */}
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <Mail size={16} />
                  <div>
                    <label>Email</label>
                    <p>{profileData.email}</p>
                  </div>
                </div>
                <div className="info-item">
                  <Phone size={16} />
                  <div>
                    <label>Phone</label>
                    <p>{profileData.phone}</p>
                  </div>
                </div>
                <div className="info-item">
                  <Calendar size={16} />
                  <div>
                    <label>Date of Birth</label>
                    <p>{profileData.dateOfBirth}</p>
                  </div>
                </div>
                <div className="info-item">
                  <MapPin size={16} />
                  <div>
                    <label>Location</label>
                    <p>{profileData.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Statistics */}
            <div className="profile-section">
              <h3>Learning Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <BookOpen size={24} />
                  </div>
                  <div className="stat-info">
                    <h4>{profileData.totalCourses}</h4>
                    <p>Courses Enrolled</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <Clock size={24} />
                  </div>
                  <div className="stat-info">
                    <h4>{profileData.totalHours}h</h4>
                    <p>Study Time</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <Target size={24} />
                  </div>
                  <div className="stat-info">
                    <h4>{profileData.completedLessons}</h4>
                    <p>Lessons Completed</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <Award size={24} />
                  </div>
                  <div className="stat-info">
                    <h4>{profileData.achievements}</h4>
                    <p>Achievements</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Courses */}
            <div className="profile-section">
              <h3>Current Courses</h3>
              <div className="courses-list">
                {profileData.currentCourses?.map((course) => (
                  <div key={course.id} className="course-item">
                    <div className="course-info">
                      <h4>{course.title}</h4>
                      <p>👨‍🏫 {course.teacher}</p>
                      <div className="course-progress">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <span>{course.progress}%</span>
                      </div>
                    </div>
                    <div className="course-status">
                      <span className={`status-badge ${course.status}`}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="profile-section">
              <h3>Recent Achievements</h3>
              <div className="achievements-list">
                {profileData.recentAchievements?.map((achievement) => (
                  <div key={achievement.id} className="achievement-item">
                    <div className="achievement-icon">
                      <span>{achievement.icon}</span>
                    </div>
                    <div className="achievement-info">
                      <h4>{achievement.title}</h4>
                      <p>{achievement.description}</p>
                      <span className="achievement-date">
                        {achievement.earnedDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
