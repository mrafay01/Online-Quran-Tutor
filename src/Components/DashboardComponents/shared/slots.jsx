import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import '../dashboard.css';
import './Slots.css';
import { DateTime } from 'luxon';

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
  const [userRegion, setUserRegion] = useState('');

  // Sidebar state (copied from schedule.jsx for consistency)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('slots');
  const [userInfo, setUserInfo] = useState(username || null);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const handleSectionChange = (section) => setActiveSection(section);

  // Fetch user region (timezone)
  useEffect(() => {
    if (!username || !role) return;
    fetch(`http://localhost:5000/api/get_user_region?username=${encodeURIComponent(username)}&role=${encodeURIComponent(role)}`)
      .then(res => res.ok ? res.json() : { region: Intl.DateTimeFormat().resolvedOptions().timeZone })
      .then(data => {
        setUserRegion(data.region || Intl.DateTimeFormat().resolvedOptions().timeZone);
      })
      .catch(() => {
        setUserRegion(Intl.DateTimeFormat().resolvedOptions().timeZone);
      });
  }, [username, role]);

  useEffect(() => {
    if (!username || !role) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/GetSchedule?username=${encodeURIComponent(username)}&role=${encodeURIComponent(role)}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch schedule");
        return res.json();
      })
      .then(async data => {
        let slots = [];
        if (role === 'parent' && Array.isArray(data.childrenSchedules)) {
          // Flatten all slots from all children, and add childName to each slot
          data.childrenSchedules.forEach(child => {
            if (Array.isArray(child.slots)) {
              child.slots.forEach(slot => {
                slots.push({ ...slot, childName: child.childName });
              });
            }
          });
        } else {
          slots = Array.isArray(data.schedule) ? data.schedule : [];
        }
        // For students and parents, ensure each slot has a teacher object with username
        if (role === 'student' || role === 'parent') {
          slots = slots.map(slot => ({
            ...slot,
            teacher: {
              ...(slot.teacher || {}),
              username: slot.teacherUsername || (slot.teacher && slot.teacher.username),
              // region will be filled in below
            },
          }));
          // Find all unique teacher usernames
          const teacherUsernames = Array.from(new Set(slots.map(slot => slot.teacher && slot.teacher.username).filter(Boolean)));
          // Fetch all teacher regions in parallel
          const teacherRegions = {};
          await Promise.all(teacherUsernames.map(async (teacherUsername) => {
            try {
              const res = await fetch(`http://localhost:5000/api/get_user_region?username=${encodeURIComponent(teacherUsername)}&role=teacher`);
              if (res.ok) {
                const data = await res.json();
                teacherRegions[teacherUsername] = data.region || "UTC";
              } else {
                teacherRegions[teacherUsername] = "UTC";
              }
            } catch {
              teacherRegions[teacherUsername] = "UTC";
            }
          }));
          // Update slots with correct teacher region
          slots = slots.map(slot => {
            if (slot.teacher && slot.teacher.username) {
              slot.teacher.region = teacherRegions[slot.teacher.username] || "UTC";
            }
            return slot;
          });
        }
        setSchedule(slots);
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

  // Helper to convert a time range string (e.g., "09:00 - 10:00") from teacher's region to user's region
  function convertTimeRangeFromTeacherToUser(timeRange, teacherZone, userZone, teacherUsername) {
    if (!timeRange || !teacherZone || !userZone) return "";
    const [start, end] = timeRange.split(" - ");
    try {
      const today = DateTime.now().setZone(teacherZone);
      const startDT = DateTime.fromFormat(start, "HH:mm", { zone: teacherZone }).set({
        year: today.year, month: today.month, day: today.day
      });
      const endDT = DateTime.fromFormat(end, "HH:mm", { zone: teacherZone }).set({
        year: today.year, month: today.month, day: today.day
      });
      // Debug logs
      console.log('--- Timezone Conversion Debug ---');
      console.log('Teacher username:', teacherUsername);
      console.log('Teacher region:', teacherZone);
      console.log('User region:', userZone);
      console.log('Original time:', timeRange);
      console.log('Parsed teacher start:', startDT.toISO(), '(valid:', startDT.isValid, ')');
      console.log('Parsed teacher end:', endDT.toISO(), '(valid:', endDT.isValid, ')');
      const userStart = startDT.setZone(userZone);
      const userEnd = endDT.setZone(userZone);
      console.log('Converted user start:', userStart.toISO(), '(', userStart.toFormat('HH:mm'), ')');
      console.log('Converted user end:', userEnd.toISO(), '(', userEnd.toFormat('HH:mm'), ')');
      const result = `${userStart.toFormat("HH:mm")} - ${userEnd.toFormat("HH:mm")}`;
      console.log('Final localTime:', result);
      return result;
    } catch (e) {
      console.log('Timezone conversion error:', e);
      return timeRange;
    }
  }

  // Add converted time to each slot
  allSlots = allSlots.map(slot => {
    if (slot.time && /^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/.test(slot.time) && slot.teacher && slot.teacher.region) {
      slot.localTime = convertTimeRangeFromTeacherToUser(slot.time, slot.teacher.region, userRegion, slot.teacher.username);
    } else {
      slot.localTime = slot.time;
    }
    return slot;
  });

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
                  {/* Show child name for parent role */}
                  {role === "parent" && slot.childName && (
                    <div className="slot-child">Child: {slot.childName}</div>
                  )}
                  {/* Show teacher and/or student names based on role */}
                  {role === "parent" && slot.teacher && (slot.teacher.teacherName || slot.teacher.name || slot.teacher.username) && (
                    <div className="slot-teacher">Teacher: {slot.teacher.teacherName || slot.teacher.name || slot.teacher.username}</div>
                  )}
                  {role === "student" && slot.teacher && (slot.teacher.teacherName || slot.teacher.name || slot.teacher.username) && (
                    <div className="slot-teacher">Teacher: {slot.teacher.teacherName || slot.teacher.name || slot.teacher.username}</div>
                  )}
                  {role === "teacher" && slot.student && (slot.student.name || slot.student.username) && (
                    <div className="slot-student">Student: {slot.student.name || slot.student.username}</div>
                  )}
                  {slot.course && slot.course.courseName && (
                    <div className="slot-course">Course: {slot.course.courseName}</div>
                  )}
                  <div className="slot-details">
                    <span className="slot-day">{slot.day}</span>
                    <span className="slot-time">{slot.localTime}</span>
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
