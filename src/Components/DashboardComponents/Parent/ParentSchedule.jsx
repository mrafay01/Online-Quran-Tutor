import React, { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import { useParams } from 'react-router-dom';
import '../dashboard.css';
import './schedule.css';
import { DateTime } from 'luxon';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ParentSchedule = () => {
  const { username } = useParams();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRegion, setUserRegion] = useState('');

  useEffect(() => {
    if (!username) return;
    // Fetch parent region
    fetch(`http://localhost:5000/api/get_user_region?username=${encodeURIComponent(username)}&role=parent`)
      .then(res => res.ok ? res.json() : { region: Intl.DateTimeFormat().resolvedOptions().timeZone })
      .then(data => {
        setUserRegion(data.region || Intl.DateTimeFormat().resolvedOptions().timeZone);
      })
      .catch(() => {
        setUserRegion(Intl.DateTimeFormat().resolvedOptions().timeZone);
      });
  }, [username]);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/GetSchedule?username=${encodeURIComponent(username)}&role=Parent`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch schedules");
        return res.json();
      })
      .then(async data => {
        // For each child, fetch teacher region for each slot
        const childrenArr = Array.isArray(data.childrenSchedules) ? data.childrenSchedules : [];
        // Gather all unique teacher usernames
        const teacherUsernames = Array.from(new Set(
          childrenArr.flatMap(child =>
            (Array.isArray(child.slots) ? child.slots : [])
              .map(slot => slot.teacherUsername || (slot.teacher && slot.teacher.username))
              .filter(Boolean)
          )
        ));
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
        // Attach teacher region to each slot
        const childrenWithRegions = childrenArr.map(child => ({
          ...child,
          slots: Array.isArray(child.slots) ? child.slots.map(slot => {
            const teacherUsername = slot.teacherUsername || (slot.teacher && slot.teacher.username);
            return {
              ...slot,
              teacherRegion: teacherRegions[teacherUsername] || "UTC",
              teacherUsername,
            };
          }) : []
        }));
        setChildren(childrenWithRegions);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  // Add this helper to normalize time strings to HH:mm - HH:mm
  function normalizeTimeRange(timeRange) {
    if (!timeRange) return timeRange;
    // Match both parts and pad with leading zero if needed
    const normalized = timeRange.replace(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/, (m, h1, m1, h2, m2) => {
      return `${h1.padStart(2, '0')}:${m1} - ${h2.padStart(2, '0')}:${m2}`;
    });
    console.log('[normalizeTimeRange] Original:', timeRange, 'Normalized:', normalized);
    return normalized;
  }

  // Helper to convert a time range string (e.g., "09:00 - 10:00") from teacher's region to user's region
  function convertTimeRangeFromTeacherToUser(timeRange, teacherZone, userZone, teacherUsername) {
    if (!timeRange || !teacherZone || !userZone) return "";
    // Normalize time string to HH:mm - HH:mm
    const normTimeRange = normalizeTimeRange(timeRange);
    const [start, end] = normTimeRange.split(" - ");
    try {
      const today = DateTime.now().setZone(teacherZone);
      const startDT = DateTime.fromFormat(start, "HH:mm", { zone: teacherZone }).set({
        year: today.year, month: today.month, day: today.day
      });
      const endDT = DateTime.fromFormat(end, "HH:mm", { zone: teacherZone }).set({
        year: today.year, month: today.month, day: today.day
      });
      const userStart = startDT.setZone(userZone);
      const userEnd = endDT.setZone(userZone);
      const result = `${userStart.toFormat("HH:mm")} - ${userEnd.toFormat("HH:mm")}`;
      console.log('[convertTimeRangeFromTeacherToUser] Teacher:', teacherUsername, 'TeacherZone:', teacherZone, 'UserZone:', userZone, 'Original:', timeRange, 'Normalized:', normTimeRange, 'Converted:', result);
      return result;
    } catch (e) {
      console.log('[convertTimeRangeFromTeacherToUser] ERROR', e, 'Input:', timeRange, 'Normalized:', normTimeRange, 'TeacherZone:', teacherZone, 'UserZone:', userZone);
      return normTimeRange;
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

  // Helper to build the grid for a child's slots
  function buildScheduleGrid(slots) {
    // Build a robust slot lookup: { [parentDay]: { [parentTime]: { status, localTime } } }
    const grid = {};
    const allLocalTimesSet = new Set();
    slots.forEach(slot => {
      if (!slot.time || !slot.day) return;
      const teacherZone = slot.teacherRegion || 'UTC';
      const teacherDayFull = slot.day;
      const teacherDayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(teacherDayFull);
      if (teacherDayIndex === -1) return;
      const refMonday = DateTime.utc(2023, 1, 2); // 2023-01-02 is a Monday
      const teacherDate = refMonday.plus({ days: teacherDayIndex });
      const [start] = slot.time.split(" - ");
      const [h, m] = start.split(":").map(Number);
      const teacherDT = teacherDate.set({ hour: h, minute: m, second: 0, millisecond: 0 }).setZone(teacherZone, { keepLocalTime: true });
      const parentDT = teacherDT.setZone(userRegion);
      const parentDay = parentDT.setLocale('en').toFormat('cccc');
      const parentTime = `${parentDT.toFormat("HH:mm")} - ${parentDT.plus({ minutes: 60 }).toFormat("HH:mm")}`;
      allLocalTimesSet.add(parentTime);
      if (!grid[parentTime]) grid[parentTime] = {};
      daysOfWeek.forEach(day => {
        if (!grid[parentTime][day]) grid[parentTime][day] = { status: 'Unavailable', localTime: parentTime };
      });
      if (slot.isBooked === true || slot.isBooked === 'true') {
        grid[parentTime][parentDay] = { status: 'Booked', localTime: parentTime };
      } else {
        grid[parentTime][parentDay] = { status: 'Available', localTime: parentTime };
      }
    });
    const allLocalTimes = Array.from(allLocalTimesSet).sort();
    return { allTimes: allLocalTimes, grid };
  }

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar onSectionChange={() => {}}/>
      <div className="main-content">
        <h2 className="section-header">My Children's Schedules</h2>
        {loading ? (
          <div>Loading schedules...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          children.map(child => {
            const slots = Array.isArray(child.slots) ? child.slots : [];
            if (!slots.length) {
              return (
                <div key={child.childId} className="parent-child-schedule-card">
                  <h3 className="parent-child-name">{child.childName}</h3>
                  <div style={{ color: '#888', marginBottom: 16 }}>No slots scheduled for this child.</div>
                </div>
              );
            }
            const { allTimes, grid } = buildScheduleGrid(slots);
            return (
              <div key={child.childId} className="parent-child-schedule-card">
                <h3 className="parent-child-name">{child.childName}</h3>
                <div className="parent-schedule-grid-wrapper">
                  <table className="parent-schedule-table parent-schedule-grid-table">
                    <thead>
                      <tr>
                        <th>Time</th>
                        {daysOfWeek.map(day => (
                          <th key={day}>{day}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allTimes.map(localTime => (
                        <tr key={localTime}>
                          <td className="parent-schedule-time-col">{localTime}</td>
                          {daysOfWeek.map(day => {
                            const cell = (grid[localTime] && grid[localTime][day]) ? grid[localTime][day] : { status: 'Unavailable', localTime };
                            const { status } = cell;
                            let cellClass = '';
                            if (status === 'Available') cellClass = 'parent-schedule-available';
                            else if (status === 'Booked') cellClass = 'parent-schedule-booked';
                            else cellClass = 'parent-schedule-unavailable';
                            return (
                              <td key={day} className={cellClass}>
                                {status === 'Unavailable' ? <span style={{ fontStyle: 'italic', color: '#aaa' }}></span>
                                  : status === 'Booked' ? <span style={{ color: '#e74c3c', fontWeight: 500 }}>Booked</span>
                                  : <span style={{ color: '#3a7c2b', fontWeight: 500 }}>Available</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ParentSchedule; 