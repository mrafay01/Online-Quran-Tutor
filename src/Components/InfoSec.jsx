import React from 'react';

import "../Components/Assets/Style/InfoSec.css"
import tutorImage from "../Components/Assets/Images/teachers.png"
import planImage from "../Components/Assets/Images/time management.png"
import learningImage from "../Components/Assets/Images/class.png"



const InfoSec = () => {
    return ( 
        <section className="three-steps-container">
      <h2 className="section-title">3 STEPS TO LEARN QURAN ONLINE</h2>
      <div className="steps-grid">
        <div className="step">
          <img src={tutorImage} alt="Find a Quran Tutor" />

          <h3>Find a Quran Tutor</h3>
          <p>
            You can browse profiles of hand-picked
            <a href="/tutors"> online Quran teachers</a> who teach Quran
            courses like <a href="/courses">Noorani Qaida, Quran Recitation</a>,
            Tajweed, Quran memorization and Arabic language.
          </p>
        </div>

        <div className="step">
          <img src={planImage} alt="Select your Plan" />

          <h3>Select your Plan</h3>
          <p>
            Use your thirty-minute free classroom time to interview Quran
            teachers. Continue to learn Quran online with your selected tutor by
            choosing a classroom plan.
          </p>
        </div>

        <div className="step">
          <img src={learningImage} alt="Start Learning Quran" />

          <h3>Start Learning Quran</h3>
          <p>
            You don’t need Zoom or any other software. Our Quran Classroom is
            designed for online Quran classes and works in your browser with
            video and audio.
          </p>
        </div>
      </div>
      <button className="find-tutor-btn">Find Quran Tutors</button>
    </section>
    );
}
 
export default InfoSec;
