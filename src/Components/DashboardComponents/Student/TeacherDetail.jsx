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
// import "../../ScheduleComponents/ScheduleContent.css";
import { DateTime } from "luxon";

const TeacherDetail = () => {
  const { student_username, teacher_username } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hiring, setHiring] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [successModal, setSuccessModal] = useState(false);
  const [studentRegion, setStudentRegion] = useState("");

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
        console.log('Fetched teacher data:', data);
        setTeacher(data);
        setSchedule(Array.isArray(data.schedule) ? data.schedule : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [teacher_username]);

  useEffect(() => {
    if (!student_username) return;
    fetch(`http://localhost:5000/GetStudentCourses?username=${student_username}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.courses)) {
          setEnrolledCourses(data.courses.map(c => String(c.id || c.courseId)));
        }
      })
      .catch(err => {
        setEnrolledCourses([]);
      });
  }, [student_username]);

  useEffect(() => {
    if (!student_username) return;
    fetch(`http://localhost:5000/api/get_user_region?role=student&username=${student_username}`)
      .then(res => res.json())
      .then(data => {
        setStudentRegion(data.region || Intl.DateTimeFormat().resolvedOptions().timeZone);
      })
      .catch(() => {
        setStudentRegion(Intl.DateTimeFormat().resolvedOptions().timeZone);
      });
  }, [student_username]);

  const toggleSlot = (slotObj) => {
    console.log('toggleSlot called with:', slotObj);
    if (!slotObj || !slotObj.slotId) return;
    setSelectedSlots((prev) =>
      prev.includes(slotObj.slotId)
        ? prev.filter((id) => id !== slotObj.slotId)
        : [...prev, slotObj.slotId]
    );
  };

  const handleHire = () => {
    setHiring(true);
    fetch(`http://localhost:5000/api/students/${student_username}/hire`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: teacher.id,
        courseId: selectedCourse,
        selectedSchedule: selectedSlots
      })
    })
      .then((res) => {
        setHiring(false);
        setShowModal(false);
        setSuccessModal(true);
        // Optionally clear selected slots/courses here
      })
      .catch((err) => {
        setHiring(false);
        setShowModal(false);
        alert('Failed to send request. Please try again.');
      });
  };
  

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  console.log('schedule:', schedule);
  console.log('selectedSlots:', selectedSlots);
  console.log('selectedCourse:', selectedCourse);

  // Group slots by day
  const slotsByDay = days.reduce((acc, dayShort) => {
    const dayFull = shortToFullDay[dayShort];
    acc[dayShort] = schedule.filter(slot => (slot.day && (slot.day === dayFull || slot.day.toLowerCase() === dayFull.toLowerCase())));
    return acc;
  }, {});

  // Helper to convert a time range string (e.g., "09:00 - 10:00") from teacher's region/UTC to student's region
  function convertTimeRange(timeRange, fromZone, toZone) {
    if (!timeRange) return "";
    const [start, end] = timeRange.split(" - ");
    const baseZone = fromZone || "UTC";
    try {
      const today = DateTime.now().setZone(baseZone);
      const startDT = DateTime.fromFormat(start, "HH:mm", { zone: baseZone }).set({
        year: today.year, month: today.month, day: today.day
      });
      const endDT = DateTime.fromFormat(end, "HH:mm", { zone: baseZone }).set({
        year: today.year, month: today.month, day: today.day
      });
      return `${startDT.setZone(toZone).toFormat("HH:mm")} - ${endDT.setZone(toZone).toFormat("HH:mm")}`;
    } catch {
      return timeRange;
    }
  }

  // Helper to manually convert day based on timezone differences
  function convertDayBasedOnTimezone(originalDay, originalTime, convertedTime, fromZone, toZone) {
    if (!originalDay || !originalTime || !convertedTime || !fromZone || !toZone) {
      return originalDay;
    }

    try {
      // Get timezone offsets
      const fromOffset = DateTime.now().setZone(fromZone).offset;
      const toOffset = DateTime.now().setZone(toZone).offset;
      const gmtDifference = toOffset - fromOffset; // Positive if toZone is ahead

      // Parse original and converted times
      const [originalStart] = originalTime.split(" - ");
      const [convertedStart] = convertedTime.split(" - ");
      
      const originalHour = parseInt(originalStart.split(":")[0], 10);
      const convertedHour = parseInt(convertedStart.split(":")[0], 10);

      console.log('--- Day Conversion Debug ---');
      console.log('Original day:', originalDay);
      console.log('Original time:', originalTime, '(hour:', originalHour, ')');
      console.log('Converted time:', convertedTime, '(hour:', convertedHour, ')');
      console.log('From offset:', fromOffset);
      console.log('To offset:', toOffset);
      console.log('GMT difference:', gmtDifference);

      // Day conversion logic
      let convertedDay = originalDay;
      
      if (gmtDifference > 0) { // ToZone is ahead of fromZone
        if (convertedHour < originalHour) {
          // Converted hours are less than original hours, should be next day
          convertedDay = getNextDay(originalDay);
          console.log('Moving to next day:', convertedDay);
        } else if (convertedHour > originalHour) {
          // Converted hours are higher than original hours, should be previous day
          convertedDay = getPreviousDay(originalDay);
          console.log('Moving to previous day:', convertedDay);
        }
      } else if (gmtDifference < 0) { // ToZone is behind fromZone
        if (convertedHour < originalHour) {
          // Converted hours are less than original hours, should be previous day
          convertedDay = getPreviousDay(originalDay);
          console.log('Moving to previous day:', convertedDay);
        } else if (convertedHour > originalHour) {
          // Converted hours are higher than original hours, should be next day
          convertedDay = getNextDay(originalDay);
          console.log('Moving to next day:', convertedDay);
        }
      }

      console.log('Final converted day:', convertedDay);
      return convertedDay;
    } catch (e) {
      console.log('Day conversion error:', e);
      return originalDay;
    }
  }

  // Helper to get next day
  function getNextDay(currentDay) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const currentIndex = days.indexOf(currentDay);
    const nextIndex = (currentIndex + 1) % 7;
    return days[nextIndex];
  }

  // Helper to get previous day
  function getPreviousDay(currentDay) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const currentIndex = days.indexOf(currentDay);
    const previousIndex = (currentIndex - 1 + 7) % 7;
    return days[previousIndex];
  }

  // Normalize time strings (remove spaces, ensure HH:mm - HH:mm format)
  function normalizeTimeRange(timeRange) {
    if (!timeRange) return "";
    return timeRange.replace(/\s+/g, "").replace(/-/g, " - ");
  }

  // Get all unique, normalized times from the teacher's schedule and sort them
  const allTimesRaw = Array.from(new Set(schedule.map(slot => normalizeTimeRange(slot.time)))).sort((a, b) => {
    const aStart = a.split(" - ")[0];
    const bStart = b.split(" - ")[0];
    return DateTime.fromFormat(aStart, "HH:mm").toMillis() - DateTime.fromFormat(bStart, "HH:mm").toMillis();
  });

  // Get all unique times across all days (convert to student region for display)
  const teacherZone = teacher?.region || "UTC";
  const allTimes = allTimesRaw
    .map(time => convertTimeRange(time, teacherZone, studentRegion))
    .sort((a, b) => {
      // Sort by start time in student's region (24-hour format)
      const aStart = a.split(" - ")[0];
      const bStart = b.split(" - ")[0];
      return DateTime.fromFormat(aStart, "HH:mm").toMillis() - DateTime.fromFormat(bStart, "HH:mm").toMillis();
    });

  // Build a robust slot lookup: { [studentDayShort]: { [studentTime]: slotObj } }
  const slotLookup = {};
  schedule.forEach(slot => {
    if (!slot.time || !slot.day) return;
    // Get teacher's day index (0=Monday, 6=Sunday)
    const teacherDayFull = slot.day;
    const teacherDayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(teacherDayFull);
    if (teacherDayIndex === -1) return;
    // Use an arbitrary reference week starting on Monday
    const refMonday = DateTime.utc(2023, 1, 2); // 2023-01-02 is a Monday
    const teacherDate = refMonday.plus({ days: teacherDayIndex });
    // Parse start time
    const [start] = normalizeTimeRange(slot.time).split(" - ");
    const [h, m] = start.split(":").map(Number);
    // Build teacher's DateTime in their timezone
    const teacherDT = teacherDate.set({ hour: h, minute: m, second: 0, millisecond: 0 }).setZone(teacherZone, { keepLocalTime: true });
    // Convert to student's timezone
    const studentDT = teacherDT.setZone(studentRegion);
    // Get student's local day and time
    const studentDayFull = studentDT.setLocale('en').toFormat('cccc'); // e.g., "Monday"
    const studentDayShort = fullToShortDay[studentDayFull];
    const studentTime = `${studentDT.toFormat("HH:mm")} - ${studentDT.plus({ minutes: 60 }).toFormat("HH:mm")}`;
    if (!studentDayShort) return;
    if (!slotLookup[studentDayShort]) slotLookup[studentDayShort] = {};
    slotLookup[studentDayShort][studentTime] = slot;
  });

  return (
    <div className="dashboard-container">
      <Sidebar userInfo={null} onSectionChange={() => {}} />
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

              <div className="courses-section">
                <h3 style={{ marginTop: 24, marginBottom: 12 }}>Select Course</h3>
                <div className="courses-radio-group">
                  {Array.isArray(teacher.courses) && teacher.courses.length > 0 ? (
                    teacher.courses.map((course) => {
                      const isEnrolled = enrolledCourses.includes(String(course.id));
                      return (
                        <label key={course.id} className={`custom-radio-label${selectedCourse === String(course.id) ? " selected" : ""}${isEnrolled ? " disabled" : ""}`}>
                          <input
                            type="radio"
                            name="course"
                            value={course.id}
                            checked={selectedCourse === String(course.id)}
                            onChange={() => setSelectedCourse(String(course.id))}
                            className="custom-radio-input"
                            disabled={isEnrolled}
                          />
                          <span className="custom-radio-check" />
                          {course.name}
                          {isEnrolled && <span className="enrolled-indicator">Already Enrolled</span>}
                        </label>
                      );
                    })
                  ) : (
                    <span className="no-courses">No courses available.</span>
                  )}
                </div>
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

              <h3 style={{ marginTop: 32 }}>Select Weekly Schedule (Available Slots)</h3>
              <div className="schedule-table schedule-grid-table">
                <div className="schedule-header">
                  <div className="schedule-cell schedule-time-header">Time ({studentRegion})</div>
                  {days.map(day => (
                    <div key={day} className="schedule-cell schedule-day-header">{day}</div>
                  ))}
                </div>
                {allTimesRaw.map((originalTime) => {
                  // Convert the original time to student region for display
                  // Use Monday as reference, as allTimesRaw is sorted by time only
                  const refMonday = DateTime.utc(2023, 1, 2);
                  const [h, m] = normalizeTimeRange(originalTime).split(" - ")[0].split(":").map(Number);
                  const teacherDT = refMonday.set({ hour: h, minute: m, second: 0, millisecond: 0 }).setZone(teacherZone, { keepLocalTime: true });
                  const studentDT = teacherDT.setZone(studentRegion);
                  const studentTime = `${studentDT.toFormat("HH:mm")} - ${studentDT.plus({ minutes: 60 }).toFormat("HH:mm")}`;
                  return (
                    <div className="schedule-row" key={originalTime}>
                      <div className="schedule-cell schedule-time">{studentTime}</div>
                      {days.map(dayShort => {
                        const slotObj = slotLookup[dayShort]?.[studentTime];
                        const isSelected = slotObj && selectedSlots.includes(slotObj.slotId);
                        const isDisabled = slotObj && slotObj.isBooked === true;
                        return (
                          <div className="schedule-cell" key={dayShort + originalTime}>
                            {slotObj ? (
                              <input
                                type="checkbox"
                                className={`schedule-checkbox${isSelected ? " selected" : ""}`}
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => toggleSlot(slotObj)}
                              />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 24, textAlign: "right" }}>
                <button
                  className="btn btn-primary"
                  onClick={openModal}
                  disabled={hiring || selectedSlots.length === 0 || !selectedCourse}
                >
                  {hiring ? "Hiring..." : "Hire Teacher"}
                </button>
              </div>

              {showModal && (
                <div className="modal-overlay">
                  <div className="modal-box">
                    <h3>Confirm Hire</h3>
                    <p>
                      Are you sure you want to hire <b>{teacher.name}</b> for <b>{teacher.courses && teacher.courses.find(c => String(c.id) === selectedCourse)?.name || ""}</b> with the selected schedule?
                    </p>
                    <ul>
                      {selectedSlots.map((slotId) => {
                        const slot = schedule.find(s => s.slotId === slotId);
                        return (
                          <li key={slotId}>
                            {slot ? `${slot.day} ${slot.time}` : `Slot ID: ${slotId}`}
                          </li>
                        );
                      })}
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
              {successModal && (
                <div className="modal-overlay">
                  <div className="modal-box">
                    <h3>Request Sent</h3>
                    <p>Your hire request has been sent successfully!</p>
                    <div className="modal-actions">
                      <button className="btn btn-primary" onClick={() => setSuccessModal(false)}>
                        OK
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
