"use client";

import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Sidebar from "../Sidebar";
import {
  Menu,
  BookOpen,
  CheckCircle,
  Clock,
  Play,
  Award,
  TrendingUp,
  Calendar,
  Target,
  Download,
} from "lucide-react";
import "../dashboard.css";
import "../Student/studentprogress.css";

const StudentProgress = () => {
  const { username, role } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("progress");
  const [progressData, setProgressData] = useState({
    progress: [],
    overallStats: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("all");

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setError(null);
    fetch(
      `http://localhost:5000/GetStudentProgress?username=${encodeURIComponent(
        username
      )}`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch progress");
        return res.json();
      })
      .then((data) => {
        setProgressData({
          progress: Array.isArray(data.progress) ? data.progress : [],
          overallStats: data.overallStats || {},
          achievements: data.achievements || [],
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleSectionChange = (section) => setActiveSection(section);

  const getSelectedCourseData = () => {
    if (selectedCourse === "all" || !progressData.progress) return null;
    return progressData.progress.find(
      (course) => course.courseId === Number.parseInt(selectedCourse)
    );
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "var(--success)";
    if (score >= 80) return "var(--warning)";
    return "var(--danger)";
  };

  const userInfo = {
    name: username,
    role: role,
    avatar: "/placeholder.svg",
  };

  const {
    completedLessons = 0,
    totalLessons = 0,
    totalHours = 0,
    averageScore = 0,
    currentStreak = 0,
  } = progressData.overallStats;

  if (loading) return <div className="loading">Loading progress data...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!progressData.progress.length) return <div>No progress data found.</div>;

  const selectedCourseData = getSelectedCourseData();

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
            <Menu size={24} />
          </button>
          <div className="page-title">
            <h1>Progress</h1>
            <p className="page-subtitle">Track your learning journey</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Course Progress Section */}
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Course Progress</h2>
              <select
                className="form-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{ minWidth: "200px" }}
              >
                <option value="all">All Courses Overview</option>
                {progressData.progress.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.courseName}
                  </option>
                ))}
              </select>
            </div>

            {selectedCourse === "all" ? (
              <div className="student-progress-container">
                <h2 className="progress-title">Course Progress</h2>
                <div className="progress-list">
                  {progressData.progress
                    .filter(
                      (course) =>
                        course && course.completedLessons !== undefined
                    )
                    .map((course) => (
                      <Link
                        key={course.courseId}
                        to={`/student/${username}/progress/${course.courseId}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div className="progress-card">
                          <div className="progress-course-name">
                            {course.courseName}
                          </div>
                          <div className="progress-details">
                            <span>Total Lessons: {course.totalLessons}</span>
                            <span>Completed: {course.completedLessons}</span>
                            <span>Progress: {course.progressPercent}%</span>
                          </div>
                          <div className="progress-bar-wrapper">
                            <div className="progress-bar-bg">
                              <div
                                className="progress-bar-fill"
                                style={{ width: `${course.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              </div>
            ) : (
              selectedCourseData && (
                <div>{/* Your detailed progress UI (same as before) */}</div>
              )
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
