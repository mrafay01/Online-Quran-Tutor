import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import io from "socket.io-client";
import './Quran.css';

const QuranbyLessons = (props) => {
  const { role, username } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Get lesson parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const course_id = searchParams.get('course_id') || searchParams.get('courseId');
  const teacher_username = searchParams.get('teacher_username') || searchParams.get('teacherUsername');
  const surahName = searchParams.get('surah_name');
  const rukuId = searchParams.get('ruku_id');
  const lessonId = searchParams.get('lesson_id');
  // For teacher/parent, may need to specify student_username
  const studentUsername = searchParams.get('student_username') || props.studentUsername || username;

  // State for Quran data and lesson details
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(0); // 0 = not completed, 1 = completed
  const [bookmark, setBookmark] = useState(null); // AyahPointer
  const [currentAyah, setCurrentAyah] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [studentId, setStudentId] = useState(null);

  const socketRef = useRef();

  // Fetch lesson details (status, bookmark, ayahs)
  useEffect(() => {
    if (!surahName || !rukuId) {
      setError('Missing required parameters: surah_name and ruku_id');
      setLoading(false);
      return;
    }
    fetchLessonDetails();
  }, [surahName, rukuId, studentUsername, role]);

  useEffect(() => {
    if (!studentUsername) return;
    fetch(`http://localhost:5000/GetStudentProfile?username=${encodeURIComponent(studentUsername)}`)
      .then(res => res.json())
      .then(profile => {
        if (profile.id) setStudentId(profile.id);
      });
  }, [studentUsername]);

  useEffect(() => {
    if (!studentId) return;
    if (!socketRef.current) {
      socketRef.current = io("http://localhost:5000");
    }
    // Join the student's room
    socketRef.current.emit("join", { student_id: studentId });

    // Listen for bookmark updates
    socketRef.current.on("bookmark_update", (data) => {
      setBookmark(data.ayah_no);
      setCurrentAyah(data.ayah_no - (ayahs[0]?.verse || 1));
    });

    // Cleanup
    return () => {
      socketRef.current.emit("leave", { student_id: studentId });
      socketRef.current.off("bookmark_update");
    };
  }, [studentId]);

  const fetchLessonDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        role,
        username: role === 'teacher' ? username : studentUsername,
        surah_name: surahName,
        ruku_id: rukuId,
        course_id: course_id,
        teacher_username: teacher_username,
      };
      if (role === 'teacher') {
        params.teacher_username = username;
        params.student_username = studentUsername;
      }
      const res = await axios.get('http://localhost:5000/api/lesson-details', { params });
      setAyahs(res.data.ayahs || []);
      setStatus(res.data.status || 0);
      setBookmark(res.data.bookmark || null);
      // Set currentAyah to bookmark if available
      if (res.data.bookmark) setCurrentAyah(res.data.bookmark - (ayahs[0]?.verse || 1));
    } catch (err) {
      setError('Failed to load lesson details.');
    } finally {
      setLoading(false);
    }
  };

  // Teacher: set bookmark for student
  const handleSetBookmark = async (ayahIndex) => {
    if (role !== 'teacher') return;
    setIsSaving(true);
    try {
      const ayahNo = ayahs[ayahIndex]?.verse;
      await axios.post('http://localhost:5000/api/lesson-bookmark', {
        username: studentUsername,
        surah_name: surahName,
        ruku_id: rukuId,
        ayah_no: ayahNo,
        course_id: course_id,
        teacher_username: username,
      });
      setBookmark(ayahNo);
      setCurrentAyah(ayahIndex);
    } catch (err) {
      alert('Failed to set bookmark.');
    } finally {
      setIsSaving(false);
    }
  };

  // Teacher: set lesson status for student
  const handleSetStatus = async (newStatus) => {
    if (role !== 'teacher') return;
    setIsSaving(true);
    try {
      await axios.post('http://localhost:5000/api/lesson-status', {
        course_id: course_id,
        student_username: studentUsername,
        surah_name: surahName,
        ruku_id: rukuId,
        teacher_username : username,
        status: newStatus,
      });
      setStatus(newStatus);
    } catch (err) {
      alert('Failed to update status.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle ayah click (for navigation/progress)
  const handleAyahClick = (ayahIndex) => {
    setCurrentAyah(ayahIndex);
  };

  // Render status display and controls
  const renderStatus = () => (
    <div className="lesson-status-row">
      <span className={`lesson-status-label ${status ? 'completed' : 'not-completed'}`}>{status ? 'Completed' : 'Not Completed'}</span>
      {role === 'teacher' && (
        <button
          className="tool-btn"
          style={{ marginLeft: 12 }}
          disabled={isSaving}
          onClick={() => handleSetStatus(status ? 0 : 1)}
        >
          Mark as {status ? 'Not Completed' : 'Completed'}
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="quran-lesson-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Quran lesson...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quran-lesson-container">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="quran-lesson-container">
      <div className="lesson-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back to Lessons
        </button>
        <h1>Surah {surahName} - Ruku {rukuId}</h1>
        {renderStatus()}
      </div>
      <div className="lesson-content">
        <div className="quran-text-section">
          <div className="quran-text">
            {ayahs.map((ayah, index) => (
              <div
                key={ayah.verse}
                className={`ayah-container ${currentAyah === index ? 'active' : ''} ${bookmark === ayah.verse ? 'bookmarked' : ''}`}
                onClick={() => handleAyahClick(index)}
              >
                <div className="ayah-header">
                  <span className="ayah-number">{ayah.verse}</span>
                  <div className="ayah-actions">
                    {/* Only teacher can set bookmark */}
                    {role === 'teacher' && (
                      <button
                        className="bookmark-btn"
                        disabled={isSaving}
                        onClick={e => {
                          e.stopPropagation();
                          handleSetBookmark(index);
                        }}
                      >
                        {bookmark === ayah.verse ? '🔖' : '📖'}
                      </button>
                    )}
                    {/* Student/parent: show bookmark icon if bookmarked, but not clickable */}
                    {(role === 'student' || role === 'parent') && bookmark === ayah.verse && (
                      <span className="bookmark-btn" style={{ cursor: 'default', opacity: 0.7 }}>🔖</span>
                    )}
                  </div>
                </div>
                <div className="ayah-text">{ayah.text}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="quran-siderbar">
          {/* User-specific features (progress, tools, etc.) can go here if needed */}
          <div className="lesson-info">
            <h3>Lesson Information</h3>
            <p><strong>Surah:</strong> {surahName}</p>
            <p><strong>Ruku:</strong> {rukuId}</p>
            <p><strong>Total Ayahs:</strong> {ayahs.length}</p>
            <p><strong>Bookmark:</strong> {bookmark ? `Ayah ${bookmark}` : 'None'}</p>
            <p><strong>Status:</strong> {status ? 'Completed' : 'Not Completed'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranbyLessons;
