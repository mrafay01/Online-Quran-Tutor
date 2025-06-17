import React from "react";
import { Link } from "react-router-dom";
import "./ContactHeader.css";
import contactUsImage from "../Assets/Images/Contact-Us-BG.jpg"; // Replace with your actual image path

const ContactHeader = () => {
    return (
        <div style={{ backgroundImage: `url(${contactUsImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <header className="head-cc">
                <div className="sec-cc">
                    <h1 className="heading-cc">
                        CONTACT US<br /> WE'D LOVE TO HEAR FROM YOU<br />
                    </h1>
                    <p className="para-cc">
                        Whether you have questions, need support, or want to start your Quran learning journey, our team is ready to assist you. Reach out to us and we'll respond promptly!
                    </p>
                </div>
            </header>
        </div>
    );
}

export default ContactHeader;
