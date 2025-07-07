import React from "react";
import "./Body-AS.css";

const AboutUsContent = () => {
  return (
    <div className="aboutus-content-wrapper">
      <section className="intro-section">
        <h2>Who We Are</h2>
        <p>
          We are a team of passionate and qualified Quran tutors dedicated to spreading the light of Quranic knowledge to learners worldwide. Our platform offers personalized, flexible, and interactive online Quran learning for students of all ages and backgrounds.
        </p>
      </section>

      <section className="mission-section">
        <h2>Our Mission</h2>
        <p>
          Our mission is to make Quran education accessible to everyone, no matter where they are. Through one-on-one sessions, structured learning paths, and a supportive environment, we aim to foster a deep and lasting relationship between our students and the Holy Quran.
        </p>
      </section>

      <section className="values-section">
        <h2>Our Core Values</h2>
        <ul>
          <li><strong>Excellence:</strong> Providing top-quality education with certified teachers.</li>
          <li><strong>Respect:</strong> Honoring every student's pace and journey.</li>
          <li><strong>Integrity:</strong> Maintaining honesty and transparency in everything we do.</li>
          <li><strong>Compassion:</strong> Creating a warm, encouraging learning environment.</li>
          <li><strong>Innovation:</strong> Leveraging modern technology to enhance Quranic learning.</li>
        </ul>
      </section>

      <section className="choose-section">
        <h2>Why Choose Us?</h2>
        <p>
          With Online Quran Tutor, you are not just enrolling in classes — you are beginning a transformative journey. Our structured programs, professional tutors, flexible timings, and friendly support system are designed to make your learning smooth, engaging, and spiritually rewarding.
        </p>
      </section>
    </div>
  );
};

export default AboutUsContent;
