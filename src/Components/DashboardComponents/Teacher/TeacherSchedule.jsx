import React, { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import { useParams } from "react-router-dom";
import "../dashboard.css";
import "./schedule.css";

const days = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

const TeacherSchedule = () => {
  const { username } = useParams();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    fetch(
      `http://localhost:5000/GetSchedule?username=${encodeURIComponent(username)}&role=teacher`
    )
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch schedule");
        return res.json();
      })
      .then(data => {
        setSlots(Array.isArray(data.schedule) ? data.schedule : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [username]);

  const allTimes = Array.from(new Set(slots.map(slot => slot.time))).sort();

  const slotLookup = days.reduce((acc, day) => {
    acc[day] = {};
    slots
      .filter(slot => slot.day === day)
      .forEach(slot => {
        acc[day][slot.time] = slot;
      });
    return acc;
  }, {});

  return (
    <div className="dashboard-container">
      <Sidebar onSectionChange={() => {}} />
      <main className="main-content">
        <h2 className="section-header">My Teaching Schedule</h2>

        {loading && <p>Loading schedule...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="schedule-table-wrapper">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Time</th>
                  {days.map(day => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allTimes.map((time, idx) => (
                  <tr key={time} className={idx % 2 ? "even-row" : "odd-row"}>
                    <td className="time-cell">{time}</td>
                    {days.map(day => {
                      const slot = slotLookup[day][time];
                      let className = "slot-cell unavailable";
                      let text = "Unavailable";

                      if (slot) {
                        if (slot.isBooked || slot.studentName) {
                          className = "slot-cell booked";
                          text = slot.studentName
                            ? `With ${slot.studentName}`
                            : "Booked";
                        } else {
                          className = "slot-cell available";
                          text = "Available";
                        }
                      }

                      return (
                        <td key={`${day}-${time}`} className={className}>
                          {text}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherSchedule;
