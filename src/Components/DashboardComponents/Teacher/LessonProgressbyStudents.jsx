import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../Sidebar';
import '../dashboard.css';

const LessonProgressbyStudents = () => {
  const { username, role } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get student and course parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const studentUsername = searchParams.get('student_username');
  const courseId = searchParams.get('course_id');
  const studentName = searchParams.get('student_name');
  const courseName = searchParams.get('course_name');

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('my-students');

  useEffect(() => {
    if (!studentUsername || !courseId) {
      setError('Missing required parameters: student_username and course_id');
      setLoading(false);
      return;
    }
    fetchLessons();
  }, [studentUsername, courseId]);

  const fetchLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/GetCourseLessons?username=${encodeURIComponent(studentUsername)}&courseId=${encodeURIComponent(courseId)}`);
      if (!response.ok) throw new Error('Failed to fetch lessons');
      const data = await response.json();
      setLessons(Array.isArray(data.lessons) ? data.lessons : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

    // Navigate to Quran by Lessons page with student_username parameter
    const queryParams = new URLSearchParams({
      courseId: courseId,  
      surah_name: surahName,
      ruku_id: rukuId,
      lesson_id: lessonId,
      student_username: studentUsername, // Important: pass student_username for teacher view
    }).toString();

    navigate(`/${role}/${username}/quran-lesson?${queryParams}`);
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
            <p className="page-subtitle">
              {studentName} - {courseName}
            </p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Student and Course Info */}
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
                {studentName ? studentName.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <h2 style={{ margin: 0, color: '#2d4a2d', fontSize: '1.4rem' }}>
                  {studentName || studentUsername}
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#666' }}>
                  Course: {courseName}
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

          {/* Lessons List */}
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
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
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

export default LessonProgressbyStudents;
