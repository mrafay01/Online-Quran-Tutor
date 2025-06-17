"use client";

import Sidebar from "./Sidebar";
import AvatarImg from "../Assets/Images/boy-avatar.png";
import { useState } from "react";
import {
  Bell,
  Book,
  Calendar,
  Clock,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
  X,
  BarChart2,
  Edit,
  Camera,
  Save,
  Mail,
  Phone,
  MapPin,
  Award,
  Star,
  BookOpen,
} from "lucide-react";
import "./dashboard.css";

const ProfilePage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: "Ahmad",
    lastName: "Hassan",
    email: "ahmad.hassan@email.com",
    phone: "+92 300 1234567",
    address: "Lahore, Pakistan",
    dateOfBirth: "1995-06-15",
    role: "Student",
    joinDate: "2024-01-15",
    bio: "Passionate about learning the Holy Quran and improving my recitation skills. Currently focusing on Tajweed rules and memorization techniques.",
    avatar: "/placeholder.svg?height=150&width=150",
  });
  const mockUser = {
    name: "Ahmad Hassan",
    role: "Student",
    avatar: AvatarImg,
  };

  // Stats data
  const profileStats = {
    coursesCompleted: 3,
    totalHours: 48,
    currentStreak: 12,
    averageScore: 87,
    certificates: 2,
    rank: "Intermediate",
  };

  // Recent achievements
  const recentAchievements = [
    {
      id: 1,
      title: "Surah Master",
      description: "Completed Al-Fatiha",
      date: "2024-05-20",
    },
    {
      id: 2,
      title: "Consistent Learner",
      description: "7-day streak",
      date: "2024-05-15",
    },
    {
      id: 3,
      title: "First Steps",
      description: "First lesson completed",
      date: "2024-05-01",
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    // Here you can add navigation logic or routing
    console.log(`Navigating to: ${section}`);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    // Here you would typically save to backend
    console.log("Saving profile:", profileData);
    setIsEditing(false);
    alert("Profile updated successfully!");
  };

  const handleCancel = () => {
    // Reset to original data or fetch from backend
    setIsEditing(false);
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
            <h1>My Profile</h1>
            <p className="page-subtitle">Manage your account information</p>
          </div>
        </div>

        <div className="profile-content">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="profile-avatar-section">
              <div className="profile-avatar-container">
                <img
                  src={AvatarImg}
                  alt="Profile"
                  className="profile-avatar"
                />
                <button className="avatar-edit-btn">
                  <Camera size={16} />
                </button>
              </div>
              <div className="profile-basic-info">
                <h2>
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="profile-role">{profileData.role}</p>
                <p className="profile-join-date">
                  Member since{" "}
                  {new Date(profileData.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="profile-actions">
              {!isEditing ? (
                <button
                  className="edit-profile-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSave}>
                    <Save size={16} />
                    Save
                  </button>
                  <button className="cancel-btn" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Stats */}
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <BookOpen size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">
                  {profileStats.coursesCompleted}
                </div>
                <div className="stat-label">Courses Completed</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Clock size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{profileStats.totalHours}</div>
                <div className="stat-label">Total Hours</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Award size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{profileStats.currentStreak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <Star size={24} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{profileStats.averageScore}%</div>
                <div className="stat-label">Average Score</div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="profile-details">
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        className="profile-input"
                      />
                    ) : (
                      <div className="profile-value">
                        {profileData.firstName}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        className="profile-input"
                      />
                    ) : (
                      <div className="profile-value">
                        {profileData.lastName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <Mail size={16} />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="profile-input"
                      />
                    ) : (
                      <div className="profile-value">{profileData.email}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>
                      <Phone size={16} />
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className="profile-input"
                      />
                    ) : (
                      <div className="profile-value">{profileData.phone}</div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <MapPin size={16} />
                      Address
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        className="profile-input"
                      />
                    ) : (
                      <div className="profile-value">{profileData.address}</div>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={profileData.dateOfBirth}
                        onChange={handleInputChange}
                        className="profile-input"
                      />
                    ) : (
                      <div className="profile-value">
                        {new Date(profileData.dateOfBirth).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      className="profile-textarea"
                      rows="4"
                    />
                  ) : (
                    <div className="profile-value">{profileData.bio}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="profile-section">
              <h3>Recent Achievements</h3>
              <div className="achievements-list">
                {recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="achievement-item">
                    <div className="achievement-icon">
                      <Award size={20} />
                    </div>
                    <div className="achievement-info">
                      <h4>{achievement.title}</h4>
                      <p>{achievement.description}</p>
                      <span className="achievement-date">
                        {new Date(achievement.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
