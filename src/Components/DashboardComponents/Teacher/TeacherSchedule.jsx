import React, { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import { useParams } from 'react-router-dom';
import '../dashboard.css';
import './schedule.css';

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TeacherSchedule = () => {
  const { username } = useParams();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/GetSchedule?username=${encodeURIComponent(username)}&role=teacher`)
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

  // Get all unique times
  const allTimes = Array.from(new Set(slots.map(slot => slot.time))).sort();
  // Build a lookup for quick access: { [day]: { [time]: slotObj } }
  const slotLookup = days.reduce((acc, day) => {
    acc[day] = {};
    slots.filter(slot => slot.day === day).forEach(slot => {
      acc[day][slot.time] = slot;
    });
    return acc;
  }, {});

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      <div className="main-content">
        <h2 className="section-header">My Teaching Schedule</h2>
        {loading ? (
          <div>Loading schedule...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <div className="schedule-table schedule-grid-table">
            <div className="schedule-header" style={{ display: 'flex', background: 'var(--background-dark)', borderRadius: 12, overflow: 'hidden' }}>
              <div className="schedule-cell schedule-time-header" style={{ flex: 1.2, fontWeight: 700, padding: '12px 0', textAlign: 'center', background: 'var(--background-dark)', borderRight: '1px solid var(--border)' }}>Time</div>
              {days.map(day => (
                <div key={day} className="schedule-cell schedule-day-header" style={{ flex: 1, fontWeight: 700, padding: '12px 0', textAlign: 'center', background: 'var(--background-dark)', borderRight: day !== 'Sunday' ? '1px solid var(--border)' : 'none' }}>{day}</div>
              ))}
            </div>
            {allTimes.map((time, idx) => (
              <div className="schedule-row" key={time} style={{ display: 'flex', background: idx % 2 === 0 ? 'var(--background)' : '#fff', borderRadius: idx === allTimes.length - 1 ? '0 0 12px 12px' : 'none' }}>
                <div className="schedule-cell schedule-time" style={{ flex: 1.2, padding: '12px 0', textAlign: 'center', fontWeight: 600, background: 'var(--background-dark)', borderRight: '1px solid var(--border)' }}>{time}</div>
                {days.map(day => {
                  const slot = slotLookup[day][time];
                  return (
                    <div className="schedule-cell" key={day + time} style={{ flex: 1, padding: '12px 0', textAlign: 'center', borderRight: day !== 'Sunday' ? '1px solid var(--border)' : 'none' }}>
                      {slot ? (
                        <span style={{ color: 'var(--primary-dark)', fontWeight: 600, background: '#e6f9f2', borderRadius: 8, padding: '2px 10px' }}>{slot.studentName ? `With ${slot.studentName}` : 'Booked'}</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherSchedule; 