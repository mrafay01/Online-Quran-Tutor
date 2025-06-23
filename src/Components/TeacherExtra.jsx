import React, { useState } from "react";
import Select from "react-select";
import { useLocation, useNavigate } from "react-router-dom";
import "./Assets/Style/LoginSignup.css";

const courseOptions = [
  { value: "Nazra", label: "Nazra" },
  { value: "Tajweed", label: "Tajweed" },
  { value: "Hifz", label: "Hifz" },
  { value: "Qiraat", label: "Qiraat" },
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!hourlyrate) newErrors.hourlyrate = "Hourly rate is required";
    if (!courses.length) newErrors.courses = "Select at least one course";
    if (!video) newErrors.video = "Video sample is required";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setIsLoading(true);
    try {
      const payload = {
        username,
        hourly_rate: hourlyrate,
        courses: courses.map(c => c.value),
        sample_clip: video,
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
                onChange={setCourses}
                isMulti
                placeholder="Select courses"
              />
              {errors.courses && (
                <div className="error-message">{errors.courses}</div>
              )}
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