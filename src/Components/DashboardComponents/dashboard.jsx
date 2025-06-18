"use client";
import { useParams } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import AvatarImg from "../Assets/Images/boy-avatar.png";
import { useState, useEffect } from "react";
import {
  Bell,
  Book,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  User,
  X,
  Award,
  BookOpen,
  BarChart2,
} from "lucide-react";
import "./dashboard.css";

// Mock data for the dashboard
const mockUser = {
  name: "Ahmad Hassan",
  role: "Student",
  avatar: AvatarImg,
};

const mockProgress = [
  { id: 1, course: "Nazra", completion: 60, lastSession: "Yesterday" },
  { id: 2, course: "Tajweed", completion: 40, lastSession: "2 days ago" },
  { id: 3, course: "Hifz", completion: 15, lastSession: "Today" },
];

const mockSlots = [
  {
    id: 1,
    day: "Today",
    time: "16:30",
    duration: "30 min",
    teacher: "Sheikh Abdullah",
    topic: "Tajweed",
  },
  {
    id: 2,
    day: "Tomorrow",
    time: "17:00",
    duration: "30 min",
    teacher: "Sheikh Mahmoud",
    topic: "Nazra",
  },
  {
    id: 3,
    day: "Wed, Jun 5",
    time: "18:00",
    duration: "30 min",
    teacher: "Hafiz Shoaib",
    topic: "Hifz",
  },
];

const mockCourses = [
  {
    id: 1,
    title: "Tajweed - Rules Mastery",
    teacher: "Sheikh Abdullah",
    progress: 40,
    lessons: 20,
    completed: 8,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Nazra - Quran Recitation Basics",
    teacher: "Sheikh Mahmoud",
    progress: 60,
    lessons: 16,
    completed: 9,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Hifz - Memorizing Quran Surahs",
    teacher: "Hafiz Shoaib",
    progress: 15,
    lessons: 153,
    completed: 19,
    image: "/placeholder.svg?height=200&width=300",
  },
];

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleSectionChange = (section) => {
    setActiveSection(section)
    console.log(`Navigating to: ${section}`)
  }

  const formatDate = () => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date().toLocaleDateString("en-US", options);
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        userInfo={mockUser}
        unreadNotifications={5}
      />

      {/* Main Content */}
      <div className="main-content">
        <div className="top-bar">
          <button className="menu-toggle" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <div className="page-title">
            <h1>Dashboard</h1>
            <p className="current-date">{formatDate()}</p>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Progress Section */}
          <section className="dashboard-section progress-section">
            <div className="section-header">
              <h2>My Progress</h2>
              <a
                href="#"
                className="view-all"
                onClick={() => setActiveSection("progress")}
              >
                View All <ChevronRight size={16} />
              </a>
            </div>
            <div className="progress-overview">
              <div className="progress-card overall-progress">
                <div className="progress-circle">
                  <svg width="120" height="120" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#e6e6e6"
                      strokeWidth="12"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="#5c724a"
                      strokeWidth="12"
                      strokeDasharray="339.3"
                      strokeDashoffset="160" // 25% progress (339.3 * 0.25)
                      transform="rotate(-90 60 60)"
                    />
                  </svg>
                  <div className="progress-percentage">54%</div>
                </div>
                <div className="progress-info">
                  <h3>Overall Progress</h3>
                  <p>Keep up the good work!</p>
                </div>
              </div>
              <div className="progress-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <Award size={24} />
                  </div>
                  <div className="stat-info">
                    <h4>3 Courses</h4>
                    <p>In Progress</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <Clock size={24} />
                  </div>
                  <div className="stat-info">
                    <h4>16 Hours</h4>
                    <p>Total Learning</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <BookOpen size={24} />
                  </div>
                  <div className="stat-info">
                    <h4>36 Lessons</h4>
                    <p>Completed</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="progress-details">
              <h3>Course Progress</h3>
              <div className="progress-list">
                {mockProgress.map((item) => (
                  <div className="progress-item" key={item.id}>
                    <div className="progress-item-info">
                      <h4>{item.course}</h4>
                      <p>Last session: {item.lastSession}</p>
                    </div>
                    <div className="progress-bar-container">
                      <span className="item-percentage">
                        {item.completion}%
                      </span>
                      <div
                        className="progress-bar"
                        style={{ width: `${item.completion}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Upcoming Slots Section */}
          <section className="dashboard-section upcoming-slots-section">
            <div className="section-header">
              <h2>Upcoming Sessions</h2>
              <a
                href="#"
                className="view-all"
                onClick={() => setActiveSection("schedule")}
              >
                View All <ChevronRight size={16} />
              </a>
            </div>
            <div className="slots-list">
              {mockSlots.map((slot) => (
                <div className="slot-card" key={slot.id}>
                  <div className="slot-details">
                    <h3>{slot.topic}</h3>
                    <p className="teacher">
                      <User size={14} /> {slot.teacher}
                    </p>
                    <p className="duration">
                      <Clock size={14} /> {slot.duration}
                    </p>
                  </div>
                  <div className="slot-time">
                    <div className="day">{slot.day}</div>
                    <div className="time">{slot.time}</div>
                  </div>
                  {/* <div className="slot-actions">
                    <button className="join-btn">Join</button>
                    <button className="reschedule-btn">Reschedule</button>
                  </div> */}
                </div>
              ))}
            </div>
          </section>

          {/* Enrolled Courses Section */}
          <section className="dashboard-section enrolled-courses-section">
            <div className="section-header">
              <h2>Enrolled Courses</h2>
              <a
                href="#"
                className="view-all"
                onClick={() => setActiveSection("courses")}
              >
                View All <ChevronRight size={16} />
              </a>
            </div>
            <div className="enrolled-courses-grid">
              {mockCourses.map((course) => (
                <div className="course-card" key={course.id}>
                  {/* <div className="course-image">
                    <img src={course.image || "/placeholder.svg"} alt={course.title} />
                  </div> */}
                  <div className="course-content">
                    <h3>{course.title}</h3>
                    <p className="teacher">
                      <User size={14} /> {course.teacher}
                    </p>
                    <div className="course-progress">
                      <div className="progress-text">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <div className="lessons-count">
                        <BookOpen size={14} /> {course.completed}/
                        {course.lessons} lessons
                      </div>
                    </div>
                    <button className="continue-btn">Continue Learning</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
