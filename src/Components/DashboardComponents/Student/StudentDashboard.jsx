"use client";
import { useParams } from "react-router-dom";
import Sidebar from "../Sidebar";
import { useState, useEffect } from "react";
import { Bell, Book, Calendar, ChevronRight, Clock, FileText, Home, LogOut, Menu, MessageSquare, Settings, User, X, Award, BookOpen, BarChart2 } from 'lucide-react';
import "../dashboard.css";
import { DateTime } from 'luxon';

const StudentDashboard = () => {
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
          fetch(`http://localhost:5000/GetStudentProfile?username=${username}`),
          fetch(`http://localhost:5000/GetStudentDashboard?username=${username}`),
          fetch(`http://localhost:5000/GetSchedule?username=${username}&role=student`),
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
              <h2>Upcoming Session</h2>
              <a href="#" className="view-all" onClick={() => setActiveSection("schedule")}>View All <ChevronRight size={16} /></a>
            </div>
            <div className="slots-list-wrapper">
              {!nextSlot ? (
                <div className="slots-empty">No upcoming sessions.</div>
              ) : (
                <div className="slot-card" key={nextSlot.slotId}>
                  {nextSlot.teacher && ( <div className="slot-teacher">Teacher: {nextSlot.teacher.teacherName || nextSlot.teacher.name || nextSlot.teacher.username}</div> )}
                  {nextSlot.course && nextSlot.course.courseName && ( <div className="slot-course">Course: {nextSlot.course.courseName}</div> )}
                  <div className="slot-details">
                    {nextSlot.day && <span className="slot-day">{nextSlot.day}</span>}
                    {nextSlot.time && <span className="slot-time">{nextSlot.time}</span>}
                  </div>
                </div>
              )}
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
