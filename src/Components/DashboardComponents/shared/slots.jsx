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

  // For teachers, group slots by unique day+time+course combination to avoid duplicates
  if (role === 'teacher') {
    const groupedSlots = {};
    allSlots.forEach(slot => {
      const key = `${slot.day}-${slot.time}-${slot.course?.courseId || 'no-course'}`;
      if (!groupedSlots[key]) {
        groupedSlots[key] = {
          ...slot,
          students: []
        };
      }
      // Add student to the students array if it exists
      if (slot.student) {
        const existingStudent = groupedSlots[key].students.find(s => s.username === slot.student.username);
        if (!existingStudent) {
          groupedSlots[key].students.push(slot.student);
        }
      }
    });
    allSlots = Object.values(groupedSlots);
    console.log('Grouped slots for teacher:', allSlots);
  }

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

  // Helper to manually convert day based on timezone differences
  function convertDayBasedOnTimezone(originalDay, originalTime, convertedTime, teacherZone, userZone) {
    if (!originalDay || !originalTime || !convertedTime || !teacherZone || !userZone) {
      return originalDay;
    }

    try {
      // Get timezone offsets
      const teacherOffset = DateTime.now().setZone(teacherZone).offset;
      const userOffset = DateTime.now().setZone(userZone).offset;
      const gmtDifference = userOffset - teacherOffset; // Positive if user is ahead

      // Parse original and converted times
      const [originalStart] = originalTime.split(" - ");
      const [convertedStart] = convertedTime.split(" - ");
      
      const originalHour = parseInt(originalStart.split(":")[0], 10);
      const convertedHour = parseInt(convertedStart.split(":")[0], 10);

      console.log('--- Day Conversion Debug ---');
      console.log('Original day:', originalDay);
      console.log('Original time:', originalTime, '(hour:', originalHour, ')');
      console.log('Converted time:', convertedTime, '(hour:', convertedHour, ')');
      console.log('Teacher offset:', teacherOffset);
      console.log('User offset:', userOffset);
      console.log('GMT difference:', gmtDifference);

      // Day conversion logic
      let convertedDay = originalDay;
      
      if (gmtDifference > 0) { // User is ahead of teacher
        if (convertedHour < originalHour) {
          // Converted hours are less than original hours, should be next day
          convertedDay = getNextDay(originalDay);
          console.log('Moving to next day:', convertedDay);
        } else if (convertedHour > originalHour) {
          // Converted hours are higher than original hours, should be previous day
          convertedDay = getPreviousDay(originalDay);
          console.log('Moving to previous day:', convertedDay);
        }
      } else if (gmtDifference < 0) { // User is behind teacher
        if (convertedHour < originalHour) {
          // Converted hours are less than original hours, should be previous day
          convertedDay = getPreviousDay(originalDay);
          console.log('Moving to previous day:', convertedDay);
        } else if (convertedHour > originalHour) {
          // Converted hours are higher than original hours, should be next day
          convertedDay = getNextDay(originalDay);
          console.log('Moving to next day:', convertedDay);
        }
      }

      console.log('Final converted day:', convertedDay);
      return convertedDay;
    } catch (e) {
      console.log('Day conversion error:', e);
      return originalDay;
    }
  }

  // Helper to get next day
  function getNextDay(currentDay) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const currentIndex = days.indexOf(currentDay);
    const nextIndex = (currentIndex + 1) % 7;
    return days[nextIndex];
  }

  // Helper to get previous day
  function getPreviousDay(currentDay) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const currentIndex = days.indexOf(currentDay);
    const previousIndex = (currentIndex - 1 + 7) % 7;
    return days[previousIndex];
  }

  // Add converted time and day to each slot
  allSlots = allSlots.map(slot => {
    if (slot.time && /^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/.test(slot.time) && slot.teacher && slot.teacher.region) {
      slot.localTime = convertTimeRangeFromTeacherToUser(slot.time, slot.teacher.region, userRegion, slot.teacher.username);
      // Apply manual day conversion based on timezone differences
      slot.localDay = convertDayBasedOnTimezone(slot.day, slot.time, slot.localTime, slot.teacher.region, userRegion);
    } else {
      slot.localTime = slot.time;
      slot.localDay = slot.day;
    }
    return slot;
  });

  // Sort by next upcoming date (day + time)
  allSlots.sort((a, b) => {
    // Get next date for each slot's converted day
    const nextA = getNextDateOfWeek(a.localDay || a.day);
    const nextB = getNextDateOfWeek(b.localDay || b.day);
    // Add time to the date
    if (a.localTime && b.localTime) {
      const [aHour, aMin] = a.localTime.split('-')[0].trim().split(':');
      const [bHour, bMin] = b.localTime.split('-')[0].trim().split(':');
      nextA.setHours(parseInt(aHour, 10), parseInt(aMin, 10) || 0, 0, 0);
      nextB.setHours(parseInt(bHour, 10), parseInt(bMin, 10) || 0, 0, 0);
    }
    return nextA - nextB;
  });

  // Build a robust slot lookup: { [studentDay]: { [studentTime]: slotObj } }
  const fullToShortDay = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };
  const shortToFullDay = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday"
  };
  // Determine teacherZone for each slot (for student/parent), or userRegion for teacher
  function getSlotZone(slot) {
    if (role === 'teacher') return userRegion || 'UTC';
    if (slot.teacher && slot.teacher.region) return slot.teacher.region;
    return 'UTC';
  }
  // Build lookup
  const slotLookup = {};
  allSlots.forEach(slot => {
    if (!slot.time || !slot.day) return;
    const teacherZone = getSlotZone(slot);
    const teacherDayFull = slot.day;
    const teacherDayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(teacherDayFull);
    if (teacherDayIndex === -1) return;
    const refMonday = DateTime.utc(2023, 1, 2); // 2023-01-02 is a Monday
    const teacherDate = refMonday.plus({ days: teacherDayIndex });
    const [start] = slot.time.split(" - ");
    const [h, m] = start.split(":").map(Number);
    const teacherDT = teacherDate.set({ hour: h, minute: m, second: 0, millisecond: 0 }).setZone(teacherZone, { keepLocalTime: true });
    const studentDT = teacherDT.setZone(userRegion);
    const studentDayFull = studentDT.setLocale('en').toFormat('cccc');
    const studentDay = studentDayFull;
    const studentTime = `${studentDT.toFormat("HH:mm")} - ${studentDT.plus({ minutes: 60 }).toFormat("HH:mm")}`;
    if (!slotLookup[studentDay]) slotLookup[studentDay] = {};
    slotLookup[studentDay][studentTime] = slot;
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
              const nextDate = getNextDateOfWeek(slot.localDay || slot.day);
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
                  {role === "teacher" && slot.students && slot.students.length > 0 && (
                    <div className="slot-students">
                      Students: {slot.students.map((student, idx) => (
                        <span key={student.username}>
                          {student.name || student.username}
                          {idx < slot.students.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  {role === "teacher" && (!slot.students || slot.students.length === 0) && slot.student && (slot.student.name || slot.student.username) && (
                    <div className="slot-student">Student: {slot.student.name || slot.student.username}</div>
                  )}
                  {slot.course && slot.course.courseName && (
                    <div className="slot-course">Course: {slot.course.courseName}</div>
                  )}
                  <div className="slot-details">
                    <span className="slot-day">{slot.localDay || slot.day}</span>
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
