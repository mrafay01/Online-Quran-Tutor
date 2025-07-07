import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "./AvailableTeachers.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Teachers = () => {
  const [tutors, setTutors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const query = useQuery();
  const selectedCourse = query.get("course");

  useEffect(() => {
    axios
      .get("http://localhost:5000/GetAllTeachers")
      .then((res) => {
        // Map to match current API response
        const formattedTutors = res.data.map((tutor, idx) => ({
          id: tutor.id || tutor.cnic || idx,
          name: tutor.name || `Teacher ${idx + 1}`,
          location: tutor.region || "Unknown",
          rating: tutor.ratings || 5,
          canTeach: ["Nazra", "Hifz", "Tajweed", "Qiraat"],
          bio: tutor.bio || "No bio provided.",
          languages: tutor.languages ? tutor.languages.split(',').map(l => l.trim()) : ["Arabic", "Urdu", "English"],
          gender: tutor.gender === "M" ? "Male" : tutor.gender === "F" ? "Female" : "N/A",
          age: tutor.dob ? (new Date().getFullYear() - new Date(tutor.dob).getFullYear()) : "N/A",
          hourlyRate: tutor.hourly_rate ? `Rs. ${tutor.hourly_rate}/hr` : "$5.00/hr",
          taught: "20 Students",
          timeZone: tutor.region || "Unknown",
          sect: "Sunni",
          online: true,
        }));
        setTutors(formattedTutors);
      })
      .catch((err) => {
        console.error("Failed to load tutors:", err);
      });
  }, []);

  // Filter by search term
  let filteredTutors = tutors.filter((tutor) =>
    tutor.name && tutor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter by selected course if present
  if (selectedCourse) {
    filteredTutors = filteredTutors.filter((tutor) =>
      Array.isArray(tutor.canTeach) &&
      tutor.canTeach.filter(c => typeof c === 'string').map(c => c.toLowerCase()).includes(selectedCourse.toLowerCase())
    );
  }

  return (
    <div className="tutor-list-container">
      <div className="filter-section">
        <h3>Search By:</h3>
        <div className="filter-group">
          <h4>Status:</h4>
          <label>
            <input type="checkbox" /> Online
          </label>
          <label>
            <input type="checkbox" /> Offline
          </label>
        </div>
        <div className="filter-group">
          <h4>Ijazah:</h4>
          <label>
            <input type="checkbox" /> Ijazah
          </label>
        </div>
        <div className="filter-group">
          <h4>Subject:</h4>
          <label>
            <input type="checkbox" /> Recitation
          </label>
          <label>
            <input type="checkbox" /> Arabic
          </label>
          <label>
            <input type="checkbox" /> Hifz
          </label>
          <label>
            <input type="checkbox" /> Tajweed
          </label>
        </div>
        <div className="filter-group">
          <h4>Spoken Languages:</h4>
          <label>
            <input type="checkbox" /> Arabic
          </label>
          <label>
            <input type="checkbox" /> Bengali
          </label>
          <label>
            <input type="checkbox" /> English
          </label>
          <label>
            <input type="checkbox" /> Urdu
          </label>
        </div>
      </div>

      <div className="tutor-list">
        <input
          type="text"
          placeholder="Enter name to search tutors"
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {filteredTutors.map((tutor) => (
          <div key={tutor.id} className="tutor-card">
            {/* <img src={tutor.image} alt={tutor.name} className="tutor-image" /> */}
            <div className="tutor-info">
              <h2>
                {tutor.name}{" "}
                <span className="location">({tutor.location})</span>
              </h2>
              <p className="stars">{"★".repeat(Math.round(tutor.rating))}</p>
              <p>
                <strong>I can teach:</strong> {Array.isArray(tutor.canTeach) ? tutor.canTeach.join(", ") : ''}
              </p>
              <p className="bio">{tutor.bio}</p>
              <p>
                <strong>Languages:</strong> {Array.isArray(tutor.languages) ? tutor.languages.join(", ") : ''}
              </p>
              <p>
                <strong>Gender:</strong> {tutor.gender ==='M' ? "Male" : "Female"}
              </p>
              <p>
                <strong>Age:</strong> {tutor.age}
              </p>
            </div>
            <div className="hire-btn-container">
              <button className="hire-btn">Hire</button>
            </div>

            <p className={tutor.online ? "status online" : "status offline"}>
              {tutor.online ? "Online" : "Offline"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teachers;
