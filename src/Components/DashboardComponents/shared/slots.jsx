import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import '../dashboard.css';
import './Slots.css';

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Helper to get the next date for a given day of week (e.g., next Monday)
function getNextDateOfWeek(dayName) {
  const today = new Date();
  const todayDay = today.getDay();
  const targetDay = daysOfWeek.indexOf(dayName.charAt(0).toUpperCase() + dayName.slice(1).toLowerCase());
  let diff = targetDay - todayDay;
  if (diff < 0) diff += 7;
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + diff);
  return nextDate;
}

const Slots = () => {
  const { role, username } = useParams();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebar state (copied from schedule.jsx for consistency)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('slots');
  const [userInfo, setUserInfo] = useState(username || null);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const handleSectionChange = (section) => setActiveSection(section);

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
        setSchedule(Array.isArray(data.schedule) ? data.schedule : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [username, role]);

  if (loading) return <div>Loading slots...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!schedule.length) return <div>No slots found.</div>;

  let allSlots = [];
  if (role.toLowerCase() === "student") {
    // For students, flatten all slots from all courses
    schedule.forEach(course => {
      (course.slots || []).forEach(slot => {
        allSlots.push({
          ...slot,
          courseName: course.courseName,
          teacherName: course.teacherName,
          teacherUsername: course.teacherUsername
        });
      });
    });
  } else {
    // For teacher/parent, treat schedule as a flat array of slots
    allSlots = schedule.map(slot => ({
      ...slot,
      courseName: slot.courseName || '',
      teacherName: slot.teacherName || '',
      teacherUsername: slot.teacherUsername || ''
    }));
  }

  // Sort by day of week, then by time
  allSlots.sort((a, b) => {
    const dayA = daysOfWeek.indexOf(a.day.charAt(0).toUpperCase() + a.day.slice(1).toLowerCase());
    const dayB = daysOfWeek.indexOf(b.day.charAt(0).toUpperCase() + b.day.slice(1).toLowerCase());
    if (dayA !== dayB) return dayA - dayB;
    const timeA = a.time.split("-")[0].trim();
    const timeB = b.time.split("-")[0].trim();
    return timeA.localeCompare(timeB);
  });

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
      <div className="main-content">
        <h2 className="slots-title">All Scheduled Slots</h2>
        <div className="slots-list-wrapper">
          {allSlots.length === 0 ? (
            <div className="slots-empty">No slots scheduled.</div>
          ) : (
            allSlots.map((slot, idx) => {
              const nextDate = getNextDateOfWeek(slot.day);
              const dateStr = nextDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
              return (
                <div key={slot.slotId + '-' + idx} className="slot-card">
                  {slot.courseName && <div className="slot-course">{slot.courseName}</div>}
                  {slot.teacherName && <div className="slot-teacher">Teacher: {slot.teacherName}</div>}
                  <div className="slot-details">
                    <span className="slot-day">{slot.day}</span>
                    <span className="slot-time">{slot.time}</span>
                    <span className="slot-next">Next: {dateStr}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Slots;
