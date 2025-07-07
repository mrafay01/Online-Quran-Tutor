"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../Sidebar'
import { Menu, User, Bell, Shield, Globe, Palette, Download, Upload, Save, Eye, EyeOff } from "lucide-react"
import AvatarImg from '../../Assets/Images/boy-avatar.png'
import '../dashboard.css'
import timezoneOptions from '../../../timezone-options.json'

const Settings = () => {
  const { username, role } = useParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("settings")
  const [settingsData, setSettingsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!username || !role) return
    setLoading(true)
    fetch(`http://localhost:5000/Get${role.charAt(0).toUpperCase() + role.slice(1)}Settings?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setSettingsData(data)
        setLoading(false)
      })
      .catch(err => {
        setError("Failed to fetch settings data")
        setLoading(false)
      })
  }, [username, role])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const handleSectionChange = (section) => setActiveSection(section)

  // Create userInfo object from URL params and fetched data
  const userInfo = {
    name: settingsData?.name || username,
    role: role,
    avatar: AvatarImg
  }

  if (loading) return <div className="loading">Loading settings...</div>
  if (error) return <div className="error">{error}</div>
  if (!settingsData) return <div className="no-data">No settings data found.</div>

  return (
    <div className="dashboard-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userInfo={userInfo}
        unreadNotifications={3}
      />

      <div className="main-content">
        <div className="top-bar">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="page-title">
            <h1>Settings</h1>
            <p className="page-subtitle">Manage your account preferences</p>
          </div>
        </div>

        <div className="settings-content">
          {/* Settings Navigation */}
          <div className="settings-nav">
            <button
              className={`nav-tab ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              <User size={20} />
              Profile
            </button>
            <button
              className={`nav-tab ${activeTab === "notifications" ? "active" : ""}`}
              onClick={() => setActiveTab("notifications")}
            >
              <Bell size={20} />
              Notifications
            </button>
            <button
              className={`nav-tab ${activeTab === "security" ? "active" : ""}`}
              onClick={() => setActiveTab("security")}
            >
              <Shield size={20} />
              Security
            </button>
            <button
              className={`nav-tab ${activeTab === "preferences" ? "active" : ""}`}
              onClick={() => setActiveTab("preferences")}
            >
              <Globe size={20} />
              Preferences
            </button>
          </div>

          {/* Settings Content */}
          <div className="settings-panel">
            {activeTab === "profile" && (
              <div className="settings-section">
                <h2>Profile Information</h2>
                <div className="profile-form">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      defaultValue={settingsData.name}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      defaultValue={settingsData.email}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      defaultValue={settingsData.phone}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea
                      defaultValue={settingsData.bio}
                      placeholder="Tell us about yourself"
                      rows={4}
                    />
                  </div>
                  <button className="btn btn-primary">
                    <Save size={16} />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="settings-section">
                <h2>Notification Preferences</h2>
                <div className="notification-settings">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Email Notifications</h3>
                      <p>Receive notifications via email</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        defaultChecked={settingsData.emailNotifications}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Push Notifications</h3>
                      <p>Receive push notifications in browser</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        defaultChecked={settingsData.pushNotifications}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Session Reminders</h3>
                      <p>Get reminded before scheduled sessions</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        defaultChecked={settingsData.sessionReminders}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Course Updates</h3>
                      <p>Notifications about new lessons and course updates</p>
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        defaultChecked={settingsData.courseUpdates}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="settings-section">
                <h2>Security Settings</h2>
                <div className="security-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <div className="password-input">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <button className="btn btn-primary">
                    <Save size={16} />
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div className="settings-section">
                <h2>Preferences</h2>
                <div className="preferences-form">
                  <div className="form-group">
                    <label>Timezone</label>
                    <select defaultValue={settingsData.timezone}>
                      {timezoneOptions.map((timezone) => (
                        <option key={timezone.value} value={timezone.value}>
                          {timezone.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Language</label>
                    <select defaultValue={settingsData.language}>
                      <option value="en">English</option>
                      <option value="ar">العربية</option>
                      <option value="ur">اردو</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Theme</label>
                    <select defaultValue={settingsData.theme}>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <button className="btn btn-primary">
                    <Save size={16} />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
