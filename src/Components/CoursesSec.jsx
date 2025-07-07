import React from "react";
import "../Components/Assets/Style/CoursesSec.css"
import rightimg from "../Components/Assets/Images/BG2.jpg"

const CoursesSec = () => {
    const courses = [
        { id: "nazra", name: "NAZRA", path: "/" },
        { id: "tajweed", name: "TAJWEED", path: "/" },
        { id: "hifz", name: "HIFZ", path: "/" },
        { id: "qiraat", name: "QIRAAT", path: "/" }
    ];

    return ( 
        <section className="Courses" id="courses">
            <h2>DIFFERENT COURSES BEING OFFERED</h2>
                <div className="parallel-lines">
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>

                {/* Horizontal lines */}
                <div className="parallel-lines2">
                    <div className="line2"></div>
                    <div className="line2"></div>
                    <div className="line2"></div>
                </div>
            <div className="content-container">
                {/* Vertical lines */}

                {/* Course grid */}
                <div className="grid">
                    {courses.map((course) => (
                        <div className="grid-items" id={`item-${course.id}`} key={course.id}>
                            <a href={course.path}>
                                <div className="items">
                                    <p>{course.name}</p>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>

                {/* Quran image */}
                <div className="img">
                    <img src={rightimg || "/placeholder.svg"} alt="Holy Quran on decorative cloth" />
                </div>
            </div>
        </section>
    );
}
 
export default CoursesSec;