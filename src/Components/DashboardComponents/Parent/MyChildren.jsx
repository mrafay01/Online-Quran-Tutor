"use client"

import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom'
import Sidebar from '../Sidebar'
import { Menu, Plus, Baby, BookOpen, Clock, Calendar, Award, Edit, Eye, MoreVertical, User } from "lucide-react"
import '../dashboard.css'

const MyChildren = () => {
  const { username, role } = useParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("children")
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('Params:', { username, role });
    if (!username || !role) return
    setLoading(true)
    console.log('Fetching children for', username);
    fetch(`http://localhost:5000/GetParentChildren?username=${username}`)
      .then(res => {
        console.log('Response:', res);
        return res.json();
      })
      .then(data => {
        console.log('Data:', data);
        if (data.error) setError(data.error)
        else setChildren(Array.isArray(data.children) ? data.children : [])
        setLoading(false)
      })
      .catch(err => {
        setError("Failed to fetch children data")
        setLoading(false)
        console.log('Fetch error:', err);
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

  if (loading) return <div className="loading">Loading children data...</div>
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
            <h1>My Children</h1>
            <p className="page-subtitle">Monitor your children's learning progress</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Children Details Only */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>{children.map((child) => child.name)}</h2>
            </div>
            <div className="children-grid">
              {children.map((child) => (
                <div key={child.id} className="child-card">
                  <div className="child-header">
                    <div className="child-avatar">
                      {child.avatar && <img src={child.avatar} alt={child.name} />}
                    </div>
                    <div className="child-info">
                      {child.username && <p className="child-username">Username: {child.username}</p>}
                      {child.age !== undefined && <p className="child-age">Age: {child.age}</p>}
                      {child.gender && <p className="child-gender">Gender: {child.gender}</p>}
                      {child.region && <p className="child-region">Region: {child.region}</p>}
                    </div>
                  </div>
                  {/* Show courses if present */}
                  {Array.isArray(child.courses) && child.courses.length > 0 && (
                    <div className="child-courses">
                      <h4>Courses</h4>
                      <ul style={{ paddingLeft: 18 }}>
                        {child.courses.map(course => (
                          <li key={course.id} style={{ marginBottom: 6 }}>
                            <strong>{course.name}</strong>
                            {course.description && <span style={{ color: '#666', marginLeft: 8, fontSize: '0.95em' }}> - {course.description}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default MyChildren
