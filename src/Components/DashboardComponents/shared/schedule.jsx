"use client";

import Sidebar from "../Sidebar";
import AvatarImg from '../../Assets/Images/boy-avatar.png';
import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import {
  Book,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
  X,
  BarChart2,
  Plus,
  Edit,
  Trash2,
  Video,
} from "lucide-react";
import '../dashboard.css';

const SchedulePage = () => {
  const { username, role } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("schedule");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // week, month
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username || !role) return;
    setLoading(true);
    fetch(`http://localhost:5000/Get${role.charAt(0).toUpperCase() + role.slice(1)}Schedule?username=${username}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setScheduleData(data);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch schedule data");
        setLoading(false);
      });
  }, [username, role]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Create userInfo object from URL params and fetched data
  const userInfo = {
    name: scheduleData[0]?.userName || username,
    role: role,
    avatar: AvatarImg,
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Here you can add navigation logic or routing
    console.log(`Navigating to: ${section}`);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getSessionsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return scheduleData.filter((session) => session.date === dateStr);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  if (loading) return <div className="loading">Loading schedule data...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!scheduleData.length) return <div className="no-data">No schedule data found.</div>;

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userInfo={userInfo}
        unreadNotifications={5}
      />

      {/* Main Content */}
      <div className="main-content">
        <div className="top-bar">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="page-title">
            <h1>Schedule</h1>
            <p className="page-subtitle">Manage your learning sessions</p>
          </div>
        </div>

        <div className="schedule-content">
          {/* Schedule Header */}
          <div className="schedule-header">
            <div className="schedule-navigation">
              <button className="nav-btn" onClick={() => navigateWeek(-1)}>
                <ChevronLeft size={20} />
              </button>
              <h2>{formatDate(currentDate)}</h2>
              <button className="nav-btn" onClick={() => navigateWeek(1)}>
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="schedule-actions">
              <button className="schedule-btn">
                <Plus size={16} />
                Book Session
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="schedule-stats">
            <div className="stat-card">
              <div className="stat-number">
                {scheduleData.filter((s) => s.status === "upcoming").length}
              </div>
              <div className="stat-label">Upcoming Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {scheduleData.filter((s) => s.status === "completed").length}
              </div>
              <div className="stat-label">Completed This Week</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {scheduleData.reduce(
                  (acc, session) => acc + session.duration,
                  0
                )}
              </div>
              <div className="stat-label">Total Minutes</div>
            </div>
          </div>

          {/* Weekly Calendar */}
          <div className="weekly-calendar">
            <div className="calendar-header">
              {getWeekDays().map((day, index) => (
                <div key={index} className="day-header">
                  <div className="day-name">
                    {day.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="day-number">{day.getDate()}</div>
                </div>
              ))}
            </div>
            <div className="calendar-body">
              {getWeekDays().map((day, index) => (
                <div key={index} className="day-column">
                  {getSessionsForDate(day).map((session) => (
                    <div
                      key={session.id}
                      className={`session-card ${session.status}`}
                    >
                      <div className="session-time">{session.time}</div>
                      <div className="session-title">{session.title}</div>
                      <div className="session-teacher">👨‍🏫 {session.teacher}</div>
                      <div className="session-duration">{session.duration} min</div>
                      {session.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="join-btn"
                        >
                          Join Session
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
