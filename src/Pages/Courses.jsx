import React from "react";

import Navbar from "../Components/Navbar"
import Header from "../Components/CoursesComponents/CourseHeader";
import AvailableCourses from "../Components/CoursesComponents/AvailableCourses";
import Footer from "../Components/Footer";
import FreeLesson from "../Components/CoursesComponents/FreeLesson";

const Courses = () => {
    return ( <div>
        <Navbar/>
        <Header/>
        <AvailableCourses/>
        <FreeLesson/>
        <Footer/>
    </div> );
}
 
export default Courses;
