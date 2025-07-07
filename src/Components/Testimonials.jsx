import React from "react";
import "../Components/Assets/Style/Testimonials.css"

import boyimg from "../Components/Assets/Images/boy-avatar.png"
import girlimg from "../Components/Assets/Images/girl-avatar.png"

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Firdaouss Y",
      role: "Student",
      countryFlag: "🇳🇱",
      message:
        "Alhamdulillah, my one-on-one Arabic lessons are going great. I'm very thankful that I found my Qutor Tutor through your website!",
      avatar: girlimg, // Replace with actual image
    },
    {
      name: "Wajid P",
      role: "Student",
      countryFlag: "🇺🇸",
      message:
        "Alhamdulillah we are pleased to continue the Quran lessons for my daughter with our Qutor Tutor.",
      avatar: boyimg, // Replace with actual image
    },
    {
      name: "A. Islam",
      role: "Student",
      countryFlag: "🇦🇪",
      message:
        "Alhamdulillah and I will definitely be recommending the website to anyone interested. JazakAllah khair.",
      avatar: boyimg, // Replace with actual image
    },
  ];

  return (
    <section className="testimonial-section">
      <h2 className="testimonial-title">WHAT THEY SAY ABOUT US</h2>
      <div className="testimonial-container">
      {testimonials.map((testimonial, index) => (
        <div key={index} className="testimonial-card">
          <img src={testimonial.avatar} alt={testimonial.name} className="testimonial-avatar" />
          <h3 className="testimonial-name">
            {testimonial.countryFlag} {testimonial.name}
          </h3>
          <p className="testimonial-role">{testimonial.role}</p>
          <p className="testimonial-message">{testimonial.message}</p>
        </div>
      ))}

      </div>
      <button className="find-reviews-btn">View all Reviews</button>
    </section>
  );
};

export default TestimonialSection;
