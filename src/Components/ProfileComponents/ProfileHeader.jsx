import React from "react";
import { FaMapMarkerAlt, FaEnvelope, FaStar } from "react-icons/fa";
import "./ProfileHeader.css";

// Sample Avatar Image (You can replace with user profile picture later)
import avatarImg from "../Assets/Images/male-avatar.jpg"; // 🖼️ Your avatar image

const ProfileHeader = () => {
  return (
    <section className="profile-header">
      {/* Background Banner */}
      <div className="banner"></div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Avatar */}
        <img src={avatarImg} alt="Profile" className="avatar" />

        {/* Profile Details */}
        <div className="profile-details">
          <h2 className="profile-name">Sheikh Abdullah</h2>
          <p className="profile-role">Teacher at Quran Academy</p>

          <div className="profile-rating">
            <FaStar className="star" />
            <FaStar className="star" />
            <FaStar className="star" />
            <FaStar className="star" />
            <FaStar className="star half" />
            <span>4.5 (10 reviews)</span>
          </div>

          <p className="profile-quote">
            "Spreading the Light of Quran, one lesson at a time."
          </p>
          
          {/* Location and Contact */}
          <div className="profile-info">
            <p>
              <FaMapMarkerAlt className="icon" /> Rawalpindi, Pakistan
            </p>
            <p>
              <FaEnvelope className="icon" /> hafiz.hassan@example.com
            </p>
          </div>


          
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;
