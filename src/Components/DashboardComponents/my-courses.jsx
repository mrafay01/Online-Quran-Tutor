"use client";

import Sidebar from "./Sidebar";
import AvatarImg from './../Assets/Images/boy-avatar.png';
import { useState } from "react";
import {
  Book,
  Bell,
  Calendar,
  Clock,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
  X,
  Award,
  BookOpen,
  BarChart2,
  Play,
  Download,
  Star,
  Search,
} from "lucide-react";
import './dashboard.css';

// Mock data for courses
const mockCourses = [
  {
    id: 1,
    title: "Nazra - Quran Recitation Basics",
    teacher: "Sheikh Mahmoud",
    progress: 60,
    lessons: 16,
    completed: 9,
    duration: "8 weeks",
    level: "Beginner",
    rating: 4.8,
    image: "/placeholder.svg?height=200&width=300",
    description:
      "Learn the fundamentals of Quran recitation with proper pronunciation.",
    nextLesson: "Lesson 10: Madd Rules",
    category: "Recitation",
  },
  {
    id: 2,
    title: "Tajweed - Rules Mastery",
    teacher: "Sheikh Abdullah",
    progress: 40,
    lessons: 20,
    completed: 8,
    duration: "12 weeks",
    level: "Intermediate",
    rating: 4.9,
    image: "/placeholder.svg?height=200&width=300",
    description:
      "Master advanced Tajweed rules for beautiful and correct Quran recitation.",
    nextLesson: "Lesson 9: Qalqalah Rules",
    category: "Tajweed",
  },
  {
    id: 3,
    title: "Hifz- Memorization Quran Surahs",
    teacher: "Hafiz Shoaib",
    progress: 10,
    lessons: 153,
    completed: 19,
    duration: "18 weeks",
    level: "Advanced",
    rating: 4.7,
    image: "/placeholder.svg?height=200&width=300",
    description:
      "Effective techniques and strategies for memorizing the Holy Quran.",
    nextLesson: "Lesson 3: Memory Palace Method",
    category: "Hifz",
  },
  //   {
  //     id: 4,
  //     title: "Arabic Grammar for Quran",
  //     teacher: "Sheikh Omar",
  //     progress: 60,
  //     lessons: 15,
  //     completed: 9,
  //     duration: "10 weeks",
  //     level: "Advanced",
  //     rating: 4.6,
  //     image: "/placeholder.svg?height=200&width=300",
  //     description: "Understand Quranic Arabic grammar to deepen your comprehension.",
  //     nextLesson: "Lesson 10: Verb Conjugations",
  //     category: "Arabic",
  //   },
];

const mockUser = {
  name: "Ahmad Hassan",
  role: "Student",
  avatar: AvatarImg,
};

const MyCoursesPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("courses");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Here you can add navigation logic or routing
    console.log(`Navigating to: ${section}`);
  };

  const filteredCourses = mockCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === "All" || course.level === filterLevel;
    const matchesCategory =
      filterCategory === "All" || course.category === filterCategory;

    return matchesSearch && matchesLevel && matchesCategory;
  });

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
            <h1>My Courses</h1>
            <p className="page-subtitle">
              Continue your Quranic learning journey
            </p>
          </div>
        </div>

        <div className="courses-content">
          {/* Filters and Search */}
          <div className="courses-filters">
            <div className="search-bar">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-controls">
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Categories</option>
                <option value="Recitation">Recitation</option>
                <option value="Tajweed">Tajweed</option>
                <option value="Memorization">Memorization</option>
                <option value="Arabic">Arabic</option>
              </select>
            </div>
          </div>

          {/* Course Stats */}
          <div className="course-stats">
            <div className="stat-card">
              <div className="stat-number">{mockCourses.length}</div>
              <div className="stat-label">Total Courses</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {mockCourses.filter((c) => c.progress > 0).length}
              </div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {mockCourses.filter((c) => c.progress === 100).length}
              </div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {mockCourses.reduce((acc, course) => acc + course.completed, 0)}
              </div>
              <div className="stat-label">Lessons Completed</div>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="courses-grid-detailed">
            {filteredCourses.map((course) => (
              <div className="course-card-detailed" key={course.id}>
                {/* <div className="course-image">
                  <img src={course.image || "/placeholder.svg"} alt={course.title} />
                  <div className="course-level">{course.level}</div>
                </div> */}
                <div className="course-content">
                  <div className="course-header">
                    <h3>{course.title}</h3>
                    <div className="course-rating">
                      <Star size={16} fill="currentColor" />
                      <span>{course.rating}</span>
                    </div>
                  </div>
                  <p className="course-teacher">
                    <User size={14} /> {course.teacher}
                  </p>
                  <p className="course-description">{course.description}</p>

                  <div className="course-meta">
                    <span className="course-duration">
                      <Clock size={14} /> {course.duration}
                    </span>
                    <span className="course-lessons">
                      <BookOpen size={14} /> {course.lessons} lessons
                    </span>
                  </div>

                  <div className="course-progress">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-details">
                      {course.completed}/{course.lessons} lessons completed
                    </div>
                  </div>

                  {course.progress > 0 && course.progress < 100 && (
                    <div className="next-lesson">
                      <strong>Next:</strong> {course.nextLesson}
                    </div>
                  )}

                  {/* <div className="course-actions">
                    {course.progress === 0 ? (
                      <button className="start-btn">
                        <Play size={16} />
                        Start Course
                      </button>
                    ) : course.progress === 100 ? (
                      <button className="review-btn">
                        <Award size={16} />
                        Review Course
                      </button>
                    ) : (
                      <button className="continue-btn">
                        <Play size={16} />
                        Continue Learning
                      </button>
                    )}
                    <button className="download-btn">
                      <Download size={16} />
                      Materials
                    </button>
                  </div> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCoursesPage;
