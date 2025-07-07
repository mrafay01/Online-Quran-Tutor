import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import AgoraRTC from 'agora-rtc-sdk-ng';
import '../dashboard.css';
import { useVideoCall } from '../shared/VideoCallProvider';

const AGORA_APP_ID = "cd14423fdd0849a8a685e966616d0756"; // <-- Replace with your Agora App ID

const JoinClass = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]); // Store all booked slots
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSessions, setActiveSessions] = useState({}); // { slotId: { active, session } }
  const { callActive, startCall, endCall } = useVideoCall();
  const [sessionId, setSessionId] = useState(null);

  const token = null; // Use a real token for production

  // Poll for all slots and their call status
  useEffect(() => {
    let interval;
    const fetchSlotsAndSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/GetSchedule?username=${username}&role=student`);
        if (!res.ok) throw new Error('Failed to fetch schedule');
        const data = await res.json();
        let slots = Array.isArray(data.schedule) ? data.schedule : [];
        slots = slots.filter(slot => slot.isBooked === true || slot.isBooked === 'true');
        setSlots(slots);
        // Check for active sessions for all slots
        const sessions = {};
        for (const slot of slots) {
          const slotId = slot.slotId || slot.slot_id;
          const activeRes = await fetch(`http://localhost:5000/api/video-call/active?studentId=${username}&slotId=${slotId}`);
          const activeData = await activeRes.json();
          sessions[slotId] = { active: activeData.active, session: activeData.session };
        }
        setActiveSessions(sessions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSlotsAndSessions();
    interval = setInterval(fetchSlotsAndSessions, 5000);
    return () => clearInterval(interval);
  }, [username]);

  // Add this function to handle auto-open after call started
  const autoOpenQuranLesson = async (slot) => {
    if (!slot) return;
    const studentUsername = username;
    const teacherUsername = slot.teacher?.username;
    const courseId = slot.course?.courseId;
    if (studentUsername && courseId && teacherUsername) {
      const lessonsRes = await fetch(`http://localhost:5000/GetCourseLessons?username=${encodeURIComponent(studentUsername)}&courseId=${encodeURIComponent(courseId)}`);
      if (lessonsRes.ok) {
        const lessonsData = await lessonsRes.json();
        const lessons = Array.isArray(lessonsData.lessons) ? lessonsData.lessons : [];
        const firstNotCompleted = lessons.find(l => !l.completed);
        if (firstNotCompleted) {
          // Extract surah and ruku from title
          const title = firstNotCompleted.title || "";
          const surahMatch = title.match(/^([^(]+)\s*\(Ruku\s*(\d+)\)/i);
          let surahName = surahMatch ? surahMatch[1].trim() : "Al-Fatiha";
          let rukuId = surahMatch ? parseInt(surahMatch[2]) : 1;
          const lessonId = firstNotCompleted.lessonId;
          const queryParams = new URLSearchParams({
            courseId: courseId,
            surah_name: surahName,
            ruku_id: rukuId,
            lesson_id: lessonId,
            student_username: studentUsername,
            teacher_username: teacherUsername,
          }).toString();
          navigate(`/student/${username}/quran-lesson?${queryParams}`);
        }
      }
    }
  };

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: '#f6f6e9' }}>
      <Sidebar onSectionChange={()=>{}} />
      <div className="main-content" style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 0' }}>
        <h2 className="section-header">Join Class</h2>
        {loading ? (
          <div>Loading slots...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : slots.length === 0 ? (
          <div style={{ color: '#888', fontSize: '1.1rem' }}>No booked slots found.</div>
        ) : (
          <>
            {slots.map(slot => {
              const slotId = slot.slotId || slot.slot_id;
              const sessionInfo = activeSessions[slotId];
              return (
                <div key={slotId} className="slot-card" style={{ marginBottom: '2rem' }}>
                  {slot.teacher && (
                    <div className="slot-teacher">Teacher: {slot.teacher.teacherName || slot.teacher.name || slot.teacher.username}</div>
                  )}
                  {slot.course && slot.course.courseName && (
                    <div className="slot-course">Course: {slot.course.courseName}</div>
                  )}
                  <div className="slot-details">
                    {slot.day && <span className="slot-day">{slot.day}</span>}
                    {slot.time && <span className="slot-time">{slot.time}</span>}
                  </div>
                  {sessionInfo && sessionInfo.active ? (
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: 20, padding: '0.7rem 2.2rem', fontSize: '1.1rem' }}
                      onClick={async () => {
                        await startCall({
                          channel: `class_${slotId}`,
                          username,
                          token: null,
                          role: 'student',
                          slotId: slotId,
                          sessionId: sessionInfo.session?.SessionID,
                        });
                        await autoOpenQuranLesson(slot);
                      }}
                      disabled={callActive}
                    >
                      {callActive ? 'Call Started' : 'Join Call'}
                    </button>
                  ) : (
                    <div style={{ color: '#888', fontSize: '1.1rem' }}>Waiting for teacher to start the call...</div>
                  )}
                  {callActive && (
                    <button
                      className="btn btn-secondary"
                      style={{ marginLeft: 16 }}
                      onClick={endCall}
                    >
                      End Call
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default JoinClass;
