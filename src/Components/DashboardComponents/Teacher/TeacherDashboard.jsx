"use client";
import { useParams } from "react-router-dom";
import Sidebar from "../Sidebar";
import { useState, useEffect } from "react";
import { Bell, Book, Calendar, ChevronRight, Clock, FileText, Home, LogOut, Menu, MessageSquare, Settings, User, X, Award, BookOpen, BarChart2, Users, DollarSign, TrendingUp, Star, UserCheck } from 'lucide-react';
import "../dashboard.css";
import { DateTime } from 'luxon';

const TeacherDashboard = () => {
  const { username } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextSlot, setNextSlot] = useState(null);

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
        const [profileRes, dashboardRes, slotsRes] = await Promise.all([
          fetch(`http://localhost:5000/GetTeacherProfile?username=${username}`),
          fetch(`http://localhost:5000/GetTeacherDashboard?username=${username}`),
          fetch(`http://localhost:5000/GetSchedule?username=${username}&role=teacher`),
        ]);
        
        if (!profileRes.ok || !dashboardRes.ok || !slotsRes.ok) {
          throw new Error("Failed to fetch data");
        }
        
        const profileData = await profileRes.json();
        const dashData = await dashboardRes.json();
        const slotsData = await slotsRes.json();
        setUserData(profileData);
        setDashboardData(dashData);
        // Compute next upcoming slot
        let slots = Array.isArray(slotsData.schedule) ? slotsData.schedule : [];
        // Only consider booked slots
        slots = slots.filter(slot => slot.isBooked === true || slot.isBooked === 'true');
        // Compute next occurrence for each slot
        const now = DateTime.now();
        const getNextOccurrence = (slot) => {
          if (!slot.day || !slot.time) return null;
          const [start] = slot.time.split('-').map(s => s.trim());
          const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const slotDayIdx = daysOfWeek.indexOf(slot.day);
          if (slotDayIdx === -1) return null;
          let next = now.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
          next = next.plus({ days: (slotDayIdx - now.weekday % 7 + 7) % 7 });
          const [h, m] = start.split(':');
          next = next.set({ hour: parseInt(h, 10), minute: parseInt(m, 10) });
          if (next < now) next = next.plus({ days: 7 });
          return next;
        };
        const slotsWithNext = slots.map(slot => ({ ...slot, nextOccurrence: getNextOccurrence(slot) })).filter(slot => slot.nextOccurrence);
        slotsWithNext.sort((a, b) => a.nextOccurrence - b.nextOccurrence);
        setNextSlot(slotsWithNext.length > 0 ? slotsWithNext[0] : null);
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
              <h2>Next Session</h2>
              <a href="#" className="view-all" onClick={() => setActiveSection("schedule")}>View All <ChevronRight size={16} /></a>
            </div>
            <div className="slots-list-wrapper">
              {!nextSlot ? (
                <div className="slots-empty">No upcoming sessions.</div>
              ) : (
                <div className="slot-card" key={nextSlot.slotId}>
                  {nextSlot.student && ( <div className="slot-student">Student: {nextSlot.student.studentName || nextSlot.student.name || nextSlot.student.username}</div> )}
                  {nextSlot.course && nextSlot.course.courseName && ( <div className="slot-course">Course: {nextSlot.course.courseName}</div> )}
                  <div className="slot-details">
                    {nextSlot.day && <span className="slot-day">{nextSlot.day}</span>}
                    {nextSlot.time && <span className="slot-time">{nextSlot.time}</span>}
                  </div>
                </div>
              )}
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
                <div
                  className="student-card"
                  key={student.id}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(44,62,80,0.08)',
                    margin: '18px 0',
                    padding: '18px 20px',
                    background: '#fff',
                    display : 'flex',
                    alignItems: 'center',
                    gap: '24px',
                    minWidth: '220px',
                    maxWidth: '100%',
                  }}
                >
                  <div className="student-avatar">
                    <img src={student.avatar || "/placeholder.svg"} alt={student.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '2px solid #cbe7cb' }} />
                  </div>
                  <div className="student-info" style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontWeight: 700, color: '#2d4a2d' }}>{student.name}</h4>
                    <p className="student-course" style={{ margin: '4px 0 10px 0', color: '#4a5c2c', fontWeight: 500 }}>{student.currentCourse}</p>
                    <div className="student-rating" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Star size={14} fill="currentColor" style={{ color: '#ffa500' }} />
                      <span style={{ fontWeight: 600 }}>{student.rating || 'N/A'}</span>
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
