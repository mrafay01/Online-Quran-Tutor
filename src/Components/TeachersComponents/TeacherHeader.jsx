import React from "react";
import { Link } from "react-router-dom";

import "./TeacherHeader.css"
// import heroImage from "../Assets/Images/BG-Courses.jpg";

const Header = () => {
    return ( <div>
        <header className="head-at">
        <div className="sec-at">
            <h1 className="heading-at">
            HIGHLY QUALIFIED QURAN TEACHERS
            </h1>
            <p className="para-at">
            Learn from highly qualified Quran teachers from all around the world, dedicated to providing expert guidance in Tajweed, memorization, and recitation. Our certified instructors ensure a personalized learning experience tailored to your needs.
            </p>
            <div className="btns-at">
            <Link to="/loginsignup" className="login-btn">
                Become a Tutor ➜
            </Link>
            </div>
        </div>
        </header>
    </div> );
}
 
export default Header;