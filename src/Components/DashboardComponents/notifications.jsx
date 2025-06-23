"use client";

import Sidebar from "./Sidebar";
import {useRef, useEffect, useState } from "react";
import AvatarImg from './../Assets/Images/boy-avatar.png';
import {
  Clock,
  Menu,
  Check,
  Trash2,
  Filter,
  MessageSquare,
  AlertCircle,
  Info,
  CheckCircle,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Bell,
  Book,
} from "lucide-react";
import './dashboard.css';

// Mock data for notifications
const mockNotifications = [
  {
    id: 1,
    type: "reminder",
    title: "Upcoming Session Reminder",
    message:
      "Your Tajweed Rules session with Sheikh Abdullah starts in 1 hour.",
    time: "2024-06-03T15:30:00",
    read: false,
    actionable: true,
    actionText: "Join Session",
    actionLink: "#",
    relatedId: 101,
  },
  {
    id: 2,
    type: "message",
    title: "New Message from Sheikh Mahmoud",
    message:
      "I've reviewed your recitation recording. Great progress on the Madd rules!",
    time: "2024-06-02T14:15:00",
    read: false,
    actionable: true,
    actionText: "View Message",
    actionLink: "#",
    relatedId: 202,
  },
  {
    id: 3,
    type: "course",
    title: "New Lesson Available",
    message:
      "Lesson 10: Madd Rules is now available in your Quran Recitation Basics course.",
    time: "2024-06-02T09:30:00",
    read: true,
    actionable: true,
    actionText: "Start Lesson",
    actionLink: "#",
    relatedId: 303,
  },
  {
    id: 4,
    type: "achievement",
    title: "Achievement Unlocked!",
    message:
      "Congratulations! You've earned the 'Consistent Learner' badge for studying 7 days in a row.",
    time: "2024-06-01T20:45:00",
    read: true,
    actionable: false,
    relatedId: 404,
  },
  {
    id: 5,
    type: "system",
    title: "Account Security",
    message:
      "We've detected a login from a new device. Please verify if this was you.",
    time: "2024-05-31T16:20:00",
    read: false,
    actionable: true,
    actionText: "Review Activity",
    actionLink: "#",
    relatedId: 505,
    urgent: true,
  },
  {
    id: 6,
    type: "reminder",
    title: "Complete Your Profile",
    message:
      "Your profile is 80% complete. Add your learning goals to get personalized recommendations.",
    time: "2024-05-30T11:10:00",
    read: true,
    actionable: true,
    actionText: "Complete Profile",
    actionLink: "#",
    relatedId: 606,
  },
  {
    id: 7,
    type: "course",
    title: "Course Completion",
    message:
      "You've completed 75% of Tajweed Rules Mastery. Keep up the good work!",
    time: "2024-05-29T14:30:00",
    read: true,
    actionable: true,
    actionText: "Continue Course",
    actionLink: "#",
    relatedId: 707,
  },
  {
    id: 8,
    type: "message",
    title: "New Message from Admin",
    message: "Important update about our scheduled maintenance this weekend.",
    time: "2024-05-28T09:15:00",
    read: true,
    actionable: true,
    actionText: "View Message",
    actionLink: "#",
    relatedId: 808,
  },
  {
    id: 9,
    type: "system",
    title: "Payment Successful",
    message: "Your monthly subscription has been renewed successfully.",
    time: "2024-05-27T08:00:00",
    read: true,
    actionable: false,
    relatedId: 909,
  },
  {
    id: 10,
    type: "achievement",
    title: "Achievement Unlocked!",
    message:
      "Congratulations! You've earned the 'Surah Master' badge for completing Al-Fatiha memorization.",
    time: "2024-05-26T19:20:00",
    read: true,
    actionable: false,
    relatedId: 1010,
  },
];

const NotificationsPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("notifications");
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filterType, setFilterType] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [expandedNotification, setExpandedNotification] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    console.log(`Navigating to: ${section}`);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "reminder":
        return <Clock size={20} />;
      case "message":
        return <MessageSquare size={20} />;
      case "course":
        return <Book size={20} />;
      case "achievement":
        return <CheckCircle size={20} />;
      case "system":
        return <AlertCircle size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getNotificationColor = (type, urgent = false) => {
    if (urgent) return "urgent";

    switch (type) {
      case "reminder":
        return "reminder";
      case "message":
        return "message";
      case "course":
        return "course";
      case "achievement":
        return "achievement";
      case "system":
        return "system";
      default:
        return "";
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(
      notifications.filter((notification) => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const toggleExpand = (id) => {
    setExpandedNotification(expandedNotification === id ? null : id);
  };
  const mockUser = {
    name: "Ahmad Hassan",
    role: "Student",
    avatar: AvatarImg,
  };
  const filteredNotifications = notifications.filter((notification) => {
    if (showUnreadOnly && notification.read) return false;
    if (filterType !== "all" && notification.type !== filterType) return false;
    return true;
  });

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar Component */}
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
            <h1>Notifications</h1>
            <p className="page-subtitle">
              Stay updated with your learning journey
            </p>
          </div>
        </div>

        <div className="my-notifications-content">
          {/* Notification Controls */}
          <div className="my-notification-controls">
            <div className="my-notification-filters">
              <div className="filter-dropdown" ref={dropdownRef}>
                <button
                  className="filter-btn"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  <Filter size={16} />
                  Filter:{" "}
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  <ChevronDown size={16} />
                </button>

                {isDropdownOpen && (
                  <div className="filter-dropdown-content">
                    <button
                      className={filterType === "all" ? "active" : ""}
                      onClick={() => {
                        setFilterType("all");
                        setIsDropdownOpen(false);
                      }}
                    >
                      All
                    </button>
                    <button
                      className={filterType === "reminder" ? "active" : ""}
                      onClick={() => {
                        setFilterType("reminder");
                        setIsDropdownOpen(false);
                      }}
                    >
                      Reminders
                    </button>
                    <button
                      className={filterType === "message" ? "active" : ""}
                      onClick={() => {
                        setFilterType("message");
                        setIsDropdownOpen(false);
                      }}
                    >
                      Messages
                    </button>
                    <button
                      className={filterType === "course" ? "active" : ""}
                      onClick={() => {
                        setFilterType("course");
                        setIsDropdownOpen(false);
                      }}
                    >
                      Courses
                    </button>
                    <button
                      className={filterType === "achievement" ? "active" : ""}
                      onClick={() => {
                        setFilterType("achievement");
                        setIsDropdownOpen(false);
                      }}
                    >
                      Achievements
                    </button>
                    <button
                      className={filterType === "system" ? "active" : ""}
                      onClick={() => {
                        setFilterType("system");
                        setIsDropdownOpen(false);
                      }}
                    >
                      System
                    </button>
                  </div>
                )}
              </div>

              <label className="unread-toggle">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={() => setShowUnreadOnly(!showUnreadOnly)}
                />
                <span>Show unread only</span>
              </label>
            </div>
            <div className="my-notification-actions">
              <button className="action-btn" onClick={markAllAsRead}>
                <Check size={16} />
                Mark all as read
              </button>
              <button
                className="action-btn danger"
                onClick={clearAllNotifications}
              >
                <Trash2 size={16} />
                Clear all
              </button>
            </div>
          </div>

          {/* Notification Stats */}
          <div className="my-notification-stats">
            <div className="stat-card">
              <div className="stat-number">{notifications.length}</div>
              <div className="stat-label">Total</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{unreadCount}</div>
              <div className="stat-label">Unread</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {
                  notifications.filter(
                    (notification) => notification.type === "reminder"
                  ).length
                }
              </div>
              <div className="stat-label">Reminders</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {
                  notifications.filter(
                    (notification) => notification.type === "message"
                  ).length
                }
              </div>
              <div className="stat-label">Messages</div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="my-notifications-list">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`my-notification-item ${
                    notification.read ? "read" : "unread"
                  } ${getNotificationColor(
                    notification.type,
                    notification.urgent
                  )}`}
                >
                  <div className="my-notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div
                    className="my-notification-content"
                    onClick={() => toggleExpand(notification.id)}
                  >
                    <div className="my-notification-header">
                      <h3>{notification.title}</h3>
                      <span className="my-notification-time">
                        {formatTime(notification.time)}
                      </span>
                    </div>
                    <p
                      className={`notification-message ${
                        expandedNotification === notification.id
                          ? "expanded"
                          : ""
                      }`}
                    >
                      {notification.message}
                    </p>
                    {expandedNotification === notification.id &&
                      notification.actionable && (
                        <a
                          href={notification.actionLink}
                          className="my-notification-action-link"
                        >
                          {notification.actionText}
                        </a>
                      )}
                  </div>
                  <div className="my-notification-actions-menu">
                    <div className="dropdown">
                      <button className="dropdown-btn">
                        <MoreVertical size={16} />
                      </button>
                      <div className="dropdown-content">
                        {!notification.read && (
                          <button onClick={() => markAsRead(notification.id)}>
                            <Check size={14} />
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                    <button
                      className="expand-btn"
                      onClick={() => toggleExpand(notification.id)}
                      aria-label={
                        expandedNotification === notification.id
                          ? "Collapse"
                          : "Expand"
                      }
                    >
                      {expandedNotification === notification.id ? (
                        <ChevronUp size={16} />
                      ) : (
                        <ChevronDown size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-notifications">
                <Bell size={48} />
                <h3>No notifications</h3>
                <p>You're all caught up! Check back later for updates.</p>
              </div>
            )}
          </div>

          {/* Notification Preferences */}
          <div className="my-notification-preferences">
            <h3>Notification Preferences</h3>
            <div className="preferences-grid">
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Session Reminders</h4>
                  <p>Get notified before your scheduled sessions</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked={true} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Course Updates</h4>
                  <p>Notifications about new lessons and materials</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked={true} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Messages</h4>
                  <p>Get notified about new messages</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked={true} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="preference-item">
                <div className="preference-info">
                  <h4>Achievements</h4>
                  <p>Notifications about earned achievements</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked={true} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
