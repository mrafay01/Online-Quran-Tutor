import React, { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import { useParams } from 'react-router-dom';
import '../dashboard.css';
import './schedule.css';
import { DateTime } from 'luxon';

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const StudentSchedule = () => {
  const { username } = useParams();
  const [slots, setSlots] = useState([]);
  const [studentRegion, setStudentRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch student region (timezone)
  useEffect(() => {
    if (!username) return;
    fetch(`http://localhost:5000/api/get_user_region?username=${encodeURIComponent(username)}&role=student`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch timezone");
        return res.json();
      })
      .then(data => {
        setStudentRegion(data.region || Intl.DateTimeFormat().resolvedOptions().timeZone);
      })
      .catch(err => {
        setStudentRegion(Intl.DateTimeFormat().resolvedOptions().timeZone); // fallback
      });
  }, [username]);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/GetSchedule?username=${encodeURIComponent(username)}&role=student`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch schedule");
        return res.json();
      })
      .then(async data => {
        let slots = Array.isArray(data.schedule) ? data.schedule : [];

        // Ensure each slot has a teacher object
        slots = slots.map(slot => ({
          ...slot,
          teacher: {
            username: slot.teacherUsername,
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
        setSlots(slots);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  // Helper to convert a time range string (e.g., "09:00 - 10:00") from teacher's region to student's region
  function convertTimeRangeFromTeacherToStudent(timeRange, teacherZone, studentZone, teacherUsername) {
    if (!timeRange || !teacherZone || !studentZone) return "";
    const [start, end] = timeRange.split(" - ");
    try {
      // Parse in teacher's timezone
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
      console.log('Student region:', studentZone);
      console.log('Original time:', timeRange);
      console.log('Parsed teacher start:', startDT.toISO(), '(valid:', startDT.isValid, ')');
      console.log('Parsed teacher end:', endDT.toISO(), '(valid:', endDT.isValid, ')');
      const studentStart = startDT.setZone(studentZone);
      const studentEnd = endDT.setZone(studentZone);
      console.log('Converted student start:', studentStart.toISO(), '(', studentStart.toFormat('HH:mm'), ')');
      console.log('Converted student end:', studentEnd.toISO(), '(', studentEnd.toFormat('HH:mm'), ')');
      const result = `${studentStart.toFormat("HH:mm")} - ${studentEnd.toFormat("HH:mm")}`;
      console.log('Final localTime:', result);
      return result;
    } catch (e) {
      console.log('Timezone conversion error:', e);
      return timeRange;
    }
  }

  // Group slots by courseId (ignore slots with course: null)
  const coursesMap = {};
  slots.forEach(slot => {
    if (slot.course && slot.course.courseId) {
      if (!coursesMap[slot.course.courseId]) {
        coursesMap[slot.course.courseId] = {
          courseId: slot.course.courseId,
          courseName: slot.course.courseName,
          teacherName: slot.teacher ? slot.teacher.teacherName : '',
          slots: []
        };
      }
      // Convert time range from teacher's region to student's region
      if (slot.time && /^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/.test(slot.time)) {
        const teacherZone = slot.teacher && slot.teacher.region ? slot.teacher.region : "UTC";
        slot.localTime = convertTimeRangeFromTeacherToStudent(slot.time, teacherZone, studentRegion, slot.teacher?.username);
      } else {
        slot.localTime = null;
      }
      coursesMap[slot.course.courseId].slots.push(slot);
    }
  });
  const courses = Object.values(coursesMap);

  return (
    <div className="dashboard-container">
      <Sidebar
        onSectionChange={() => {}}
      />
      <div className="main-content">
        <h2 className="section-header">My Schedule</h2>
        {loading ? (
          <div>Loading schedule data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : !courses.length ? (
          <div className="no-data">No booked courses found.</div>
        ) : (
          courses.map((course) => {
            const slots = course.slots;
            // Build a lookup for quick access: { [day]: { [time]: slotObj } }
            const slotLookup = days.reduce((acc, day) => {
              acc[day] = {};
              slots.filter(slot => slot.day === day && slot.localTime).forEach(slot => {
                acc[day][slot.localTime] = slot;
              });
              return acc;
            }, {});
            // Get all unique times for this course (in student's region)
            const allTimes = Array.from(new Set(slots
              .map(slot => slot.localTime)
              .filter(time => !!time)
            )).sort();
            return (
              <div key={course.courseId} className="schedule-table-wrapper">
                <h2 style={{ margin: '0 0 8px 0', fontWeight: 700, color: 'var(--primary-dark)', fontSize: '1.3rem' }}>{course.courseName}</h2>
                <div style={{ fontWeight: 400, fontSize: '1rem', color: '#666', marginBottom: 8 }}>
                  Teacher: {slots[0]?.teacher?.username || course.teacherName || 'Unknown'}
                </div>
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th className="schedule-th schedule-time-th">Time ({studentRegion})</th>
                      {days.map(day => (
                        <th key={day} className="schedule-th schedule-day-th">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allTimes.map((time, idx) => (
                      <tr key={time} className={`schedule-row ${idx % 2 === 0 ? 'even' : 'odd'}`}>
                        <td className="schedule-td schedule-time-td">{time}</td>
                        {days.map(day => {
                          const slot = slotLookup[day][time];
                          return (
                            <td key={day + time} className={`schedule-td ${slot && slot.isBooked ? 'schedule-booked' : 'schedule-unavailable'}`}>
                              {slot && slot.isBooked ? 'Booked' : ''}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentSchedule;