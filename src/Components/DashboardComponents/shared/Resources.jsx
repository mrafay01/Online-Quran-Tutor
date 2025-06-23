"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Sidebar from '../Sidebar'
import { Menu, Search, Filter, Book, Video, FileText, Download, Play, Star, User, Eye, Headphones } from "lucide-react"
import AvatarImg from '../../Assets/Images/boy-avatar.png'
import '../dashboard.css'

const Resources = () => {
  const { username, role } = useParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState("resources")
  const [resources, setResources] = useState([])
  const [filteredResources, setFilteredResources] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username || !role) return
    setLoading(true)
    fetch(`http://localhost:5000/Get${role.charAt(0).toUpperCase() + role.slice(1)}Resources?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error)
        else {
          setResources(data)
          setFilteredResources(data)
        }
        setLoading(false)
      })
      .catch(err => {
        setError("Failed to fetch resources data")
        setLoading(false)
      })
  }, [username, role])

  useEffect(() => {
    let filtered = resources

    if (searchTerm) {
      filtered = filtered.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== "all") {
      filtered = filtered.filter((resource) => resource.type === filterType)
    }

    setFilteredResources(filtered)
  }, [searchTerm, filterType, resources])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const handleSectionChange = (section) => setActiveSection(section)

  const getResourceIcon = (type) => {
    switch (type) {
      case "video":
        return <Video size={20} />
      case "audio":
        return <Headphones size={20} />
      case "pdf":
        return <FileText size={20} />
      default:
        return <Book size={20} />
    }
  }

  const getResourceTypeColor = (type) => {
    const colors = {
      video: "#e74c3c",
      audio: "#9b59b6",
      pdf: "#3498db",
    }
    return colors[type] || "#666"
  }

  // Create userInfo object from URL params and fetched data
  const userInfo = {
    name: resources[0]?.userName || username,
    role: role,
    avatar: AvatarImg
  }

  if (loading) return <div className="loading">Loading resources...</div>
  if (error) return <div className="error">{error}</div>
  if (!resources.length) return <div className="no-resources">No resources found.</div>

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
            <h1>Resources</h1>
            <p className="page-subtitle">Access learning materials and downloads</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Resource Overview Stats */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Resource Library</h2>
            </div>
            <div className="resource-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <Book size={24} />
                </div>
                <div className="stat-info">
                  <h4>{resources.length}</h4>
                  <p>Total Resources</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Video size={24} />
                </div>
                <div className="stat-info">
                  <h4>{resources.filter((r) => r.type === "video").length}</h4>
                  <p>Video Tutorials</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FileText size={24} />
                </div>
                <div className="stat-info">
                  <h4>{resources.filter((r) => r.type === "pdf").length}</h4>
                  <p>PDF Guides</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Headphones size={24} />
                </div>
                <div className="stat-info">
                  <h4>{resources.filter((r) => r.type === "audio").length}</h4>
                  <p>Audio Files</p>
                </div>
              </div>
            </div>
          </section>

          {/* Search and Filter */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Browse Resources</h2>
            </div>

            <div className="d-flex gap-3 mb-3">
              <div className="search-bar" style={{ flex: 1, maxWidth: "400px" }}>
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{ minWidth: "150px" }}
              >
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="pdf">PDFs</option>
              </select>
              <button className="btn btn-secondary">
                <Filter size={16} />
                More Filters
              </button>
            </div>

            {/* Resources Grid */}
            <div className="resources-grid">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="resource-card">
                  <div className="resource-thumbnail">
                    <img src={resource.thumbnail || "/placeholder.svg"} alt={resource.title} />
                    <div
                      className="resource-type-badge"
                      style={{ backgroundColor: getResourceTypeColor(resource.type) }}
                    >
                      {getResourceIcon(resource.type)}
                      {resource.type.toUpperCase()}
                    </div>
                    {resource.duration && (
                      <div
                        style={{
                          position: "absolute",
                          bottom: "10px",
                          right: "10px",
                          background: "rgba(0,0,0,0.7)",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.8rem",
                        }}
                      >
                        {resource.duration}
                      </div>
                    )}
                  </div>

                  <div className="resource-content">
                    <div className="resource-header">
                      <h3>{resource.title}</h3>
                      <span
                        className="resource-category"
                        style={{
                          background: "rgba(92, 114, 74, 0.1)",
                          color: "var(--primary-dark)",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                        }}
                      >
                        {resource.category}
                      </span>
                    </div>

                    <p className="resource-description">{resource.description}</p>

                    <div className="resource-meta">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                          fontSize: "0.8rem",
                          color: "var(--text-light)",
                        }}
                      >
                        <span>
                          <User size={12} /> {resource.author}
                        </span>
                        <span>
                          <Download size={12} /> {resource.downloads}
                        </span>
                        <span>{resource.size}</span>
                      </div>
                      <div className="resource-rating">
                        <Star size={14} fill="currentColor" style={{ color: "#ffa500" }} />
                        <span>{resource.rating}</span>
                        <span style={{ color: "var(--text-light)" }}>({resource.reviews})</span>
                      </div>
                    </div>

                    <div className="resource-tags" style={{ margin: "10px 0" }}>
                      {resource.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            background: "rgba(92, 114, 74, 0.1)",
                            color: "var(--primary)",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "0.7rem",
                            marginRight: "5px",
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="resource-actions">
                      {resource.type === "video" || resource.type === "audio" ? (
                        <button className="play-btn">
                          <Play size={16} />
                          {resource.type === "video" ? "Watch" : "Listen"}
                        </button>
                      ) : (
                        <button className="download-btn">
                          <Download size={16} />
                          Download
                        </button>
                      )}
                      <button className="preview-btn">
                        <Eye size={16} />
                        Preview
                      </button>
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

export default Resources
