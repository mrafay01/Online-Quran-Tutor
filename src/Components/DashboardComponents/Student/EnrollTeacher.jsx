import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Sidebar from '../Sidebar';
import { Menu, User, Star, Globe, BookOpen } from "lucide-react";
import '../dashboard.css';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const EnrollTeacher = () => {
  const { student_username } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("enroll-teacher");
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const query = useQuery();
  const selectedCourse = query.get("course");
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const courseId = queryParams.get("courseId");

  useEffect(() => {
    fetch("http://localhost:5000/GetAllTeachers")
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((tutor, idx) => ({
          id: tutor.id || tutor.cnic || idx,
          username: tutor.username || tutor.id || tutor.cnic || `teacher${idx}`,
          name: tutor.name || `Teacher ${idx + 1}`,
          location: tutor.region || "Unknown",
          rating: tutor.ratings || 5,
          canTeach: ["Nazra", "Hifz", "Tajweed", "Qiraat"],
          bio: tutor.bio || "No bio provided.",
          languages: tutor.languages ? tutor.languages.split(',').map(l => l.trim()) : ["Arabic", "Urdu", "English"],
          gender: tutor.gender === "M" ? "Male" : tutor.gender === "F" ? "Female" : "N/A",
          age: tutor.dob ? (new Date().getFullYear() - new Date(tutor.dob).getFullYear()) : "N/A",
          hourlyRate: tutor.hourly_rate ? `Rs. ${tutor.hourly_rate}/hr` : "$5.00/hr",
          avatar: tutor.pic || '/static/profile_images/default_avatar.png',
          taught: "20 Students",
          timeZone: tutor.region || "Unknown",
          sect: "Sunni",
          online: true,
        }));
        setTeachers(formatted);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to load teachers");
        setLoading(false);
      });
  }, []);

  // Filter by search term
  let filteredTeachers = teachers.filter(t =>
    t.name && t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter by selected course if present
  if (selectedCourse) {
    filteredTeachers = filteredTeachers.filter(t =>
      Array.isArray(t.canTeach) &&
      t.canTeach.filter(c => typeof c === 'string').map(c => c.toLowerCase()).includes(selectedCourse.toLowerCase())
    );
  }

  // Sidebar user info (dummy for now)
  const userInfo = {
    name: student_username || "Student",
    role: "Student",
    avatar: "/static/profile_images/default_avatar.png"
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleSectionChange = (section) => setActiveSection(section);

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
            <h1>Available Teachers</h1>
            {selectedCourse && <p className="page-subtitle">Filtered by course: <b>{selectedCourse}</b></p>}
          </div>
        </div>
        <div className="dashboard-content">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <input
              type="text"
              placeholder="Search teachers by name..."
              className="search-bar"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ maxWidth: 350 }}
            />
          </div>
          {loading && <div className="loading">Loading teachers...</div>}
          {error && <div className="error">{error}</div>}
          <div className="teachers-grid">
            {filteredTeachers.map(teacher => (
              <div key={teacher.id} className="teacher-card">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                  <img src={teacher.avatar} alt={teacher.name} className="teacher-avatar" />
                  <div>
                    <h2>{teacher.name}</h2>
                    <div className="teacher-location">{teacher.location}</div>
                  </div>
                </div>
                <div className="teacher-bio">{teacher.bio}</div>
                <div className="teacher-info-row">
                  <span><User size={14} /> {teacher.gender}</span>
                  <span><BookOpen size={14} /> {teacher.canTeach.join(', ')}</span>
                  <span><Globe size={14} /> {teacher.languages.join(', ')}</span>
                </div>
                <div className="teacher-meta">Age: {teacher.age} &nbsp; | &nbsp; Hourly: {teacher.hourlyRate}</div>
                <div className="teacher-rating-row">
                  <span className="teacher-rating-stars">{'★'.repeat(Math.round(teacher.rating))}</span>
                  <span className="teacher-rating-value">{teacher.rating} / 5</span>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/student/${student_username}/teacher/${teacher.username}?courseId=${courseId}`)}
                >
                  Hire
                </button>
              </div>
            ))}
            {filteredTeachers.length === 0 && !loading && (
              <div>No teachers found for this course.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollTeacher; 