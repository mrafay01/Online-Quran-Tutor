import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import "./studentprogress.css";

const CourseProgressDetail = () => {
  const { username, courseId, role } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('progress');
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const handleSectionChange = (section) => setActiveSection(section);
  const [teacherUsername, setTeacherUsername] = useState("");

  useEffect(() => {
    if (!username || !courseId) return;
    setLoading(true);
    setError(null);
    fetch(`http://localhost:5000/GetCourseLessons?username=${encodeURIComponent(username)}&courseId=${encodeURIComponent(courseId)}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch lessons");
        return res.json();
      })
      .then(data => {
        console.log('API Response:', data);
        setLessons(Array.isArray(data.lessons) ? data.lessons : []);
        setCourseName(data.courseName || "");
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [username, courseId]);

  useEffect(() => {
    if (!username || !courseId) return;
    fetch(`http://localhost:5000/GetStudentTeacher?username=${encodeURIComponent(username)}&courseId=${encodeURIComponent(courseId)}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch student teacher");
        return res.json();
      })
      .then(data => {
        if (data.teacher && data.teacher.username) {
          setTeacherUsername(data.teacher.username);
        } else {
          setTeacherUsername(""); // fallback if not found
        }
      })
      .catch(err => {
        setTeacherUsername(""); // fallback on error
      });
  }, [username, courseId]);

  const userInfo = {
    name: username,
    role: role,
    avatar: "/placeholder.svg",
  };

  const handleLessonClick = (lesson) => {
    if (!teacherUsername) {
      alert("Please wait, loading teacher information...");
      return;
    }
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

    // Build query params and navigate
    const queryParams = new URLSearchParams({
      teacher_username: teacherUsername,
      courseId: courseId,
      surah_name: surahName,
      ruku_id: rukuId,
      lesson_id: lessonId,
    }).toString();

    // Log the full URL for debugging
    console.log(`Navigating to: /${role}/${username}/quran-lesson?${queryParams}`);

    navigate(`/${role}/${username}/quran-lesson?${queryParams}`);
  };

  if (loading) return <div>Loading lessons...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!lessons.length) return <div>No lessons found for this course.</div>;

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
        <Link to={-1} className="back-link">← Back to Progress</Link>
        <h2 className="progress-title">{courseName ? `${courseName} - Lessons` : "Course Lessons"}</h2>
        <div className="lessons-list">
          {lessons.map((lesson, idx) => (
            <div
              key={lesson.lessonId || idx}
              className={`lesson-card ${lesson.completed ? "completed" : "pending"}`}
              onClick={() => handleLessonClick(lesson)}
              style={{ cursor: 'pointer' }}
            >
              <div className="lesson-content">
                <div className="lesson-title">{lesson.title}</div>
                <div className="lesson-hint">Click to open lesson</div>
              </div>
              <div className="lesson-status">
                {lesson.completed ? <span className="lesson-completed">Completed</span> : <span className="lesson-pending">Not Completed</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseProgressDetail;
