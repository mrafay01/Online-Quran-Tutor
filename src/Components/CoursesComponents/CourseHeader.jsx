import React from "react";
import { Link } from "react-router-dom";

import "../CoursesComponents/CourseHeader.css"
// import heroImage from "../Assets/Images/BG-Courses.jpg";

const Header = () => {
    return ( <div>
        <header className="head-cs">
        <div className="sec-cs">
            <h1 className="heading-cs">
            ONLINE QURAN COURSES <br /> AND QURAN LESSONS<br />
            </h1>
            <p className="para-cs">
            Learn the Quran online with highly qualified and experienced tutors, and enjoy personalized one-on-one lessons tailored to your pace and learning needs.
            </p>
        </div>
        </header>
    </div> );
}
 
export default Header;