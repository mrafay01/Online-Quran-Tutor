import React, { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import './RequestIncharge.css';
import { useParams } from 'react-router-dom';
import { DateTime } from 'luxon';

const RequestIncharge = () => {
  const { username } = useParams();
  const [slots, setSlots] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [userRegion, setUserRegion] = useState('');
  const [teacherRegions, setTeacherRegions] = useState({});

  // Fetch teacher's slots, all teachers, and regions on mount
  useEffect(() => {
    async function fetchData() {
      setInitialLoading(true);
      setError('');
      try {
        // Fetch slots
        const slotRes = await fetch(`http://localhost:5000/GetSchedule?username=${encodeURIComponent(username)}&role=teacher`);
        const slotData = await slotRes.json();
        setSlots(Array.isArray(slotData.schedule) ? slotData.schedule : []);
        // Fetch teachers
        const teacherRes = await fetch('http://localhost:5000/GetAllTeachers');
        const teacherData = await teacherRes.json();
        setTeachers(Array.isArray(teacherData) ? teacherData : []);
        // Fetch current user's region
        let userRegion = 'UTC';
        try {
          const res = await fetch(`http://localhost:5000/api/get_user_region?username=${encodeURIComponent(username)}&role=teacher`);
          if (res.ok) {
            const data = await res.json();
            userRegion = data.region || 'UTC';
          }
        } catch {}
        setUserRegion(userRegion);
        // Fetch all available teachers' regions
        const teacherUsernames = Array.from(new Set((teacherData || []).map(t => t.username).filter(Boolean)));
        const regions = {};
        await Promise.all(teacherUsernames.map(async (teacherUsername) => {
          try {
            const res = await fetch(`http://localhost:5000/api/get_user_region?username=${encodeURIComponent(teacherUsername)}&role=teacher`);
            if (res.ok) {
              const data = await res.json();
              regions[teacherUsername] = data.region || 'UTC';
            } else {
              regions[teacherUsername] = 'UTC';
            }
          } catch {
            regions[teacherUsername] = 'UTC';
          }
        }));
        setTeacherRegions(regions);
      } catch (err) {
        setError('Failed to load data.');
      } finally {
        setInitialLoading(false);
      }
    }
    fetchData();
  }, [username]);

  // Helper to convert a time range string (e.g., "09:00 - 10:00") from one region to another
  function convertTimeRangeBetweenRegions(timeRange, fromZone, toZone) {
    if (!timeRange || !fromZone || !toZone) return "";
    const [start, end] = timeRange.split(" - ");
    try {
      const today = DateTime.now().setZone(fromZone);
      const startDT = DateTime.fromFormat(start, "HH:mm", { zone: fromZone }).set({
        year: today.year, month: today.month, day: today.day
      });
      const endDT = DateTime.fromFormat(end, "HH:mm", { zone: fromZone }).set({
        year: today.year, month: today.month, day: today.day
      });
      return `${startDT.setZone(toZone).toFormat("HH:mm")} - ${endDT.setZone(toZone).toFormat("HH:mm")}`;
    } catch {
      return timeRange;
    }
  }

  const handleSlotChange = (slotId) => {
    setSelectedSlots((prev) =>
      prev.includes(slotId)
        ? prev.filter((id) => id !== slotId)
        : [...prev, slotId]
    );
    setSelectedTeacher('');
    setMessage('');
    setError('');
  };

  // Get selected slot objects
  const selectedSlotObjs = slots.filter(slot => selectedSlots.includes(slot.slotId));
  // Get unique courses and slot times from selected slots
  const selectedCourses = [...new Set(selectedSlotObjs.map(slot => typeof slot.course === 'object' && slot.course !== null ? slot.course.courseName : slot.course))];
  const selectedDayTimes = selectedSlotObjs.map(slot => ({ day: slot.day, time: slot.time }));

  console.log("Teachers:", teachers);
  console.log("Selected Courses:", selectedCourses);
  console.log("Selected DayTimes:", selectedDayTimes);
  console.log("Slots:", slots);

  // Filter teachers: must be able to teach all selected courses and be available for all selected slots (timezone-aware)
  const filteredTeachers = teachers.filter(teacher => {
    const canTeach = Array.isArray(teacher.canTeach) ? teacher.canTeach : (teacher.canTeach ? teacher.canTeach.split(',').map(c => c.trim()) : []);
    const available = Array.isArray(teacher.available) ? teacher.available : [];
    const canTeachAll = selectedCourses.every(course => canTeach.includes(course));
    // For each selected slot, check if teacher is available for a slot that, when converted to userRegion, matches the selected slot's day and time
    const teacherRegion = teacherRegions[teacher.username] || 'UTC';
    const availableAll = selectedDayTimes.every(selSlot =>
      available.some(avail => {
        // Convert teacher's available slot time to userRegion
        if (!avail.time || !avail.day) return false;
        const convertedTime = convertTimeRangeBetweenRegions(avail.time, teacherRegion, userRegion);
        // Compare both day and time
        return avail.day === selSlot.day && convertedTime === selSlot.time;
      })
    );
    // Exclude self
    const notSelf = teacher.username !== username && teacher.name !== username;
    return canTeachAll && availableAll && notSelf;
  });

  const handleSendRequest = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch('http://localhost:5000/RequestIncharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromTeacher: username,
          toTeacher: selectedTeacher,
          slotIds: selectedSlots,
        }),
      });
      if (!res.ok) throw new Error('Failed to send request');
      setMessage('Request sent successfully!');
      setSelectedSlots([]);
      setSelectedTeacher('');
    } catch (err) {
      setError('Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-incharge-container">
      <Sidebar onSectionChange={() => {}} />
      <div className="request-incharge-content">
        <h2 className="request-incharge-title">Request Incharge / Swap Slots</h2>
        {initialLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* Step 1: Select slots */}
            <div className="request-incharge-section">
              <h4 className="request-incharge-step-title">1. Select Slots to Swap</h4>
              <div className="request-incharge-box">
                {slots.length === 0 ? (
                  <p>No slots available.</p>
                ) : (
                  (() => {
                    // Build unique days and times
                    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                    const times = Array.from(new Set(slots.map(slot => slot.time))).sort();
                    // Build a lookup for booked slots
                    const slotLookup = {};
                    slots.forEach(slot => {
                      slotLookup[`${slot.day}|${slot.time}`] = slot;
                    });
                    return (
                      <div className="slot-grid-wrapper">
                        <table className="slot-grid-table">
                          <thead>
                            <tr>
                              <th></th>
                              {days.map(day => (
                                <th key={day}>{day}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {times.map(time => (
                              <tr key={time}>
                                <td className="slot-grid-time">{time}</td>
                                {days.map(day => {
                                  const slot = slotLookup[`${day}|${time}`];
                                  const isBooked = slot && (slot.isBooked === true || slot.isBooked === 'true');
                                  return (
                                    <td key={day + time} className={isBooked ? 'slot-booked-cell' : 'slot-empty-cell'}>
                                      {isBooked ? (
                                        <label className="slot-checkbox-label">
                                          <input
                                            type="checkbox"
                                            checked={selectedSlots.includes(slot.slotId)}
                                            onChange={() => handleSlotChange(slot.slotId)}
                                            disabled={loading}
                                          />
                                          <span className="slot-checkbox-cue">Booked</span>
                                          {slot.course && (
                                            <span className="slot-course-cue">{typeof slot.course === 'object' && slot.course !== null ? slot.course.courseName : slot.course}</span>
                                          )}
                                        </label>
                                      ) : (
                                        <span className="slot-disabled-cue">—</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
            {/* Step 2: Filtered teachers */}
            <div className="request-incharge-section">
              <h4 className="request-incharge-step-title">2. Select Available Teacher</h4>
              <div className="request-incharge-box">
                {selectedSlots.length === 0 ? (
                  <p>Select slots to see available teachers.</p>
                ) : filteredTeachers.length === 0 ? (
                  <p>No teachers available for the selected slots.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {filteredTeachers.map((teacher) => (
                      <li key={teacher.id || teacher.username} style={{ marginBottom: '0.5rem' }}>
                        <label>
                          <input
                            type="radio"
                            name="teacher"
                            value={teacher.username || teacher.id}
                            checked={selectedTeacher === (teacher.username || teacher.id)}
                            onChange={() => setSelectedTeacher(teacher.username || teacher.id)}
                            disabled={loading}
                          />
                          <span style={{ marginLeft: 8 }}>
                            {teacher.name || teacher.username} (Can teach: {Array.isArray(teacher.canTeach) ? teacher.canTeach.join(', ') : teacher.canTeach})
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            {/* Step 3: Send request */}
            <div>
              <button
                className="request-incharge-button"
                disabled={selectedSlots.length === 0 || !selectedTeacher || loading}
                onClick={handleSendRequest}
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
            {/* Success/Error message */}
            {message && <div style={{ color: 'green', marginTop: '1rem' }}>{message}</div>}
            {error && <div style={{ color: 'red', marginTop: '1rem' }}>{error}</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default RequestIncharge; 