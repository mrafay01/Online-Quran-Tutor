import React from 'react';
import { useNavigate } from "react-router-dom";

import "../Components/Assets/Style/HomeScreen.css"

const HomeScreen = () => {
    const Navigate = useNavigate()
    return ( 
        <header className="head" id="home">
            <section className='sec'>
                <h1 className="heading">ONLINE QURAN TUTOR</h1>
                <p className="para">Join our platform where students and teachers connect for interactive Quran learning. Whether you're a student seeking expert guidance or a tutor looking to share your knowledge, our platform offers flexible, personalized learning opportunities. Start your journey today!</p>
                <div className='btns'>
                    <button onClick={() => Navigate("/loginsignup")} className="header-btn">Join as Teacher</button>
                    <button onClick={() => Navigate("/loginsignup")} className="header-btn">Join as Student</button>
                    <button onClick={() => Navigate("/loginsignup")} className="header-btn">Login as Parent</button>
                </div>
            </section>
        </header>
    );
}

export default HomeScreen;