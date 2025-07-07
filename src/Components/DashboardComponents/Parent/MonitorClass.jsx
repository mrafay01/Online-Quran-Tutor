import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useVideoCall } from '../shared/VideoCallProvider';
import Sidebar from '../Sidebar';

const MonitorClass = () => {
  const { username } = useParams();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSessions, setActiveSessions] = useState({});
  const { callActive, startCall, endCall } = useVideoCall();

  useEffect(() => {
    const fetchChildren = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/GetParentChildren?username=${username}`);
        if (!res.ok) throw new Error('Failed to fetch children');
        const data = await res.json();
        setChildren(Array.isArray(data.children) ? data.children : []);
        console.log('Children:', data.children);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, [username]);

  useEffect(() => {
    if (children.length === 0) return;
    const fetchSessions = async () => {
      const sessions = {};
      for (const child of children) {
        // For each child, check all their slots for active session
        if (!child.username || !Array.isArray(child.slots)) continue;
        for (const slot of child.slots) {
          const res = await fetch(`http://localhost:5000/api/video-call/active?studentId=${child.username}&slotId=${slot.slotId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.active && data.session) {
              sessions[child.username] = { ...data.session, slot };
              break; // Only show one active session per child
            }
          }
          console.log('Checking slot', slot.slotId, 'for child', child.username);
        }
      }
      setActiveSessions(sessions);
    };
    fetchSessions();
    // Optionally poll every 10s
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, [children]);

  const handleMonitor = async (childUsername, session) => {
    await startCall({
      channel: session.RoomID || `class_${session.SlotID}`,
      username,
      token: null,
      role: 'parent',
      slotId: session.SlotID,
      sessionId: session.SessionID,
    });
  };

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: '#f6f6e9' }}>
      <Sidebar onSectionChange={() => {}} />
      <div className="main-content" style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 0' }}>
        <h2 className="section-header">Monitor Class</h2>
        {loading ? (
          <div>Loading children...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : children.length === 0 ? (
          <div style={{ color: '#888', fontSize: '1.1rem' }}>No children found.</div>
        ) : (
          <>
            {children.map(child => (
              <div key={child.username} className="slot-card" style={{ marginBottom: '2rem' }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{child.name || child.username}</div>
                {activeSessions[child.username] ? (
                  <>
                    <div style={{ margin: '8px 0' }}>
                      <span style={{ color: '#38d39f', fontWeight: 500 }}>Active Session</span> <br />
                      <span>Course: {activeSessions[child.username].CourseId || activeSessions[child.username].CourseID}</span><br />
                      <span>Slot: {activeSessions[child.username].slot?.day} {activeSessions[child.username].slot?.time}</span>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: 10, padding: '0.7rem 2.2rem', fontSize: '1.1rem' }}
                      onClick={() => handleMonitor(child.username, activeSessions[child.username])}
                      disabled={callActive}
                    >
                      {callActive ? 'Monitoring...' : 'Monitor Class'}
                    </button>
                    {/*
                    // If you want parent to be able to end monitoring, uncomment below:
                    {callActive && (
                      <button
                        className="btn btn-secondary"
                        style={{ marginLeft: 16 }}
                        onClick={endCall}
                      >
                        End Monitoring
                      </button>
                    )}
                    */}
                  </>
                ) : (
                  <div style={{ color: '#888', fontSize: '1rem', marginTop: 8 }}>No active session for this child.</div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default MonitorClass; 