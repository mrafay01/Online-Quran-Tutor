import React from "react";
import { Link } from "react-router-dom";

import "./ScheduleHeader.css";

const ScheduleHeader = () => {
  return (
    <div>
      <header className="head-sh">
        <div className="sec-sh">
          <h1 className="heading-sh">
            PLAN YOUR QURAN LEARNING JOURNEY
          </h1>
          <p className="para-sh">
            Students and teachers can now set their learning schedules easily. Choose the times that fit your life and stay consistent with your Quranic journey.
          </p>
          <div className="btns-sh">
            <Link to="/loginsignup" className="set-schedule-btn">
              Set Schedule as Teacher ➜
            </Link>
          </div>
        </div>
      </header>
    </div>
  );
};

export default ScheduleHeader;
