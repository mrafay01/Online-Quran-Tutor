import React from "react";
import "../Components/Assets/Style/Footer.css";

import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* View More */}
        <div className="footer-section-1">
          <h3>View More</h3>
          <ul>
            <li>Home</li>
            <li>Courses</li>
            <li>Teachers</li>
            <li>About Us</li>
          </ul>
        </div>

        {/* Contact Us */}
        <div className="footer-section-2">
          <h3 className="footer-contact-title">Contact Us</h3>
          <div className="footer-contact-item">
            <FaPhoneAlt className="footer-contact-icon" />
            <p>+92 347 5643386</p>
          </div>
          <div className="footer-contact-item">
            <FaEnvelope className="footer-contact-icon" />
            <p>pakmtbers2003@gmail.com</p>
          </div>
          <div className="footer-contact-item">
            <FaMapMarkerAlt className="footer-contact-icon" />
            <p>BIIT, 6th Road, Rawalpindi</p>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="footer-section-3">
          <h3>Feedback</h3>
          <form>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Comments" rows="4" required></textarea>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
