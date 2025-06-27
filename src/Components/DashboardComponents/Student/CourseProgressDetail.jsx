import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import "./studentprogress.css";

const CourseProgressDetail = () => {
  const { username, courseId, role } = useParams();
  const [lessons, setLessons] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('progress');
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const handleSectionChange = (section) => setActiveSection(section);

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
        setLessons(Array.isArray(data.lessons) ? data.lessons : []);
        setCourseName(data.courseName || "");
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [username, courseId]);

  const userInfo = {
    name: username,
    role: role,
    avatar: "/placeholder.svg",
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
            >
              <div className="lesson-title">{lesson.title}</div>
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
