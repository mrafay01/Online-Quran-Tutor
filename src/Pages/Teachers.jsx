import React from "react";

import Navbar from "../Components/Navbar";
import Header from "../Components/TeachersComponents/TeacherHeader";
import AvailTeachers from "../Components/TeachersComponents/AvailableTeachers";
import Footer from "../Components/Footer"

const Teachers = () => {
    return ( <div>
        <Navbar/>
        <Header/>
        <AvailTeachers/>
        <Footer/>
    </div> );
}
 
export default Teachers;