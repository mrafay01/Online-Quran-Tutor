import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import {
  User,
  Star,
  Globe,
  BookOpen,
  ArrowLeft,
  Award,
  Briefcase,
} from "lucide-react";
import defaultAvatar from "../../Assets/Images/male-avatar.jpg";
import "./TeacherDetailStyle.css";
import "../../ScheduleComponents/ScheduleContent.css";

const TeacherDetail = () => {
  const { student_username, teacher_username } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hiring, setHiring] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const courseId = queryParams.get("courseId");

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const fullToShortDay = {
    Monday: "Mon",
    Tuesday: "Tue",
    Wednesday: "Wed",
    Thursday: "Thu",
    Friday: "Fri",
    Saturday: "Sat",
    Sunday: "Sun",
  };

  const shortToFullDay = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday"
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`http://localhost:5000/GetTeacherCompleteData?username=${teacher_username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch teacher data");
        return res.json();
      })
      .then((data) => {
        setTeacher(data);
        setSchedule(Array.isArray(data.schedule) ? data.schedule : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [teacher_username]);

  const toggleSlot = (slot) => {
    const normalizedSlot = {
      day: slot.day.slice(0, 3), // normalize to Mon, Tue, etc.
      hour: Number(slot.hour),
    };

    setSelectedSlots((prev) =>
      prev.some((s) => s.day === normalizedSlot.day && s.hour === normalizedSlot.hour)
        ? prev.filter((s) => !(s.day === normalizedSlot.day && s.hour === normalizedSlot.hour))
        : [...prev, normalizedSlot]
    );
  };

  const handleHire = () => {

    const selectedSlotIds = selectedSlots.map(slot => {
      // ... your mapping logic ...
    }).filter(Boolean);

    console.log('POST body:', {
      teacherId: teacher.id,
      courseId: courseId,
      selectedSchedule: selectedSlotIds
    });

    // Now use courseId in your POST body
    fetch(`http://localhost:5000/api/students/${student_username}/hire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: teacher.id,
        courseId: courseId,
        selectedSchedule: selectedSlotIds
      })
    })
    // ...rest of your code
  };
  

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const hours = Array.from({ length: 24 }, (_, i) => i); // 0–23

  return (
    <div className="dashboard-container">
      <Sidebar userInfo={null} />
      <div className="main-content">
        <div className="top-bar">
          <button className="menu-toggle" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft size={24} />
          </button>
          <div className="page-title">
            <h1>Teacher Details</h1>
          </div>
        </div>
        <div className="dashboard-content">
          <button
            className="btn btn-secondary"
            style={{ marginBottom: 16 }}
            onClick={() => navigate(`/student/${student_username}/enroll-teacher`)}
          >
            ← Back to Teachers
          </button>

          {loading && (
            <div className="max-teacher-card skeleton-card" style={{ maxWidth: 600, margin: "0 auto", marginTop: 32 }}>
              <div className="skeleton-avatar" />
              <div className="skeleton-line" style={{ width: "60%" }} />
              <div className="skeleton-line" style={{ width: "40%" }} />
              <div className="skeleton-line" style={{ width: "80%" }} />
              <div className="skeleton-line" style={{ width: "50%" }} />
            </div>
          )}

          {error && <div className="error">{error}</div>}

          {teacher && (
            <div className="max-teacher-card max-teacher-detail-card">
              <div className="max-teacher-detail-header">
                <img
                  src={teacher.avatar || defaultAvatar}
                  alt={teacher.name || "Teacher"}
                  className="teacher-avatar max-teacher-detail-avatar"
                />
                <div className="max-teacher-detail-info">
                  <h2>{teacher.name || "N/A"}</h2>
                  <div className="teacher-location">{teacher.location || "Unknown"}</div>
                  <div className="teacher-meta">
                    Age: {teacher.age || "N/A"} &nbsp; | &nbsp; Hourly: {teacher.hourlyRate || "N/A"}
                  </div>
                  <div className="teacher-rating-row">
                    <span className="teacher-rating-stars">{"★".repeat(Math.round(teacher.rating || 0))}</span>
                    <span className="teacher-rating-value">
                      {teacher.rating ? `${teacher.rating} / 5` : "No ratings yet"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="teacher-bio">
                {teacher.bio || <span className="teacher-bio-fallback">No bio provided.</span>}
              </div>

              <div className="teacher-info-row">
                <span>
                  <User size={14} /> {teacher.gender || "N/A"}
                </span>
                <span>
                  <BookOpen size={14} />{" "}
                  {Array.isArray(teacher.canTeach) ? teacher.canTeach.join(", ") : teacher.canTeach || "N/A"}
                </span>
                <span>
                  <Globe size={14} />{" "}
                  {Array.isArray(teacher.languages) ? teacher.languages.join(", ") : teacher.languages || "N/A"}
                </span>
              </div>

              {(teacher.qualification || teacher.experience) && (
                <div className="teacher-extra-info">
                  {teacher.qualification && (
                    <div className="teacher-qualification">
                      <Award size={16} /> Qualification: {teacher.qualification}
                    </div>
                  )}
                  {teacher.experience && (
                    <div className="teacher-experience">
                      <Briefcase size={16} /> Experience: {teacher.experience}
                    </div>
                  )}
                </div>
              )}

              <h3 style={{ marginTop: 32 }}>Select Weekly Schedule (1 hour slots, 24-hour format)</h3>
              <div className="schedule-table">
                <div className="schedule-header">
                  <div className="schedule-cell schedule-time-header">Time</div>
                  {days.map((day) => (
                    <div key={day} className="schedule-cell schedule-day-header">
                      {day}
                    </div>
                  ))}
                </div>
                {hours.map((hour) => (
                  <div className="schedule-row" key={hour}>
                    <div className="schedule-cell schedule-time">
                      {`${hour.toString().padStart(2, "0")}:00 - ${(hour + 1).toString().padStart(2, "0")}:00`}
                    </div>
                    {days.map((day) => {
                      const slot = { day, hour };
                      const isDisabled = schedule.some(
                        (s) => s.day.slice(0, 3) === day && s.hour === hour && s.isBooked
                      );
                      const isSelected = selectedSlots.some((s) => s.day === day && s.hour === hour);
                      return (
                        <div className="schedule-cell" key={day + hour}>
                          <input
                            type="checkbox"
                            className={`schedule-checkbox${isSelected ? " selected" : ""}`}
                            checked={isSelected}
                            disabled={isDisabled}
                            onChange={() => toggleSlot(slot)}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24, textAlign: "right" }}>
                <button
                  className="btn btn-primary"
                  onClick={openModal}
                  disabled={hiring || selectedSlots.length === 0}
                >
                  {hiring ? "Hiring..." : "Hire Teacher"}
                </button>
              </div>

              {showModal && (
                <div className="modal-overlay">
                  <div className="modal-box">
                    <h3>Confirm Hire</h3>
                    <p>
                      Are you sure you want to hire <b>{teacher.name}</b> with the selected schedule?
                    </p>
                    <ul>
                      {selectedSlots.map((slot) => (
                        <li key={`${slot.day}-${slot.hour}`}>
                          {slot.day} {slot.hour.toString().padStart(2, "0")}:00 -{" "}
                          {(slot.hour + 1).toString().padStart(2, "0")}:00
                        </li>
                      ))}
                    </ul>
                    <div className="modal-actions">
                      <button className="btn btn-primary" onClick={handleHire} disabled={hiring}>
                        {hiring ? "Hiring..." : "Yes, Hire"}
                      </button>
                      <button className="btn btn-secondary" onClick={closeModal} disabled={hiring}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDetail;
