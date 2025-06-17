import React from "react";
import "../CoursesComponents/AvailableCourses.css";

// Sample courses data
const courses = [
  {
    title: "Hifz Course",
    description:
      "Quran memorization course to help you memorize the holy Quran by heart.",
    image: require("../Assets/Images/hifz.png"),
  },
  {
    title: "Tajweed Course",
    description:
      "Tajweed Quran course to improve reading and recitation of the holy Quran.",
    image: require("../Assets/Images/Tajweed.png"),
  },
  {
    title: "Qiraat Course",
    description:
      "Qiraat Arabic course that caters to individuals of all ages and levels.",
    image: require("../Assets/Images/qiraat.png"),
  },
  {
    title: "Nazra",
    description:
      "Nazra course to help you correctly pronounce Arabic alphabets.",
    image: require("../Assets/Images/Nazra.png"),
  },
];

const AvailableCourses = () => {
  return (
    <section className="courses-container">
      <h2>ENROLL QURAN COURSES</h2>
      <div className="courses-grid">
        {courses.map((course, index) => (
          <div key={index} className="course-card">
            <img src={course.image} alt={course.title} className="course-image" />
            <h3>{course.title}</h3>
            <p>{course.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AvailableCourses;
