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
  const [nextSlot, setNextSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callAvailable, setCallAvailable] = useState(false);
  const { callActive, startCall, endCall } = useVideoCall();
  const [sessionId, setSessionId] = useState(null);

  const token = null; // Use a real token for production

  // Poll for next slot and call status
  useEffect(() => {
    let interval;
    const fetchNextSlot = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/GetSchedule?username=${username}&role=student`);
        if (!res.ok) throw new Error('Failed to fetch schedule');
        const data = await res.json();
        let slots = Array.isArray(data.schedule) ? data.schedule : [];
        slots = slots.filter(slot => slot.isBooked === true || slot.isBooked === 'true');
        const now = DateTime.now();
        const getNextOccurrence = (slot) => {
          if (!slot.day || !slot.time) return null;
          const [start] = slot.time.split('-').map(s => s.trim());
          const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const slotDayIdx = daysOfWeek.indexOf(slot.day);
          if (slotDayIdx === -1) return null;
          let next = now.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
          next = next.plus({ days: (slotDayIdx - now.weekday % 7 + 7) % 7 });
          const [h, m] = start.split(':');
          next = next.set({ hour: parseInt(h, 10), minute: parseInt(m, 10) });
          if (next < now) next = next.plus({ days: 7 });
          return next;
        };
        const slotsWithNext = slots.map(slot => ({ ...slot, nextOccurrence: getNextOccurrence(slot) })).filter(slot => slot.nextOccurrence);
        slotsWithNext.sort((a, b) => a.nextOccurrence - b.nextOccurrence);
        const slot = slotsWithNext.length > 0 ? slotsWithNext[0] : null;
        setNextSlot(slot);
        // Check if call is available using backend
        if (slot) {
          const activeRes = await fetch(`http://localhost:5000/api/video-call/active?studentId=${username}&slotId=${slot.slotId || slot.slot_id}`);
          const activeData = await activeRes.json();
          setCallAvailable(activeData.active);
          if (activeData.session && activeData.session.SessionID) {
            setSessionId(activeData.session.SessionID);
          } else {
            setSessionId(null);
          }
        } else {
          setCallAvailable(false);
          setSessionId(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNextSlot();
    interval = setInterval(fetchNextSlot, 5000);
    return () => clearInterval(interval);
  }, [username]);

  // Add this function to handle auto-open after call started
  const autoOpenQuranLesson = async () => {
    if (!nextSlot) return;
    const studentUsername = username;
    const teacherUsername = nextSlot.teacher?.username;
    const courseId = nextSlot.course?.courseId;
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
          <div>Loading next slot...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : !nextSlot ? (
          <div style={{ color: '#888', fontSize: '1.1rem' }}>No upcoming slot found.</div>
        ) : !callAvailable ? (
          <div style={{ color: '#888', fontSize: '1.1rem' }}>Waiting for teacher to start the call...</div>
        ) : (
          <div className="slot-card" style={{ marginBottom: '2rem' }}>
            {nextSlot.teacher && (
              <div className="slot-teacher">Teacher: {nextSlot.teacher.teacherName || nextSlot.teacher.name || nextSlot.teacher.username}</div>
            )}
            {nextSlot.course && nextSlot.course.courseName && (
              <div className="slot-course">Course: {nextSlot.course.courseName}</div>
            )}
            <div className="slot-details">
              {nextSlot.day && <span className="slot-day">{nextSlot.day}</span>}
              {nextSlot.time && <span className="slot-time">{nextSlot.time}</span>}
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 20, padding: '0.7rem 2.2rem', fontSize: '1.1rem' }}
              onClick={async () => {
                await startCall({
                  channel: `class_${nextSlot.slotId}`,
                  username,
                  token: null,
                  role: 'student',
                  slotId: nextSlot.slotId,
                  sessionId: sessionId,
                });
                await autoOpenQuranLesson();
              }}
              disabled={callActive}
            >
              {callActive ? 'Call Started' : 'Join Call'}
            </button>
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
        )}
      </div>
    </div>
  );
};

export default JoinClass;
