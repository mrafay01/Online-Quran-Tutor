import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AvailableTeachers.css";

const Teachers = () => {
  const [tutors, setTutors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/GetAllTeachers")
      .then((res) => {
        // Transform API data to match frontend format
        const formattedTutors = res.data.map((tutor) => ({
          id: tutor["T-id"],
          name: tutor.Name,
          location: tutor.Region,
          rating: tutor.Rating || 5,
          canTeach: ["Recitation", "Tajweed"], // You can update this if your DB supports it
          bio: `Assalamu alaikum. I'm ${tutor.Name}, a qualified teacher from ${tutor.Region}...`,
          languages: ["Arabic", "Urdu", "English"], // Placeholder: update if your API has this
          gender: tutor.Gender,
          hourlyRate: "$5.00/hr", // Placeholder
          conducted: "100 Sessions", // Placeholder
          lastActive: "5 minutes ago", // Placeholder
          taught: "20 Students", // Placeholder
          timeZone: "Asia/Karachi", // Placeholder
          sect: "Sunni", // Placeholder
          online: true,
        }));
        setTutors(formattedTutors);
      })
      .catch((err) => {
        console.error("Failed to load tutors:", err);
      });
  }, []);

  const filteredTutors = tutors.filter((tutor) =>
    tutor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <strong>I can teach:</strong> {tutor.canTeach.join(", ")}
              </p>
              <p className="bio">{tutor.bio}</p>
              <p>
                <strong>Languages:</strong> {tutor.languages.join(", ")}
              </p>
              <p>
                <strong>Gender:</strong> {tutor.gender}
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
