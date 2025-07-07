import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import '../dashboard.css';

const ChildrenProgressDetail = () => {
  const { username, role } = useParams(); // username = parent username
  const navigate = useNavigate();
  const location = useLocation();

  // Get student and course parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const studentUsername = searchParams.get('student_username');
  const courseId = searchParams.get('course_id') || searchParams.get('courseId');
  const studentName = searchParams.get('student_name');
  const courseName = searchParams.get('course_name');

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('children-progress');
  const [studentProfile, setStudentProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [courseInfo, setCourseInfo] = useState({ courseName: '', teacherName: '', teacherUsername: '' });

  useEffect(() => {
    if (!studentUsername || !courseId) {
      setError('Missing required parameters: student_username and course_id');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/GetCourseLessons?username=${encodeURIComponent(studentUsername)}&courseId=${encodeURIComponent(courseId)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch lessons');
        return res.json();
      })
      .then(data => {
        setLessons(Array.isArray(data.lessons) ? data.lessons : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [studentUsername, courseId]);

  useEffect(() => {
    if (!studentUsername) return;
    setProfileLoading(true);
    setProfileError(null);
    fetch(`http://localhost:5000/GetStudentProfile?username=${encodeURIComponent(studentUsername)}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch student profile');
        return res.json();
      })
      .then(profile => {
        setStudentProfile(profile);
        let foundEnrollment = null;
        if (Array.isArray(profile.enrollments)) {
          foundEnrollment = profile.enrollments.find(e => {
            if (courseId && e.course_id) return String(e.course_id) === String(courseId);
            if (courseName && e.course_name) return e.course_name === courseName;
            return false;
          }) || profile.enrollments[0];
        }
        setCourseInfo({
          courseName: foundEnrollment?.course_name || '',
          teacherName: foundEnrollment?.teacher_name || '',
          teacherUsername: foundEnrollment?.teacher_username || '',
        });
        setProfileLoading(false);
      })
      .catch(err => {
        setProfileError(err.message);
        setProfileLoading(false);
      });
  }, [studentUsername, courseId, courseName]);

  const handleLessonClick = (lesson) => {
    // Extract Surah Name and Ruku Number from title
    const title = lesson.title || "";
    const surahMatch = title.match(/^([^(]+)\s*\(Ruku\s*(\d+)\)/i);
    let surahName, rukuId;

    if (surahMatch) {
      surahName = surahMatch[1].trim();
      rukuId = parseInt(surahMatch[2]);
    }

    // Fallbacks if parsing fails
    if (!surahName) surahName = "Al-Fatiha";
    if (!rukuId) rukuId = 1;

    const lessonId = lesson.lessonId;

    // Build query params for QuranbyLessons
    const queryParams = new URLSearchParams({
      courseId: courseId,
      surah_name: surahName,
      ruku_id: rukuId,
      lesson_id: lessonId,
      student_username: studentUsername,
      teacher_username: courseInfo.teacherUsername || '',
    }).toString();

    navigate(`/parent/${username}/quran-lesson?${queryParams}`);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleSectionChange = (section) => setActiveSection(section);

  const userInfo = {
    name: username,
    role: role,
    avatar: "/placeholder.svg",
  };

  if (loading) return <div className="loading">Loading lessons...</div>;
  if (error) return <div className="error">{error}</div>;

  if (profileLoading) return <div className="loading">Loading student profile...</div>;
  if (profileError) return <div className="error">{profileError}</div>;

  return (
    <div className="dashboard-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userInfo={userInfo}
        unreadNotifications={2}
      />

      <div className="main-content">
        <div className="top-bar">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <span>☰</span>
          </button>
          <div className="page-title">
            <h1>Lesson Progress</h1>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="info-card" style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            padding: 24,
            marginBottom: 24,
            width: 900,
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: '#4a5c2c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                {studentProfile?.name ? studentProfile.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <h2 style={{ margin: 0, color: '#2d4a2d', fontSize: '1.4rem' }}>
                  {studentProfile?.name || studentUsername}
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                  Course: {courseInfo.courseName || '-'}
                </p>
                <p style={{ margin: '2px 0 0 0', color: '#666' }}>
                  Teacher: {courseInfo.teacherName || '-'}
                </p>
              </div>
            </div>
            <button
              className="back-btn"
              onClick={() => navigate(-1)}
              style={{
                background: '#4a5c2c',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              ← Back to Students
            </button>
          </div>

          <div className="lessons-section" style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
            padding: 24
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#2d4a2d', fontSize: '1.2rem' }}>
              Lessons ({lessons.length})
            </h3>

            {lessons.length === 0 ? (
              <div style={{ color: '#888', textAlign: 'center', padding: '40px 20px' }}>
                No lessons found for this course.
              </div>
            ) : (
              <div className="lessons-grid" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {lessons.map((lesson, idx) => (
                  <div
                    key={lesson.lessonId || idx}
                    className={`lesson-card ${lesson.completed ? "completed" : "pending"}`}
                    onClick={() => handleLessonClick(lesson)}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 12,
                      padding: 16,
                      background: lesson.completed ? '#f6f9f2' : '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderLeft: lesson.completed ? '4px solid #4a5c2c' : '4px solid #b6e2b6'
                    }}
                  >
                    <div className="lesson-content">
                      <div className="lesson-title" style={{
                        fontWeight: 600,
                        color: '#2d4a2d',
                        marginBottom: 4
                      }}>
                        {lesson.title}
                      </div>
                      <div className="lesson-hint" style={{
                        fontSize: '0.85rem',
                        color: '#666',
                        fontStyle: 'italic'
                      }}>
                        Click to open lesson
                      </div>
                    </div>
                    <div className="lesson-status">
                      {lesson.completed ? (
                        <span style={{
                          color: '#4a5c2c',
                          fontWeight: 600,
                          fontSize: '0.9rem'
                        }}>
                          Completed
                        </span>
                      ) : (
                        <span style={{
                          color: '#b77c2a',
                          fontWeight: 500,
                          fontSize: '0.9rem'
                        }}>
                          Not Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildrenProgressDetail;
