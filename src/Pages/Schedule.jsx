import React from "react";

import Navbar from "../Components/Navbar";
import Header from "../Components/ScheduleComponents/ScheduleHeader";
import Form from "../Components/ScheduleComponents/ScheduleContent";
import Footer from "../Components/Footer"; 

const Schedule = () => {
    return ( <div>
        <Navbar/>
        <Header/>
        <Form/>
        <Footer/>
    </div> );
}
 
export default Schedule;