"use client";
import { useParams } from "react-router-dom";
import Sidebar from "../Sidebar";
import { useState, useEffect } from "react";
import { Bell, Book, Calendar, ChevronRight, Clock, FileText, Home, LogOut, Menu, MessageSquare, Settings, User, X, Award, BookOpen, BarChart2, Users, DollarSign, TrendingUp, Star, UserCheck } from 'lucide-react';
import "../dashboard.css";

const TeacherDashboard = () => {
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
          fetch(`http://localhost:5000/GetTeacherProfile?username=${username}`),
          fetch(`http://localhost:5000/GetTeacherDashboard?username=${username}`),
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
            <h1>Teacher Dashboard</h1>
            <p className="current-date">{formatDate()}</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Teaching Overview */}
          <section className="dashboard-section teaching-overview-section">
            <div className="section-header">
              <h2>Teaching Overview</h2>
            </div>
            <div className="teaching-stats">
              <div className="stat-card">
                <div className="stat-icon"><Users size={24} /></div>
                <div className="stat-info">
                  <h4>{dashboardData.totalStudents || 0}</h4>
                  <p>Total Students</p>
                </div>
                <div className="stat-trend">
                  <TrendingUp size={16} />
                  +{dashboardData.newStudentsThisMonth || 0} this month
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Book size={24} /></div>
                <div className="stat-info">
                  <h4>{dashboardData.activeCourses || 0}</h4>
                  <p>Active Courses</p>
                </div>
                <div className="stat-trend">
                  <TrendingUp size={16} />
                  {dashboardData.courseCompletionRate || 0}% completion rate
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Clock size={24} /></div>
                <div className="stat-info">
                  <h4>{dashboardData.hoursThisMonth || 0}</h4>
                  <p>Hours This Month</p>
                </div>
                <div className="stat-trend">
                  <TrendingUp size={16} />
                  +{dashboardData.hoursIncrease || 0}% vs last month
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><DollarSign size={24} /></div>
                <div className="stat-info">
                  <h4>${dashboardData.monthlyEarnings || 0}</h4>
                  <p>Monthly Earnings</p>
                </div>
                <div className="stat-trend">
                  <TrendingUp size={16} />
                  +{dashboardData.earningsIncrease || 0}% vs last month
                </div>
              </div>
            </div>
          </section>

          {/* Today's Schedule */}
          <section className="dashboard-section todays-schedule-section">
            <div className="section-header">
              <h2>Today's Schedule</h2>
              <a href="#" className="view-all" onClick={() => setActiveSection("schedule")}>
                View All <ChevronRight size={16} />
              </a>
            </div>
            <div className="schedule-list">
              {(dashboardData.todaysSchedule || []).map((session) => (
                <div className="schedule-item" key={session.id}>
                  <div className="schedule-time">
                    <div className="time">{session.time}</div>
                    <div className="duration">{session.duration} min</div>
                  </div>
                  <div className="schedule-details">
                    <h4>{session.topic}</h4>
                    <p className="student"><User size={14} /> {session.studentName}</p>
                    <p className="course"><Book size={14} /> {session.course}</p>
                  </div>
                  <div className="schedule-actions">
                    <button className="join-btn">Start Session</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Students */}
          <section className="dashboard-section recent-students-section">
            <div className="section-header">
              <h2>Recent Students</h2>
              <a href="#" className="view-all" onClick={() => setActiveSection("my-students")}>
                View All <ChevronRight size={16} />
              </a>
            </div>
            <div className="students-grid">
              {(dashboardData.recentStudents || []).map((student) => (
                <div className="student-card" key={student.id}>
                  <div className="student-avatar">
                    <img src={student.avatar || "/placeholder.svg"} alt={student.name} />
                  </div>
                  <div className="student-info">
                    <h4>{student.name}</h4>
                    <p className="student-course">{student.currentCourse}</p>
                    <div className="student-progress">
                      <span>Progress: {student.progress}%</span>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${student.progress}%` }}></div>
                      </div>
                    </div>
                    <div className="student-rating">
                      <Star size={14} fill="currentColor" />
                      <span>{student.rating || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Performance Metrics */}
          <section className="dashboard-section performance-section">
            <div className="section-header">
              <h2>Performance Metrics</h2>
            </div>
            <div className="performance-grid">
              <div className="metric-card">
                <div className="metric-header">
                  <h4>Student Satisfaction</h4>
                  <div className="metric-value">{dashboardData.averageRating || 0}/5</div>
                </div>
                <div className="metric-details">
                  <Star size={16} fill="currentColor" />
                  <span>Based on {dashboardData.totalReviews || 0} reviews</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-header">
                  <h4>Session Completion</h4>
                  <div className="metric-value">{dashboardData.sessionCompletionRate || 0}%</div>
                </div>
                <div className="metric-details">
                  <UserCheck size={16} />
                  <span>{dashboardData.completedSessions || 0} of {dashboardData.totalSessions || 0} sessions</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
