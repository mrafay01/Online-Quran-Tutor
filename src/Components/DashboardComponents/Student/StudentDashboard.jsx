"use client";
import { useParams } from "react-router-dom";
import Sidebar from "../Sidebar";
import { useState, useEffect } from "react";
import { Bell, Book, Calendar, ChevronRight, Clock, FileText, Home, LogOut, Menu, MessageSquare, Settings, User, X, Award, BookOpen, BarChart2 } from 'lucide-react';
import "../dashboard.css";

const StudentDashboard = () => {
  const { username } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileRes, dashboardRes] = await Promise.all([
          fetch(`http://localhost:5000/GetStudentProfile?username=${username}`),
          fetch(`http://localhost:5000/GetStudentDashboard?username=${username}`),
        ]);
        
        if (!profileRes.ok || !dashboardRes.ok) {
          throw new Error("Failed to fetch data");
        }
        
        const profileData = await profileRes.json();
        const dashData = await dashboardRes.json();
        setUserData(profileData);
        setDashboardData(dashData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (username) {
      fetchData();
    }
  }, [username]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    console.log(`Navigating to: ${section}`);
  };

  const formatDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!userData || !dashboardData) return <div className="no-data">No data found.</div>;

  return (
    <div className="dashboard-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userInfo={userData}
        unreadNotifications={dashboardData.unreadNotifications || 0}
      />

      <div className="main-content">
        <div className="top-bar">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="page-title">
            <h1>{userData.name} Dashboard</h1>
            <p className="current-date">{formatDate()}</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Progress Section */}
          <section className="dashboard-section progress-section">
            <div className="section-header">
              <h2>My Progress</h2>
              <a href="#" className="view-all" onClick={() => setActiveSection("progress")}>
                View All <ChevronRight size={16} />
              </a>
            </div>
            <div className="progress-overview">
              <div className="progress-card overall-progress">
                <div className="progress-circle">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e6e6e6" strokeWidth="12" />
                    <circle
                      cx="60" cy="60" r="54" fill="none" stroke="#5c724a" strokeWidth="12"
                      strokeDasharray="339.3"
                      strokeDashoffset={339.3 - (339.3 * (dashboardData.overallProgress || 0) / 100)}
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="progress-percentage">{dashboardData.overallProgress || 0}%</div>
                </div>
                <div className="progress-info">
                  <h3>Overall Progress</h3>
                  <p>Keep up the good work!</p>
                </div>
              </div>
              <div className="progress-stats">
                <div className="stat-card">
                  <div className="stat-icon"><Award size={24} /></div>
                  <div className="stat-info">
                    <h4>{dashboardData.coursesInProgress || 0} Courses</h4>
                    <p>In Progress</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><Clock size={24} /></div>
                  <div className="stat-info">
                    <h4>{dashboardData.totalHours || 0} Hours</h4>
                    <p>Total Learning</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon"><BookOpen size={24} /></div>
                  <div className="stat-info">
                    <h4>{dashboardData.lessonsCompleted || 0} Lessons</h4>
                    <p>Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Upcoming Sessions */}
          <section className="dashboard-section upcoming-slots-section">
            <div className="section-header">
              <h2>Upcoming Sessions</h2>
              <a href="#" className="view-all" onClick={() => setActiveSection("schedule")}>
                View All <ChevronRight size={16} />
              </a>
            </div>
            <div className="slots-list">
              {(dashboardData.upcomingSlots || []).map((slot) => (
                <div className="slot-card" key={slot.id}>
                  <div className="slot-details">
                    <h3>{slot.topic}</h3>
                    <p className="teacher"><User size={14} /> {slot.teacher}</p>
                    <p className="duration"><Clock size={14} /> {slot.duration}</p>
                  </div>
                  <div className="slot-time">
                    <div className="day">{slot.day}</div>
                    <div className="time">{slot.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Enrolled Courses */}
          <section className="dashboard-section enrolled-courses-section">
            <div className="section-header">
              <h2>Enrolled Courses</h2>
              <a href="#" className="view-all" onClick={() => setActiveSection("courses")}>
                View All <ChevronRight size={16} />
              </a>
            </div>
            <div className="enrolled-courses-grid">
              {(dashboardData.enrolledCourses || []).map((course) => (
                <div className="course-card" key={course.id}>
                  <div className="course-content">
                    <h3>{course.title}</h3>
                    <p className="teacher"><User size={14} /> {course.teacher}</p>
                    <div className="course-progress">
                      <div className="progress-text">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${course.progress}%` }}></div>
                      </div>
                      <div className="lessons-count">
                        <BookOpen size={14} /> {course.completed}/{course.lessons} lessons
                      </div>
                    </div>
                    <button className="continue-btn">Continue Learning</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
