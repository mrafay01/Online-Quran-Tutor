"use client";

import Sidebar from "./Sidebar";
import AvatarImg from "../Assets/Images/boy-avatar.png";
import { useState } from "react";
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
import "./dashboard.css";

// Mock data for schedule
const mockSchedule = [
  {
    id: 1,
    title: "Tajweed Rules Session",
    teacher: "Sheikh Abdullah",
    date: "2024-06-03",
    time: "16:30",
    duration: 45,
    type: "Live Session",
    status: "upcoming",
    meetingLink: "https://meet.example.com/abc123",
  },
  {
    id: 2,
    title: "Surah Al-Baqarah Recitation",
    teacher: "Sheikh Mahmoud",
    date: "2024-06-04",
    time: "17:00",
    duration: 60,
    type: "Live Session",
    status: "upcoming",
    meetingLink: "https://meet.example.com/def456",
  },
  {
    id: 3,
    title: "Memorization Practice",
    teacher: "Sheikh Yusuf",
    date: "2024-06-05",
    time: "18:00",
    duration: 45,
    type: "Practice Session",
    status: "upcoming",
    meetingLink: "https://meet.example.com/ghi789",
  },
  {
    id: 4,
    title: "Arabic Grammar Review",
    teacher: "Sheikh Omar",
    date: "2024-06-01",
    time: "15:00",
    duration: 60,
    type: "Live Session",
    status: "completed",
    meetingLink: null,
  },
];

const SchedulePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("schedule");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("week"); // week, month

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const mockUser = {
    name: "Ahmad Hassan",
    role: "Student",
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
    return mockSchedule.filter((session) => session.date === dateStr);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userInfo={mockUser}
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
                {mockSchedule.filter((s) => s.status === "upcoming").length}
              </div>
              <div className="stat-label">Upcoming Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {mockSchedule.filter((s) => s.status === "completed").length}
              </div>
              <div className="stat-label">Completed This Week</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {mockSchedule.reduce(
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
                      <div className="session-teacher">{session.teacher}</div>
                      <div className="session-duration">
                        {session.duration} min
                      </div>
                      <div className="session-actions">
                        {session.status === "upcoming" &&
                          session.meetingLink && (
                            <button className="join-btn">
                              <Video size={14} />
                              Join
                            </button>
                          )}
                        <button className="edit-btn">
                          <Edit size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Sessions List */}
          <div className="upcoming-sessions">
            <h3>Upcoming Sessions</h3>
            <div className="sessions-list">
              {mockSchedule
                .filter((session) => session.status === "upcoming")
                .map((session) => (
                  <div key={session.id} className="session-item">
                    <div className="session-info">
                      <h4>{session.title}</h4>
                      <p className="session-details">
                        <User size={14} /> {session.teacher} •
                        <Calendar size={14} />{" "}
                        {new Date(session.date).toLocaleDateString()} •
                        <Clock size={14} /> {session.time} ({session.duration}{" "}
                        min)
                      </p>
                      <span
                        className={`session-type ${session.type
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {session.type}
                      </span>
                    </div>
                    <div className="session-actions">
                      {session.meetingLink && (
                        <button className="join-btn">
                          <Video size={16} />
                          Join Session
                        </button>
                      )}
                      <button className="reschedule-btn">
                        <Edit size={16} />
                        Reschedule
                      </button>
                      <button className="cancel-btn">
                        <Trash2 size={16} />
                        Cancel
                      </button>
                    </div>
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
