import React, { useState } from "react";
import "./ScheduleContent.css";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const times = Array.from({ length: 24 }, (_, i) => {
  const start = String(i).padStart(2, "0") + ":00";
  const end = String((i + 1) % 24).padStart(2, "0") + ":00";
  return `${start} - ${end}`;
});

const ScheduleForm = () => {
  const [schedule, setSchedule] = useState({});

  const toggleCell = (day, time) => {
    const key = `${day}-${time}`;
    setSchedule((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleEntireColumn = (day) => {
    setSchedule((prev) => {
      const updated = { ...prev };
      const isAlreadySelected = times.every(
        (time) => updated[`${day}-${time}`]
      );
      times.forEach((time) => {
        const key = `${day}-${time}`;
        updated[key] = !isAlreadySelected;
      });
      return updated;
    });
  };

  const toggleEntireRow = (time) => {
    setSchedule((prev) => {
      const updated = { ...prev };
      const isAlreadySelected = days.every((day) => updated[`${day}-${time}`]);
      days.forEach((day) => {
        const key = `${day}-${time}`;
        updated[key] = !isAlreadySelected;
      });
      return updated;
    });
  };

  const handleConfirm = () => {
    console.log("Selected Schedule:", schedule);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      alert("✅ Your schedule has been saved successfully!");
    }, 600);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all selections?")) {
      setSchedule({});
    }
  };

  const getTimeSlotClass = (time) => {
    const hour = parseInt(time.split(":")[0]);
    if (hour >= 0 && hour < 6) return "early-morning";
    if (hour >= 18 && hour <= 23) return "evening";
    return "daytime";
  };

  return (
    <section className="schedule-section">
      <h2 className="schedule-title">Set Your Schedule</h2>

      <p className="schedule-text">- Tutors will be filtered according to schedule! -</p>
      <div className="schedule-table">
        <div className="schedule-header">
          <div className="schedule-cell schedule-time-header">Time</div>
          {days.map((day) => (
            <div
              key={day}
              className="schedule-cell schedule-day-header hoverable"
              onDoubleClick={() => toggleEntireColumn(day)}
            >
              {day}
            </div>
          ))}
        </div>

        {times.map((time) => (
          <div key={time} className="schedule-row">
            <div
              className={`schedule-cell schedule-time hoverable ${getTimeSlotClass(
                time
              )}`}
              onDoubleClick={() => toggleEntireRow(time)}
            >
              {time}
            </div>
            {days.map((day) => {
              const key = `${day}-${time}`;
              return (
                <div
                  key={key}
                  className={`schedule-cell schedule-checkbox ${
                    schedule[key] ? "selected" : ""
                  }`}
                  onClick={() => toggleCell(day, time)}
                ></div>
              );
            })}
          </div>
        ))}
      </div>

      {Object.keys(schedule).length > 0 && (
        <div className="schedule-summary">
          <h3>Your Selected Schedule</h3>
          <div className="summary-grid">
            {days.map((day) => {
              const selectedTimes = times.filter(
                (time) => schedule[`${day}-${time}`]
              );
              if (selectedTimes.length === 0) return null;
              return (
                <div key={day} className="summary-day">
                  <h4>{day}</h4>
                  <ul>
                    {selectedTimes.map((time) => (
                      <li key={time}>
                        {time}
                        <button
                          className="remove-btn"
                          onClick={() => toggleCell(day, time)}
                        >
                          ❌
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="button-group">
        <button className="confirm-btn" onClick={handleConfirm}>
          Confirm
        </button>
        <button className="clear-btn" onClick={handleClearAll}>
          Clear All
        </button>
      </div>
      
    </section>
  );
};

export default ScheduleForm;
