"use client";

import Sidebar from "./Sidebar";
import AvatarImg from "../Assets/Images/boy-avatar.png";
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
  TrendingUp,
  Target,
  CheckCircle,
} from "lucide-react";
import "./dashboard.css";
const mockUser = {
  name: "Ahmad Hassan",
  role: "Student",
  avatar: AvatarImg,
};

// Mock data for detailed progress
const mockDetailedProgress = {
  overall: {
    totalHours: 48,
    sessionsCompleted: 32,
    averageScore: 87,
    streak: 12,
  },
  surahs: [
    {
      name: "Al-Fatiha",
      progress: 100,
      verses: 7,
      memorized: 7,
      lastPracticed: "2 days ago",
    },
    {
      name: "Al-Baqarah",
      progress: 45,
      verses: 286,
      memorized: 129,
      lastPracticed: "Yesterday",
    },
    {
      name: "Al-Imran",
      progress: 20,
      verses: 200,
      memorized: 40,
      lastPracticed: "Today",
    },
    {
      name: "An-Nisa",
      progress: 10,
      verses: 176,
      memorized: 18,
      lastPracticed: "1 week ago",
    },
    {
      name: "Al-Maidah",
      progress: 5,
      verses: 120,
      memorized: 6,
      lastPracticed: "2 weeks ago",
    },
  ],
  weeklyProgress: [
    { week: "Week 1", hours: 8, sessions: 5, score: 85 },
    { week: "Week 2", hours: 10, sessions: 7, score: 88 },
    { week: "Week 3", hours: 12, sessions: 8, score: 90 },
    { week: "Week 4", hours: 9, sessions: 6, score: 87 },
    { week: "Week 5", hours: 9, sessions: 6, score: 89 },
  ],
  achievements: [
    {
      id: 1,
      title: "First Steps",
      description: "Complete your first lesson",
      earned: true,
      date: "2024-05-01",
    },
    {
      id: 2,
      title: "Consistent Learner",
      description: "Study for 7 consecutive days",
      earned: true,
      date: "2024-05-15",
    },
    {
      id: 3,
      title: "Surah Master",
      description: "Complete memorization of Al-Fatiha",
      earned: true,
      date: "2024-05-20",
    },
    {
      id: 4,
      title: "Perfect Score",
      description: "Score 100% in a recitation test",
      earned: false,
      date: null,
    },
    {
      id: 5,
      title: "Monthly Goal",
      description: "Complete 20 hours of study in a month",
      earned: false,
      date: null,
    },
  ],
};

const ProgressPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("progress");
  const [activeTab, setActiveTab] = useState("overview"); // overview, surahs, achievements

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Here you can add navigation logic or routing
    console.log(`Navigating to: ${section}`);
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
            <h1>Progress Tracking</h1>
            <p className="page-subtitle">
              Monitor your Quranic learning journey
            </p>
          </div>
        </div>

        <div className="progress-content">
          {/* Progress Tabs */}
          <div className="progress-tabs">
            <button
              className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <BarChart2 size={16} />
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === "surahs" ? "active" : ""}`}
              onClick={() => setActiveTab("surahs")}
            >
              <BookOpen size={16} />
              Surah Progress
            </button>
            <button
              className={`tab-btn ${
                activeTab === "achievements" ? "active" : ""
              }`}
              onClick={() => setActiveTab("achievements")}
            >
              <Award size={16} />
              Achievements
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="overview-content">
              {/* Key Metrics */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon">
                    <Clock size={24} />
                  </div>
                  <div className="metric-info">
                    <div className="metric-value">
                      {mockDetailedProgress.overall.totalHours}
                    </div>
                    <div className="metric-label">Total Hours</div>
                  </div>
                  <div className="metric-trend">
                    <TrendingUp size={16} />
                    +12% this month
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="metric-info">
                    <div className="metric-value">
                      {mockDetailedProgress.overall.sessionsCompleted}
                    </div>
                    <div className="metric-label">Sessions Completed</div>
                  </div>
                  <div className="metric-trend">
                    <TrendingUp size={16} />
                    +8% this month
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">
                    <Target size={24} />
                  </div>
                  <div className="metric-info">
                    <div className="metric-value">
                      {mockDetailedProgress.overall.averageScore}%
                    </div>
                    <div className="metric-label">Average Score</div>
                  </div>
                  <div className="metric-trend">
                    <TrendingUp size={16} />
                    +5% this month
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon">
                    <Award size={24} />
                  </div>
                  <div className="metric-info">
                    <div className="metric-value">
                      {mockDetailedProgress.overall.streak}
                    </div>
                    <div className="metric-label">Day Streak</div>
                  </div>
                  <div className="metric-trend">
                    <TrendingUp size={16} />
                    Keep it up!
                  </div>
                </div>
              </div>

              {/* Weekly Progress Chart */}
              <div className="chart-section">
                <h3>Weekly Progress</h3>
                <div className="progress-chart">
                  {mockDetailedProgress.weeklyProgress.map((week, index) => (
                    <div key={index} className="chart-bar">
                      <div className="bar-container">
                        <div
                          className="bar"
                          style={{ height: `${(week.hours / 15) * 100}%` }}
                        ></div>
                      </div>
                      <div className="bar-label">{week.week}</div>
                      <div className="bar-value">{week.hours}h</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Surahs Tab */}
          {activeTab === "surahs" && (
            <div className="surahs-content">
              <div className="surahs-header">
                <h3>Surah Memorization Progress</h3>
                <p>Track your progress in memorizing different Surahs</p>
              </div>
              <div className="surahs-list">
                {mockDetailedProgress.surahs.map((surah, index) => (
                  <div key={index} className="surah-card">
                    <div className="surah-info">
                      <h4>{surah.name}</h4>
                      <p>
                        {surah.memorized}/{surah.verses} verses memorized
                      </p>
                      <span className="last-practiced">
                        Last practiced: {surah.lastPracticed}
                      </span>
                    </div>
                    <div className="surah-progress">
                      <div className="progress-circle-small">
                        <svg width="80" height="80" viewBox="0 0 80 80">
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            fill="none"
                            stroke="#e6e6e6"
                            strokeWidth="8"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            fill="none"
                            stroke="#5c724a"
                            strokeWidth="8"
                            strokeDasharray="219.9"
                            strokeDashoffset={
                              219.9 - (219.9 * surah.progress) / 100
                            }
                            transform="rotate(-90 40 40)"
                          />
                        </svg>
                        <div className="progress-percentage-small">
                          {surah.progress}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <div className="achievements-content">
              <div className="achievements-header">
                <h3>Your Achievements</h3>
                <p>Celebrate your learning milestones</p>
              </div>
              <div className="achievements-grid">
                {mockDetailedProgress.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`achievement-card ${
                      achievement.earned ? "earned" : "locked"
                    }`}
                  >
                    <div className="achievement-icon">
                      <Award size={32} />
                    </div>
                    <div className="achievement-info">
                      <h4>{achievement.title}</h4>
                      <p>{achievement.description}</p>
                      {achievement.earned && achievement.date && (
                        <span className="achievement-date">
                          Earned on{" "}
                          {new Date(achievement.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {achievement.earned && (
                      <div className="achievement-badge">
                        <CheckCircle size={20} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
