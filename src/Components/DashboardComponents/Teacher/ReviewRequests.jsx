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
                      if (fromRegion && toRegion && slot.time && /^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/.test(slot.time)) {
                        displayTime = convertTimeRangeBetweenRegions(slot.time, fromRegion, toRegion);
                      }
                      return (
                        <li key={idx}>
                          {slot.day}, {displayTime}
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