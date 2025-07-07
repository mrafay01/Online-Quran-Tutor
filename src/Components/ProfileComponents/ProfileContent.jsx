import React from "react";
import { Link } from "react-router-dom";
import avatarImg from "../Assets/Images/male-avatar.jpg"; 
import "./ProfileContent.css";

const ProfilePage = () => {
  return (
    <div className="profile-page">

      {/* Buttons */}
      <div className="profile-buttons">
        {/* <Link to="/edit-profile" className="profile-btn">Edit Profile</Link> */}
        <Link to="/request-swap" className="profile-btn">Request For Swap</Link>
        <Link to="/settings" className="profile-btn">Settings</Link>
        <Link to="/schedule" className="profile-btn">Set Schedule</Link>
        <Link to="/my-reviews" className="profile-btn">My Reviews</Link>
        <Link to="/change-password" className="profile-btn">Change Password</Link>
        <Link to="/loginsignup" className="profile-btn logout-btn">Logout</Link>
      </div>

    </div>
  );
};

export default ProfilePage;
