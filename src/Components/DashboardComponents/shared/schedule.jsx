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
import './schedule.css';

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const shortToFullDay = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday"
};

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
    setError(null);
    fetch(`http://localhost:5000/GetSchedule?username=${encodeURIComponent(username)}&role=${encodeURIComponent(role)}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch schedule");
        return res.json();
      })
      .then(data => {
        setScheduleData(Array.isArray(data.schedule) ? data.schedule : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
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

  // For student: schedule is an array of courses, each with slots
  if (role.toLowerCase() === "student") {
    return (
      <div className="dashboard-container" style={{ minHeight: '100vh', background: '#f6f6e9' }}>
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          userInfo={userInfo}
          unreadNotifications={5}
        />
        <div className="main-content" style={{ padding: '32px 0', minHeight: '100vh' }}>
          {scheduleData.map((course) => {
            const slots = Array.isArray(course.slots) ? course.slots : [];
            const slotsByDay = days.reduce((acc, dayShort) => {
              const dayFull = shortToFullDay[dayShort];
              acc[dayShort] = slots.filter(slot => (slot.day && (slot.day === dayFull || slot.day.toLowerCase() === dayFull.toLowerCase())));
              return acc;
            }, {});
            const allTimes = Array.from(new Set(slots.map(slot => slot.time))).sort();
            return (
              <div key={course.courseId} style={{ marginBottom: 40, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: 24, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
                <h2 style={{ margin: '0 0 8px 0', fontWeight: 700, color: '#2d4a2d', fontSize: '1.3rem' }}>{course.courseName} <span style={{ fontWeight: 400, fontSize: '1rem', color: '#666' }}>({course.teacherName})</span></h2>
                {slots.length === 0 ? (
                  <div style={{ color: '#888', marginBottom: 16 }}>No slots scheduled for this course.</div>
                ) : (
                  <div className="schedule-table schedule-grid-table" style={{ borderCollapse: 'collapse', width: '100%', marginTop: 16 }}>
                    <div className="schedule-header" style={{ display: 'flex', background: '#f6f9f2', borderRadius: 12, overflow: 'hidden' }}>
                      <div className="schedule-cell schedule-time-header" style={{ flex: 1.2, fontWeight: 700, padding: '12px 0', textAlign: 'center', background: '#e6eede', borderRight: '1px solid #e0e0e0' }}>Time</div>
                      {days.map(day => (
                        <div key={day} className="schedule-cell schedule-day-header" style={{ flex: 1, fontWeight: 700, padding: '12px 0', textAlign: 'center', background: '#e6eede', borderRight: day !== 'Sun' ? '1px solid #e0e0e0' : 'none' }}>{day}</div>
                      ))}
                    </div>
                    {allTimes.map((time, idx) => (
                      <div className="schedule-row" key={time} style={{ display: 'flex', background: idx % 2 === 0 ? '#f9faf6' : '#fff', borderRadius: idx === allTimes.length - 1 ? '0 0 12px 12px' : 'none' }}>
                        <div className="schedule-cell schedule-time" style={{ flex: 1.2, padding: '12px 0', textAlign: 'center', fontWeight: 600, background: '#f6f9f2', borderRight: '1px solid #e0e0e0' }}>{time}</div>
                        {days.map(dayShort => {
                          const slotObj = (slotsByDay[dayShort] || []).find(slot => slot.time === time);
                          return (
                            <div className="schedule-cell" key={dayShort + time} style={{ flex: 1, padding: '12px 0', textAlign: 'center', borderRight: dayShort !== 'Sun' ? '1px solid #e0e0e0' : 'none' }}>
                              {slotObj ? (
                                <span style={{ color: '#4a5c2c', fontWeight: 600, background: '#e6f7e6', borderRadius: 8, padding: '2px 10px' }}>Scheduled</span>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // For teacher/parent/kid: fallback to previous logic (flat schedule array)
  // Group slots by day
  const slotsByDay = days.reduce((acc, dayShort) => {
    const dayFull = shortToFullDay[dayShort];
    acc[dayShort] = scheduleData.filter(slot => (slot.day && (slot.day === dayFull || slot.day.toLowerCase() === dayFull.toLowerCase())));
    return acc;
  }, {});
  // Only include time slots that are available for at least one day
  const allTimes = Array.from(new Set(scheduleData.map(slot => slot.time))).sort();

  // Build a lookup for quick access: { [day]: { [time]: slotObj } }
  const slotLookup = days.reduce((acc, dayShort) => {
    const dayFull = shortToFullDay[dayShort];
    acc[dayShort] = {};
    (slotsByDay[dayShort] || []).forEach(slot => {
      acc[dayShort][slot.time] = slot;
    });
    return acc;
  }, {});

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: '#f6f6e9' }}>
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userInfo={userInfo}
        unreadNotifications={5}
      />
      <div className="main-content" style={{ padding: '32px 0', minHeight: '100vh' }}>
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
          {/* Schedule Table for Teacher/Parent */}
          <div className="schedule-table-wrapper">
            <table className="schedule-table">
              <colgroup>
                <col/>
                {days.map((_, idx) => (
                  <col key={idx} /> 
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="schedule-th schedule-time-th">Time</th>
                  {days.map(dayShort => (
                    <th key={dayShort} className="schedule-th schedule-day-th">{dayShort}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allTimes.map((time, idx) => {
                  const hasAny = days.some(dayShort => slotLookup[dayShort][time]);
                  if (!hasAny) return null;
                  return (
                    <tr key={time} className={`schedule-row${idx % 2 === 0 ? ' even' : ' odd'}`}>
                      <td className="schedule-td schedule-time-td">{time}</td>
                      {days.map(dayShort => {
                        const slot = slotLookup[dayShort][time];
                        if (!slot) return <td key={dayShort} className="schedule-td schedule-unavailable"></td>;
                        if (slot.isBooked === true) {
                          return <td key={dayShort} className="schedule-td schedule-booked">Booked</td>;
                        }
                        return <td key={dayShort} className="schedule-td schedule-available"></td>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
