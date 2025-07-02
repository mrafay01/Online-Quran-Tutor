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
        console.log('Fetched schedule data:', data.schedule);
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

  // If schedule is a flat array of slots, use it directly
  let allSlots = schedule;

  // Debug: log isBooked type and value for each slot
  allSlots.forEach(slot => {
    console.log('Slot isBooked:', slot.isBooked, typeof slot.isBooked, slot);
  });

  // Only show slots where isBooked is true (boolean or string)
  allSlots = allSlots.filter(slot => slot.isBooked === true || slot.isBooked === 'true');
  console.log('Filtered booked slots:', allSlots);

  // Sort by next upcoming date (day + time)
  allSlots.sort((a, b) => {
    // Get next date for each slot's day
    const nextA = getNextDateOfWeek(a.day);
    const nextB = getNextDateOfWeek(b.day);
    // Add time to the date
    if (a.time && b.time) {
      const [aHour, aMin] = a.time.split('-')[0].trim().split(':');
      const [bHour, bMin] = b.time.split('-')[0].trim().split(':');
      nextA.setHours(parseInt(aHour, 10), parseInt(aMin, 10) || 0, 0, 0);
      nextB.setHours(parseInt(bHour, 10), parseInt(bMin, 10) || 0, 0, 0);
    }
    return nextA - nextB;
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
                  {(role === "student" || role === "parent") && slot.teacher && slot.teacher.teacherName && (
                    <div className="slot-teacher">Teacher: {slot.teacher.teacherName}</div>
                  )}
                  {(role === "teacher" || role === "parent") && slot.student && slot.student.studentName && (
                    <div className="slot-student">Student: {slot.student.studentName}</div>
                  )}
                  {slot.course && slot.course.courseName && (
                    <div className="slot-course">Course: {slot.course.courseName}</div>
                  )}
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
