import React, { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import { useParams } from 'react-router-dom';
import '../dashboard.css';
import './schedule.css';

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const ParentSchedule = () => {
  const { username } = useParams();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/GetChildrenSchedules?parentUsername=${encodeURIComponent(username)}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch schedules");
        return res.json();
      })
      .then(data => {
        setChildren(Array.isArray(data.children) ? data.children : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <Sidebar />
      <div className="main-content">
        <h2 className="section-header">My Children's Schedules</h2>
        {loading ? (
          <div>Loading schedules...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          children.map(child => (
            <div key={child.childId} style={{ marginBottom: 40, background: 'var(--white)', borderRadius: 16, boxShadow: 'var(--shadow)', padding: 24, maxWidth: 900, marginLeft: 'auto', marginRight: 'auto' }}>
              <h3 style={{ margin: '0 0 8px 0', fontWeight: 700, color: 'var(--primary-dark)', fontSize: '1.1rem' }}>{child.childName}</h3>
              {Array.isArray(child.courses) && child.courses.length > 0 ? (
                child.courses.map(course => (
                  <div key={course.courseId} style={{ marginBottom: 24 }}>
                    <h4 style={{ color: 'var(--primary)', fontWeight: 600 }}>{course.courseName}</h4>
                    {/* Render schedule grid for this course */}
                    {/* You can reuse the student grid logic here if needed */}
                  </div>
                ))
              ) : (
                <div style={{ color: '#888', marginBottom: 16 }}>No courses scheduled for this child.</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParentSchedule; 