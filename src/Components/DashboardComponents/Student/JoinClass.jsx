import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../Sidebar';
import { useParams, useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';
import AgoraRTC from 'agora-rtc-sdk-ng';
import '../dashboard.css';

const AGORA_APP_ID = "cd14423fdd0849a8a685e966616d0756"; // <-- Replace with your Agora App ID

const JoinClass = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [nextSlot, setNextSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callAvailable, setCallAvailable] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [agoraClient, setAgoraClient] = useState(null);
  const [joined, setJoined] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [audioTrackObj, setAudioTrackObj] = useState(null);
  const [videoTrackObj, setVideoTrackObj] = useState(null);

  const token = null; // Use a real token for production

  // Poll for next slot and call status
  useEffect(() => {
    if (callStarted) return; // Don't poll if call is ongoing

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
  }, [username, callStarted]);

  // Agora logic
  useEffect(() => {
    if (!callStarted) return;
    let client = null;
    let audioTrack = null;
    let videoTrack = null;

    const startAgora = async () => {
      try {
        client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        setAgoraClient(client);

        // Join channel
        const channel = nextSlot ? `class_${nextSlot.slotId}` : 'default_channel';
        await client.join(AGORA_APP_ID, channel, token || null, username);

        // Try to get both audio and video
        try {
          [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        } catch (err) {
          // Try audio only if video fails
          try {
            audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            // Optionally, show a message: "No camera detected, joining with audio only."
          } catch (audioErr) {
            setError("No microphone or camera detected.");
            return;
          }
        }

        setAudioTrackObj(audioTrack);
        setVideoTrackObj(videoTrack);

        // Play local video if available
        if (localVideoRef.current && videoTrack) {
          videoTrack.play(localVideoRef.current);
        }

        // Publish tracks
        if (audioTrack && videoTrack) {
          await client.publish([audioTrack, videoTrack]);
        } else if (audioTrack) {
          await client.publish([audioTrack]);
        }

        setJoined(true);

        // Subscribe to remote user
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'video' && remoteVideoRef.current) {
            user.videoTrack.play(remoteVideoRef.current);
          }
          if (mediaType === 'audio') {
            user.audioTrack.play();
          }
        });

        // Cleanup on leave
        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video' && remoteVideoRef.current) {
            remoteVideoRef.current.innerHTML = '';
          }
        });
      } catch (err) {
        setError("No microphone or camera detected.");
        return;
      }
    };

    startAgora();

    return () => {
      if (client) {
        client.leave();
      }
      if (audioTrack) audioTrack.close();
      if (videoTrack) videoTrack.close();
      setAudioTrackObj(null);
      setVideoTrackObj(null);
      setJoined(false);
    };
    // eslint-disable-next-line
  }, [callStarted]);

  // Mute/unmute handlers
  const handleToggleAudio = async () => {
    if (audioTrackObj) {
      if (audioMuted) {
        await audioTrackObj.setEnabled(true);
        setAudioMuted(false);
      } else {
        await audioTrackObj.setEnabled(false);
        setAudioMuted(true);
      }
    }
  };

  const handleToggleVideo = async () => {
    if (videoTrackObj) {
      if (videoMuted) {
        await videoTrackObj.setEnabled(true);
        setVideoMuted(false);
      } else {
        await videoTrackObj.setEnabled(false);
        setVideoMuted(true);
      }
    }
  };

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
                setCallStarted(true);
                await autoOpenQuranLesson();
              }}
              disabled={callStarted}
            >
              {callStarted ? 'Call Started' : 'Join Call'}
            </button>
          </div>
        )}
        {callStarted && (
          <div className="video-call-container">
            <div className="video-call-header">Video Call In Progress</div>
            <div className="video-streams">
              <div
                ref={localVideoRef}
                className={`video-box${audioMuted ? ' muted' : ''}`}
              >
                Local Video
              </div>
              <div ref={remoteVideoRef} className="video-box">
                Remote Video
              </div>
            </div>
            <div className="video-call-controls">
              <button className="video-call-btn" onClick={handleToggleAudio}>
                {audioMuted ? (
                  <>
                    <span role="img" aria-label="Unmute">&#128264;</span> Unmute
                  </>
                ) : (
                  <>
                    <span role="img" aria-label="Mute">&#128263;</span> Mute
                  </>
                )}
              </button>
              <button
                className="video-call-btn"
                onClick={handleToggleVideo}
                disabled={!videoTrackObj}
              >
                {videoMuted ? (
                  <>
                    <span role="img" aria-label="Show Video">&#128249;</span> Show Video
                  </>
                ) : (
                  <>
                    <span role="img" aria-label="Hide Video">&#128250;</span> Hide Video
                  </>
                )}
              </button>
              <button
                className="video-call-btn danger"
                onClick={async () => {
                  if (agoraClient) agoraClient.leave();
                  if (sessionId) {
                    await fetch('http://localhost:5000/api/video-call/end', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ sessionId })
                    });
                  }
                  setCallStarted(false);
                  setJoined(false);
                }}
              >
                <span role="img" aria-label="End">&#128682;</span> End Call
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinClass;
