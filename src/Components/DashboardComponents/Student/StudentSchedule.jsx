import React, { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import { useParams } from 'react-router-dom';
import '../dashboard.css';
import './schedule.css';

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const StudentSchedule = () => {
  const { username } = useParams();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/GetSchedule?username=${encodeURIComponent(username)}&role=student`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch schedule");
        return res.json();
      })
      .then(data => {
        setSlots(Array.isArray(data.schedule) ? data.schedule : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

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
              slots.filter(slot => slot.day === day).forEach(slot => {
                acc[day][slot.time] = slot;
              });
              return acc;
            }, {});
            // Get all unique times for this course
            const allTimes = Array.from(new Set(slots.map(slot => slot.time))).sort();
            return (
              <div key={course.courseId} className="schedule-table-wrapper">
                <h2 style={{ margin: '0 0 8px 0', fontWeight: 700, color: 'var(--primary-dark)', fontSize: '1.3rem' }}>{course.courseName} <span style={{ fontWeight: 400, fontSize: '1rem', color: '#666' }}>({course.teacherName})</span></h2>
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th className="schedule-th schedule-time-th">Time</th>
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