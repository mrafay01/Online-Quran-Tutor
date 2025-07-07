import React, { useState } from "react";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import "./Assets/Style/LoginSignup.css";

const courseOptions = [
  { value: "Nazra Course", label: "Nazra" },
  { value: "Tajweed Course", label: "Tajweed" },
  { value: "Hifz Course", label: "Hifz" },
  { value: "Qiraat Course", label: "Qiraat" },
];

const dayOptions = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
  { value: "Saturday", label: "Saturday" },
  { value: "Sunday", label: "Sunday" },
];

const timeSlotOptions = [
  { value: "00:00 - 01:00", label: "00:00 - 01:00" },
  { value: "01:00 - 02:00", label: "01:00 - 02:00" },
  { value: "02:00 - 03:00", label: "02:00 - 03:00" },
  { value: "03:00 - 04:00", label: "03:00 - 04:00" },
  { value: "04:00 - 05:00", label: "04:00 - 05:00" },
  { value: "05:00 - 06:00", label: "05:00 - 06:00" },
  { value: "06:00 - 07:00", label: "06:00 - 07:00" },
  { value: "07:00 - 08:00", label: "07:00 - 08:00" },
  { value: "08:00 - 09:00", label: "08:00 - 09:00" },
  { value: "09:00 - 10:00", label: "09:00 - 10:00" },
  { value: "10:00 - 11:00", label: "10:00 - 11:00" },
  { value: "11:00 - 12:00", label: "11:00 - 12:00" },
  { value: "12:00 - 13:00", label: "12:00 - 13:00" },
  { value: "13:00 - 14:00", label: "13:00 - 14:00" },
  { value: "14:00 - 15:00", label: "14:00 - 15:00" },
  { value: "15:00 - 16:00", label: "15:00 - 16:00" },
  { value: "16:00 - 17:00", label: "16:00 - 17:00" },
  { value: "17:00 - 18:00", label: "17:00 - 18:00" },
  { value: "18:00 - 19:00", label: "18:00 - 19:00" },
  { value: "19:00 - 20:00", label: "19:00 - 20:00" },
  { value: "20:00 - 21:00", label: "20:00 - 21:00" },
  { value: "21:00 - 22:00", label: "21:00 - 22:00" },
  { value: "22:00 - 23:00", label: "22:00 - 23:00" },
  { value: "23:00 - 00:00", label: "23:00 - 00:00" }
];

const TeacherExtra = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const username = params.get("username") || "";

  const [hourlyrate, setHourlyrate] = useState("");
  const [courses, setCourses] = useState([]);
  const [video, setVideo] = useState("");
  const [videoName, setVideoName] = useState("");
  const [schedule, setSchedule] = useState(() => {
    // Initialize with all days and empty arrays
    const initial = {};
    dayOptions.forEach(day => {
      initial[day.value] = [];
    });
    return initial;
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideo(reader.result); // base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  // Checkbox handler
  const handleSlotChange = (day, slot) => {
    setSchedule(prev => {
      const slots = prev[day] || [];
      if (slots.includes(slot)) {
        // Remove slot
        return { ...prev, [day]: slots.filter(s => s !== slot) };
      } else {
        // Add slot
        return { ...prev, [day]: [...slots, slot] };
      }
    });
  };

  // Add a handler to log course values
  const handleCoursesChange = (selected) => {
    setCourses(selected);
    const values = (selected || []).map(c => c.value);
    console.log('Selected course values for API:', values);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!hourlyrate) newErrors.hourlyrate = "Hourly rate is required";
    if (!courses.length) newErrors.courses = "Select at least one course";
    if (!video) newErrors.video = "Video sample is required";
    // At least one slot must be selected for at least one day
    const hasAnySlot = Object.values(schedule).some(arr => arr.length > 0);
    if (!hasAnySlot) newErrors.schedule = "Please select at least one slot in your weekly schedule.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setIsLoading(true);
    try {
      // Convert schedule object to array of {day, slots}
      const scheduleArr = Object.entries(schedule)
        .filter(([_, slots]) => slots.length > 0)
        .map(([day, slots]) => ({ day, slots }));
      const payload = {
        username,
        hourly_rate: hourlyrate,
        courses: courses.map(c => c.value),
        sample_clip: video,
        schedule: scheduleArr
      };
      const response = await fetch("http://localhost:5000/SignUpTeacherExtra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        setErrors({ form: data.error || "An error occurred. Please try again." });
        setIsLoading(false);
        return;
      }
      // Success
      alert("Profile completed!");
      navigate(`/teacher/${username}/dashboard`);
    } catch (error) {
      setErrors({ form: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <div className="header">
          <div className="title">Complete Your Teacher Profile</div>
          {errors.form && <div className="form-error">{errors.form}</div>}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="inputs">
            <div className="input">
              <label htmlFor="hourlyrate">Hourly Rate</label>
              <select
                id="hourlyrate"
                name="hourlyrate"
                className={`textfield ${errors.hourlyrate ? "error" : ""}`}
                value={hourlyrate}
                onChange={e => setHourlyrate(e.target.value)}
              >
                <option value="">Select hourly rate</option>
                {Array.from({ length: 14 }, (_, i) => i + 2).map((rate) => (
                  <option key={rate} value={rate}>
                    ${rate}
                  </option>
                ))}
              </select>
              {errors.hourlyrate && (
                <div className="error-message">{errors.hourlyrate}</div>
              )}
            </div>
            <div className="input">
              <label htmlFor="courses">Courses You Can Teach</label>
              <Select
                id="courses"
                name="courses"
                classNamePrefix="react-select"
                className={errors.courses ? "error" : ""}
                options={courseOptions}
                value={courses}
                onChange={handleCoursesChange}
                isMulti
                placeholder="Select courses"
              />
              {errors.courses && (
                <div className="error-message">{errors.courses}</div>
              )}
            </div>
            {/* Schedule Table Section */}
            <div className="input">
              <label>Weekly Schedule</label>
              {errors.schedule && (
                <div className="error-message">{errors.schedule}</div>
              )}
              <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
                <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ border: '1px solid #ccc', padding: '4px', background: '#f5f5f5' }}>Time Slot</th>
                      {dayOptions.map(day => (
                        <th key={day.value} style={{ border: '1px solid #ccc', padding: '4px', fontSize: '11px', background: '#f5f5f5' }}>{day.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlotOptions.map(slot => (
                      <tr key={slot.value}>
                        <td style={{ border: '1px solid #ccc', padding: '4px', fontWeight: 'bold', background: '#fafafa' }}>{slot.label}</td>
                        {dayOptions.map(day => (
                          <td key={day.value} style={{ border: '1px solid #ccc', padding: '2px', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={schedule[day.value]?.includes(slot.value) || false}
                              onChange={() => handleSlotChange(day.value, slot.value)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="input">
              <label htmlFor="video">Video Sample (Upload your own recording)</label>
              <div className="profile-video-picker">
                <input
                  type="file"
                  id="video"
                  name="video"
                  accept="video/*"
                  className="profile-video-input"
                  onChange={handleVideoChange}
                />
                {video && (
                  <video
                    src={video}
                    controls
                    className="profile-video-preview"
                    style={{ background: "#eee" }}
                  />
                )}
                {videoName && !video && (
                  <span style={{ marginLeft: 8 }}>{videoName}</span>
                )}
              </div>
              {errors.video && (
                <div className="error-message">{errors.video}</div>
              )}
            </div>
          </div>
          <div className="buttons">
            <button type="submit" className={`submit${isLoading ? " loading" : ""}`} disabled={isLoading}>
              {isLoading ? "Submitting..." : "Complete Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherExtra; 