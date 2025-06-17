import React from "react";
import { Link } from "react-router-dom";
import "./AboutUsHeader.css";
import aboutUsImage from "../Assets/Images/About-Us-img.jpg"; // Replace with actual image path

const AboutUsHeader = () => {
    return (
        <div style={{ backgroundImage: `url(${aboutUsImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <header className="head-as">
                <div className="sec-as">
                    <h1 className="heading-as">
                        ABOUT US <br /> OUR MISSION AND VALUES <br />
                    </h1>
                    <p className="para-as">
                        We are dedicated to providing quality education and resources to help individuals grow and learn. Our team is passionate about making a positive impact in the community.
                    </p>
                    <div className="btns-as">
                        <Link to="/contact-us" className="contact-btn">
                            Contact Us ➜
                        </Link>
                    </div>
                </div>
            </header>
        </div>
    );
}

export default AboutUsHeader;