import React from "react";
import "./ContactContent.css";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const ContactDetails = () => {
  return (
    <section className="contact-details-section">
      <div className="contact-details-container">
        <h2 className="contact-title">Get In Touch</h2>
        <p className="contact-subtitle">
          We'd love to hear from you! Reach out through any of the ways below.
        </p>

        <div className="contact-cards">
          <div className="contact-card">
            <FaPhoneAlt className="contact-icon" />
            <h3>Phone</h3>
            <p>+92 347 5643386</p>
          </div>

          <div className="contact-card">
            <FaEnvelope className="contact-icon" />
            <h3>Email</h3>
            <p>pakmtbers2003@gmail.com</p>
          </div>

          <div className="contact-card">
            <FaMapMarkerAlt className="contact-icon" />
            <h3>Location</h3>
            <p>BIIT, 6th Road, Rawalpindi</p>
          </div>
        </div>

        {/* Embedded Map Section */}
        <div className="map-container">
          <iframe
            title="Our Location - BIIT 6th Road Rawalpindi"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3324.043707893164!2d73.078917!3d33.64325!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38df952d0caaaab5%3A0x8ad4f3d58e29b92e!2sBIIT%2C%206th%20Road%20Rawalpindi!5e0!3m2!1sen!2s!4v1714284603941!5m2!1sen!2s"
            width="100%"
            height="400"
            style={{
              border: 0,
              borderRadius: "20px",
              marginTop: "60px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default ContactDetails;
