import React from "react";

import Navbar from "../Components/Navbar"
import Header from "../Components/ProfileComponents/ProfileHeader"
import Data from "../Components/ProfileComponents/ProfileContent"
import Footer from "../Components/Footer";

const Profile = () => {
    return ( <div>
        <Navbar/>
        <Header/>
        <Data/>
        <Footer/>
    </div> );
}
 
export default Profile;