import React, { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import { useParams } from 'react-router-dom';

const ReviewRequests = () => {
  const { username } = useParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // requestId being acted on
  const [message, setMessage] = useState('');

  // Fetch incoming requests
  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`http://localhost:5000/GetInchargeRequests?username=${encodeURIComponent(username)}`);
        if (!res.ok) throw new Error('Failed to fetch requests');
        const data = await res.json();
        setRequests(Array.isArray(data.requests) ? data.requests : []);
      } catch (err) {
        setError('Failed to load requests.');
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [username, message]);

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
      setMessage(`Request ${response === 'accept' ? 'accepted' : 'declined'} successfully!`);
    } catch (err) {
      setError('Failed to respond. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="request-incharge-container">
      <Sidebar onSectionChange={() => {}} />
      <div className="request-incharge-content">
        <h2 className="request-incharge-title">Review Incharge/Swap Requests</h2>
        {loading ? (
          <div>Loading requests...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : requests.length === 0 ? (
          <div>No incoming requests.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {requests.map((req) => (
              <li key={req.requestId} style={{ marginBottom: '1.5rem', border: '1px solid #eee', borderRadius: 8, padding: 16 }}>
                <div><b>From:</b> {req.fromTeacherName || req.fromTeacher}</div>
                <div><b>Requested Slots:</b>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {Array.isArray(req.slots) && req.slots.length > 0 ? req.slots.map((slot, idx) => (
                      <li key={idx}>{slot.day}, {slot.time} ({slot.course})</li>
                    )) : <li>No slot details</li>}
                  </ul>
                </div>
                <div style={{ marginTop: 12 }}>
                  <button
                    className="request-incharge-button"
                    style={{ marginRight: 12 }}
                    disabled={actionLoading === req.requestId}
                    onClick={() => handleRespond(req.requestId, 'accept')}
                  >
                    {actionLoading === req.requestId ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    className="request-incharge-button"
                    style={{ background: '#b22222' }}
                    disabled={actionLoading === req.requestId}
                    onClick={() => handleRespond(req.requestId, 'decline')}
                  >
                    {actionLoading === req.requestId ? 'Processing...' : 'Decline'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {message && <div style={{ color: 'green', marginTop: '1rem' }}>{message}</div>}
      </div>
    </div>
  );
};

export default ReviewRequests; 