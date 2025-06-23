"use client";
import { useParams } from "react-router-dom";
import Sidebar from "../Sidebar";
import { useState, useEffect } from "react";
import { Bell, Book, Calendar, ChevronRight, Clock, FileText, Home, LogOut, Menu, MessageSquare, Settings, User, X, Award, BookOpen, BarChart2, Baby, DollarSign, TrendingUp, Star, UserCheck, Target, AlertCircle } from 'lucide-react';
import "../dashboard.css";

const ParentDashboard = () => {
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
          fetch(`http://localhost:5000/GetParentProfile?username=${username}`),
          fetch(`http://localhost:5000/GetParentDashboard?username=${username}`),
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
            <h1>Parent Dashboard</h1>
            <p className="current-date">{formatDate()}</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Children Overview */}
          <section className="dashboard-section children-overview-section">
            <div className="section-header">
              <h2>Children Overview</h2>
              <a href="#" className="view-all" onClick={() => setActiveSection("children")}>
                View All <ChevronRight size={16} />
              </a>
            </div>
            <div className="children-stats">
              <div className="stat-card">
                <div className="stat-icon"><Baby size={24} /></div>
                <div className="stat-info">
                  <h4>{dashboardData.totalChildren || 0}</h4>
                  <p>Total Children</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Book size={24} /></div>
                <div className="stat-info">
                  <h4>{dashboardData.activeCourses || 0}</h4>
                  <p>Active Courses</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Clock size={24} /></div>
                <div className="stat-info">
                  <h4>{dashboardData.totalHoursThisMonth || 0}</h4>
                  <p>Hours This Month</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><DollarSign size={24} /></div>
                <div className="stat-info">
                  <h4>${dashboardData.monthlySpending || 0}</h4>
                  <p>Monthly Spending</p>
                </div>
              </div>
            </div>
          </section>

          {/* Children Progress */}
          <section className="dashboard-section children-progress-section">
            <div className="section-header">
              <h2>Children Progress</h2>
              <a href="#" className="view-all" onClick={() => setActiveSection("progress")}>
                View All <ChevronRight size={16} />
              </a>
            </div>
            <div className="children-grid">
              {(dashboardData.children || []).map((child) => (
                <div className="child-card" key={child.id}>
                  <div className="child-header">
                    <div className="child-avatar">
                      <img src={child.avatar || "/placeholder.svg"} alt={child.name} />
                    </div>
                    <div className="child-info">
                      <h4>{child.name}</h4>
                      <p className="child-age">Age: {child.age}</p>
                    </div>
                  </div>
                  <div className="child-progress">
                    <div className="progress-item">
                      <span>Overall Progress</span>
                      <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${child.overallProgress}%` }}></div>
                      </div>
                      <span className="progress-percentage">{child.overallProgress}%</span>
                    </div>
                    <div className="child-stats">
                      <div className="child-stat">
                        <BookOpen size={14} />
                        <span>{child.coursesEnrolled} Courses</span>
                      </div>
                      <div className="child-stat">
                        <Clock size={14} />
                        <span>{child.hoursThisWeek}h This Week</span>
                      </div>
                      <div className="child-stat">
                        <Award size={14} />
                        <span>{child.achievements} Achievements</span>
                      </div>
                    </div>
                  </div>
                  <div className="child-actions">
                    <button className="view-progress-btn">View Progress</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Upcoming Sessions */}
          <section className="dashboard-section upcoming-sessions-section">
            <div className="section-header">
              <h2>Upcoming Sessions</h2>
              <a href="#" className="view-all" onClick={() => setActiveSection("schedule")}>
                View All <ChevronRight size={16} />
              </a>
            </div>
            <div className="sessions-list">
              {(dashboardData.upcomingSessions || []).map((session) => (
                <div className="session-item" key={session.id}>
                  <div className="session-time">
                    <div className="day">{session.day}</div>
                    <div className="time">{session.time}</div>
                  </div>
                  <div className="session-details">
                    <h4>{session.topic}</h4>
                    <p className="session-child"><Baby size={14} /> {session.childName}</p>
                    <p className="session-teacher"><User size={14} /> {session.teacher}</p>
                    <p className="session-duration"><Clock size={14} /> {session.duration}</p>
                  </div>
                  <div className="session-status">
                    <span className={`status-badge ${session.status}`}>{session.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Activity & Alerts */}
          <section className="dashboard-section activity-alerts-section">
            <div className="section-header">
              <h2>Recent Activity & Alerts</h2>
            </div>
            <div className="activity-grid">
              <div className="activity-card">
                <h4>Recent Achievements</h4>
                <div className="activity-list">
                  {(dashboardData.recentAchievements || []).map((achievement) => (
                    <div className="activity-item" key={achievement.id}>
                      <div className="activity-icon">
                        <Award size={16} />
                      </div>
                      <div className="activity-details">
                        <p><strong>{achievement.childName}</strong> earned "{achievement.title}"</p>
                        <span className="activity-time">{achievement.timeAgo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="activity-card">
                <h4>Important Alerts</h4>
                <div className="activity-list">
                  {(dashboardData.alerts || []).map((alert) => (
                    <div className="activity-item alert" key={alert.id}>
                      <div className="activity-icon">
                        <AlertCircle size={16} />
                      </div>
                      <div className="activity-details">
                        <p>{alert.message}</p>
                        <span className="activity-time">{alert.timeAgo}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* <section className="dashboard-section payment-summary-section">
            <div className="section-header">
              <h2>Payment Summary</h2>
              <a href="#" className="view-all" onClick={() => setActiveSection("payments")}>
                View All <ChevronRight size={16} />
              </a>
            </div>
            <div className="payment-overview">
              <div className="payment-card">
                <h4>This Month</h4>
                <div className="payment-amount">${dashboardData.currentMonthPayment || 0}</div>
                <p className="payment-details">
                  {dashboardData.sessionsThisMonth || 0} sessions • {dashboardData.hoursThisMonth || 0} hours
                </p>
              </div>
              <div className="payment-card">
                <h4>Next Payment Due</h4>
                <div className="payment-amount">${dashboardData.nextPaymentAmount || 0}</div>
                <p className="payment-details">Due: {dashboardData.nextPaymentDate || 'N/A'}</p>
              </div>
            </div>
          </section> */}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
