import React, { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import { useParams } from 'react-router-dom';
import { DateTime } from 'luxon';
import './ReviewRequests.css';

const ReviewRequests = () => {
  const { username } = useParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // requestId being acted on
  const [message, setMessage] = useState('');
  const [teacherRegions, setTeacherRegions] = useState({});
  const [userRegion, setUserRegion] = useState('');

  // Fetch incoming requests and teacher regions
  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5000/GetInchargeRequests?username=${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error('Failed to fetch requests');
        const data = await res.json();
        const sortedRequests = [...data.requests].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRequests(sortedRequests);
        // Collect all unique fromTeacher and toTeacher usernames
        const teacherUsernames = new Set();
        sortedRequests.forEach(req => {
          if (req.fromTeacher) teacherUsernames.add(req.fromTeacher);
          if (req.toTeacher) teacherUsernames.add(req.toTeacher);
        });
        // Always add the current user (toTeacher)
        teacherUsernames.add(username);
        // Fetch all teacher regions in parallel
        const regions = {};
        await Promise.all(Array.from(teacherUsernames).map(async (teacherUsername) => {
          try {
            const res = await fetch(`http://localhost:5000/api/get_user_region?username=${encodeURIComponent(teacherUsername)}&role=teacher`);
            if (res.ok) {
              const data = await res.json();
              regions[teacherUsername] = data.region || "UTC";
            } else {
              regions[teacherUsername] = "UTC";
            }
          } catch {
            regions[teacherUsername] = "UTC";
          }
        }));
        setTeacherRegions(regions);
        setUserRegion(regions[username] || Intl.DateTimeFormat().resolvedOptions().timeZone);
      } catch (err) {
        setError('Failed to load requests.');
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [username]);

  const handleRespond = async (requestId, response) => {
    setActionLoading(requestId);
    setMessage('');
    setError('');
    try {
      const res = await fetch('http://localhost:5000/RespondInchargeRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, response }),
      });
      if (!res.ok) throw new Error('Failed to respond');
      // Update the status of the request locally
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.requestId === requestId
            ? { ...req, status: response === 'accept' ? 'accepted' : 'declined' }
            : req
        )
      );
      setMessage(`Request ${response === 'accept' ? 'accepted' : 'declined'} successfully!`);
    } catch (err) {
      setError('Failed to respond. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

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

  // Helper to manually convert day based on timezone differences
  function convertDayBasedOnTimezone(originalDay, originalTime, convertedTime, fromZone, toZone) {
    if (!originalDay || !originalTime || !convertedTime || !fromZone || !toZone) {
      return originalDay;
    }

    try {
      // Get timezone offsets
      const fromOffset = DateTime.now().setZone(fromZone).offset;
      const toOffset = DateTime.now().setZone(toZone).offset;
      const gmtDifference = toOffset - fromOffset; // Positive if toZone is ahead

      // Parse original and converted times
      const [originalStart] = originalTime.split(" - ");
      const [convertedStart] = convertedTime.split(" - ");
      
      const originalHour = parseInt(originalStart.split(":")[0], 10);
      const convertedHour = parseInt(convertedStart.split(":")[0], 10);

      console.log('--- Day Conversion Debug ---');
      console.log('Original day:', originalDay);
      console.log('Original time:', originalTime, '(hour:', originalHour, ')');
      console.log('Converted time:', convertedTime, '(hour:', convertedHour, ')');
      console.log('From offset:', fromOffset);
      console.log('To offset:', toOffset);
      console.log('GMT difference:', gmtDifference);

      // Day conversion logic
      let convertedDay = originalDay;
      
      if (gmtDifference > 0) { // ToZone is ahead of fromZone
        if (convertedHour < originalHour) {
          // Converted hours are less than original hours, should be next day
          convertedDay = getNextDay(originalDay);
          console.log('Moving to next day:', convertedDay);
        } else if (convertedHour > originalHour) {
          // Converted hours are higher than original hours, should be previous day
          convertedDay = getPreviousDay(originalDay);
          console.log('Moving to previous day:', convertedDay);
        }
      } else if (gmtDifference < 0) { // ToZone is behind fromZone
        if (convertedHour < originalHour) {
          // Converted hours are less than original hours, should be previous day
          convertedDay = getPreviousDay(originalDay);
          console.log('Moving to previous day:', convertedDay);
        } else if (convertedHour > originalHour) {
          // Converted hours are higher than original hours, should be next day
          convertedDay = getNextDay(originalDay);
          console.log('Moving to next day:', convertedDay);
        }
      }

      console.log('Final converted day:', convertedDay);
      return convertedDay;
    } catch (e) {
      console.log('Day conversion error:', e);
      return originalDay;
    }
  }

  // Helper to get next day
  function getNextDay(currentDay) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const currentIndex = days.indexOf(currentDay);
    const nextIndex = (currentIndex + 1) % 7;
    return days[nextIndex];
  }

  // Helper to get previous day
  function getPreviousDay(currentDay) {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const currentIndex = days.indexOf(currentDay);
    const previousIndex = (currentIndex - 1 + 7) % 7;
    return days[previousIndex];
  }

  return (
    <div className="review-requests-container">
      <Sidebar onSectionChange={() => {}} />
      <div className="review-requests-content">
        <h2 className="review-requests-title">Review Incharge/Swap Requests</h2>
        {loading ? (
          <div>Loading requests...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : requests.length === 0 ? (
          <div>No incoming requests.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {requests.map((req) => {
              const normalizedStatus = req.status === 'accept' ? 'accepted'
                                    : req.status === 'decline' ? 'declined'
                                    : req.status;
              const fromRegion = teacherRegions[req.fromTeacher] || 'UTC';
              const toRegion = teacherRegions[req.toTeacher] || userRegion || 'UTC';
              return (
                <li key={req.requestId} className="request-card">
                  <div className="request-from"><b>From:</b> {req.fromTeacherName || req.fromTeacher}</div>
                  <div className="request-time">
                    Requested at: {new Date(req.createdAt).toLocaleString()}
                  </div>
                  <div className="request-slots-label"><b>Requested Slots:</b></div>
                  <ul className="request-slots-list">
                    {Array.isArray(req.slots) && req.slots.length > 0 ? req.slots.map((slot, idx) => {
                      let displayTime = slot.time;
                      let displayDay = slot.day;
                      if (fromRegion && toRegion && slot.time && /^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/.test(slot.time)) {
                        // Robust DateTime-based conversion
                        const teacherDayIndex = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].indexOf(slot.day);
                        if (teacherDayIndex !== -1) {
                          const refMonday = DateTime.utc(2023, 1, 2);
                          const teacherDate = refMonday.plus({ days: teacherDayIndex });
                          const [h, m] = slot.time.split(":").map(Number);
                          const teacherDT = teacherDate.set({ hour: h, minute: m, second: 0, millisecond: 0 }).setZone(fromRegion, { keepLocalTime: true });
                          const reviewerDT = teacherDT.setZone(toRegion);
                          displayDay = reviewerDT.setLocale('en').toFormat('cccc');
                          displayTime = `${reviewerDT.toFormat("HH:mm")} - ${reviewerDT.plus({ minutes: 60 }).toFormat("HH:mm")}`;
                        }
                      }
                      return (
                        <li key={idx}>
                          {displayDay}, {displayTime}
                          {slot.course && typeof slot.course === 'object'
                            ? ` (${slot.course.courseName})`
                            : slot.course
                              ? ` (${slot.course})`
                              : ''}
                        </li>
                      );
                    }) : <li>No slot details</li>}
                  </ul>
                  <div style={{ marginTop: 12 }}>
                    {normalizedStatus === 'accepted' ? (
                      <span className="request-status accepted">Accepted</span>
                    ) : normalizedStatus === 'declined' ? (
                      <span className="request-status declined">Declined</span>
                    ) : (
                      <>
                        <button
                          className="request-action-btn"
                          disabled={actionLoading === req.requestId}
                          onClick={() => handleRespond(req.requestId, 'accept')}
                        >
                          {actionLoading === req.requestId ? 'Processing...' : 'Accept'}
                        </button>
                        <button
                          className="request-action-btn decline"
                          disabled={actionLoading === req.requestId}
                          onClick={() => handleRespond(req.requestId, 'decline')}
                        >
                          {actionLoading === req.requestId ? 'Processing...' : 'Decline'}
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {message && <div style={{ color: 'green', marginTop: '1rem' }}>{message}</div>}
      </div>
    </div>
  );
};

export default ReviewRequests; 