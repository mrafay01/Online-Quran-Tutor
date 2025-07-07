import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import AgoraRTC from 'agora-rtc-sdk-ng';
import '../dashboard.css';
import { useVideoCall } from '../shared/VideoCallProvider';

const AGORA_APP_ID = "cd14423fdd0849a8a685e966616d0756";

const StartClass = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [nextSlot, setNextSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { callActive, startCall, endCall } = useVideoCall();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [upcomingSlots, setUpcomingSlots] = useState([]);

  // Replace with your real token/channel logic
  const channelName = nextSlot ? `class_${nextSlot.slotId}` : 'default_channel';
  const token = null; // Use a real token for production

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:5000/GetSchedule?username=${username}&role=teacher`);
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
        setUpcomingSlots(slotsWithNext.slice(0, 3));
        setNextSlot(slotsWithNext.length > 0 ? slotsWithNext[0] : null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchSlots();
  }, [username]);

  // Helper to check if a slot is already sessioned for more than 10 mins
  const isSlotSessionedTooOld = async (slot) => {
    // Check backend for active session for this slot
    const res = await fetch(`http://localhost:5000/api/video-call/active?studentId=${slot.student?.username}&slotId=${slot.slotId}`);
    if (!res.ok) return false;
    const data = await res.json();
    if (data.active && data.session && data.session.CallStartTime) {
      const started = DateTime.fromISO(data.session.CallStartTime);
      const now = DateTime.now();
      return now.diff(started, 'minutes').minutes > 10;
    }
    return false;
  };

  // Modified handleStartCall to accept slot
  const handleStartCall = async (slot) => {
    if (!slot) return;
    // Check if session is too old
    const tooOld = await isSlotSessionedTooOld(slot);
    if (tooOld) {
      setError('This slot already has a session started more than 10 minutes ago. You cannot start a new class for this slot.');
      return;
    }
    try {
      const channel = `class_${slot.slotId}`;
      const res = await fetch('http://localhost:5000/api/video-call/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: slot.teacher?.username || username,
          studentId: slot.student?.username,
          slotId: slot.slotId,
          roomId: channel,
          courseId: slot.course?.courseId
        })
      });
      if (!res.ok) throw new Error('Failed to start call session');
      const data = await res.json();
      await startCall({
        channel,
        username,
        token: null,
        role: 'teacher',
        slotId: slot.slotId,
        sessionId: data.SessionID || data.sessionId || data.id,
      });
      // --- Auto open QuranbyLessons with first not completed lesson ---
      const studentUsername = slot.student?.username;
      const teacherUsername = slot.teacher?.username || username;
      const courseId = slot.course?.courseId;
      if (studentUsername && courseId) {
        const lessonsRes = await fetch(`http://localhost:5000/GetCourseLessons?username=${encodeURIComponent(studentUsername)}&courseId=${encodeURIComponent(courseId)}`);
        if (lessonsRes.ok) {
          const lessonsData = await lessonsRes.json();
          const lessons = Array.isArray(lessonsData.lessons) ? lessonsData.lessons : [];
          const firstNotCompleted = lessons.find(l => !l.completed);
          if (firstNotCompleted) {
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
            navigate(`/teacher/${username}/quran-lesson?${queryParams}`);
          }
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // End call API integration
  const handleEndCall = async () => {
    endCall();
  };

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', background: '#f6f6e9' }}>
        <Sidebar onSectionChange={()=>{}} />
      <div className="main-content" style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 0' }}>
        <h2 className="section-header">Start Class</h2>
        {loading ? (
          <div>Loading next slot...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : upcomingSlots.length === 0 ? (
          <div style={{ color: '#888', fontSize: '1.1rem' }}>No upcoming slot found.</div>
        ) : (
          <>
            {upcomingSlots.map((slot, idx) => (
              <div className="slot-card" style={{ marginBottom: '2rem' }} key={slot.slotId}>
                {slot.student && (
                  <div className="slot-student">Student: {slot.student.studentName || slot.student.name || slot.student.username}</div>
                )}
                {slot.course && slot.course.courseName && (
                  <div className="slot-course">Course: {slot.course.courseName}</div>
                )}
                <div className="slot-details">
                  {slot.day && <span className="slot-day">{slot.day}</span>}
                  {slot.time && <span className="slot-time">{slot.time}</span>}
                </div>
                <button
                  className="btn btn-primary"
                  style={{ marginTop: 20, padding: '0.7rem 2.2rem', fontSize: '1.1rem' }}
                  onClick={() => handleStartCall(slot)}
                  disabled={callActive}
                >
                  {callActive ? 'Call Started' : 'Start Call'}
                </button>
                {callActive && (
                  <button
                    className="btn btn-secondary"
                    style={{ marginLeft: 16 }}
                    onClick={handleEndCall}
                  >
                    End Call
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default StartClass;
