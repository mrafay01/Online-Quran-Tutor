import React from "react";

import Navbar from "../Components/Navbar"
import HomeScreen from "../Components/HomeScreen"
import Courses from "../Components/CoursesSec"
import Info from "../Components/InfoSec"
import Reviews from "../Components/Testimonials"
import Footer from "../Components/Footer"

const home = () => {
    return ( <div>
        <Navbar/>
        <HomeScreen/>
        <Courses/>
        <Info/>
        <Reviews/>
        <Footer/>
    </div> );
}
 
export default home;