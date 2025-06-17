import React from "react";

import "./FreeLesson.css"

const FreeLesson = () => {
    return ( <div>
        <section className="trial-section">
            <h2 className="trial-title">Start First Session Today!</h2>
            <p className="trial-text">
            Start your first session today and begin your journey of learning the Quran with expert tutors. Join thousands of students worldwide who are mastering Tajweed, Nazra, and memorization with personalized guidance. Experience interactive lessons from certified instructors and elevate your Quranic knowledge.
            </p>
            <a href="/register" className="trial-button">
                Register
            </a>
            </section>
    </div> );
}
 
export default FreeLesson;