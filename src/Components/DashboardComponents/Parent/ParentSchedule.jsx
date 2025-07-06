import React, { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import { useParams } from 'react-router-dom';
import '../dashboard.css';
import './schedule.css';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ParentSchedule = () => {
  const { username } = useParams();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/GetSchedule?username=${encodeURIComponent(username)}&role=Parent`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch schedules");
        return res.json();
      })
      .then(data => {
        setChildren(Array.isArray(data.childrenSchedules) ? data.childrenSchedules : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  // Helper to build the grid for a child's slots
  function buildScheduleGrid(slots) {
    // Get all unique times from slots, sorted
    const allTimes = Array.from(new Set(slots.map(slot => slot.time))).sort();
    // Build a map: grid[time][day] = status
    const grid = {};
    allTimes.forEach(time => {
      grid[time] = {};
      daysOfWeek.forEach(day => {
        grid[time][day] = 'Unavailable';
      });
    });
    slots.forEach(slot => {
      if (!slot.time || !slot.day) return;
      if (slot.isBooked === true || slot.isBooked === 'true') {
        grid[slot.time][slot.day] = 'Booked';
      } else {
        grid[slot.time][slot.day] = 'Available';
      }
    });
    return { allTimes, grid };
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
                      {allTimes.map(time => (
                        <tr key={time}>
                          <td className="parent-schedule-time-col">{time}</td>
                          {daysOfWeek.map(day => {
                            const status = grid[time][day];
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