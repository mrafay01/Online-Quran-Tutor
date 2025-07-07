import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const AGORA_APP_ID = "cd14423fdd0849a8a685e966616d0756";

const VideoCallContext = createContext();

export function useVideoCall() {
  return useContext(VideoCallContext);
}

function TeacherRatingModal({ open, onClose, pendingRating }) {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!open || !pendingRating) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/teacher-rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: pendingRating.sessionId,
          teacherId: pendingRating.teacherId,
          studentId: pendingRating.studentId,
          ratingValue: rating,
        }),
      });
      if (!res.ok) throw new Error('Failed to submit rating');
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (e) {
      setError('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="teacher-rating-modal-overlay">
      <div className="teacher-rating-modal">
        <h3>Rate Your Teacher</h3>
        <div className="star-rating-row">
          {[1,2,3,4,5].map(star => (
            <button
              key={star}
              className={`star-btn${rating >= star ? ' selected' : ''}`}
              onClick={() => setRating(star)}
              disabled={submitting}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="18,3 22.09,13.26 33,14.27 24.5,21.97 26.18,33 18,27.4 9.82,33 11.5,21.97 3,14.27 13.91,13.26" fill={rating >= star ? '#FFD700' : '#e2e8f0'} stroke="#FFD700" strokeWidth="1.5"/>
              </svg>
            </button>
          ))}
        </div>
        <button
          className="submit-rating-btn"
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </button>
        {error && <div className="rating-error">{error}</div>}
        {success && <div className="rating-success">Thank you for your feedback!</div>}
      </div>
    </div>
  );
}

export function VideoCallProvider({ children }) {
  const [callActive, setCallActive] = useState(false);
  const [callInfo, setCallInfo] = useState(null); // { channel, username, token, role, slotId, sessionId }
  const [agoraClient, setAgoraClient] = useState(null);
  const [audioTrack, setAudioTrack] = useState(null);
  const [videoTrack, setVideoTrack] = useState(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [joined, setJoined] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [pendingRating, setPendingRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Start a call globally
  const startCall = useCallback(async ({ channel, username, token, role, slotId, sessionId }) => {
    setCallInfo({ channel, username, token, role, slotId, sessionId });
    setCallActive(true);
    // Optionally: notify backend that call has started
  }, []);

  // End the call globally
  const endCall = useCallback(async () => {
    let askForRating = false;
    let ratingInfo = null;
    if (callInfo && callInfo.sessionId) {
      try {
        const res = await fetch('http://localhost:5000/api/video-call/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: callInfo.sessionId,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.askForRating && callInfo.role === 'student') {
            askForRating = true;
            ratingInfo = {
              sessionId: data.sessionId,
              teacherId: data.teacherId,
              studentId: data.studentId,
            };
          }
        }
      } catch (e) {
        // Optionally handle error
      }
    }
    if (agoraClient) await agoraClient.leave();
    if (audioTrack) audioTrack.close();
    if (videoTrack) videoTrack.close();
    setCallActive(false);
    setCallInfo(null);
    setAgoraClient(null);
    setAudioTrack(null);
    setVideoTrack(null);
    setAudioMuted(false);
    setVideoMuted(false);
    setJoined(false);
    if (askForRating && ratingInfo) {
      setPendingRating(ratingInfo);
      setShowRatingModal(true);
    }
  }, [agoraClient, audioTrack, videoTrack, callInfo]);

  const value = {
    callActive,
    callInfo,
    startCall,
    endCall,
    localVideoRef,
    remoteVideoRef,
    agoraClient,
    setAgoraClient,
    audioTrack,
    setAudioTrack,
    videoTrack,
    setVideoTrack,
    audioMuted,
    setAudioMuted,
    videoMuted,
    setVideoMuted,
    joined,
    setJoined,
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
      {callActive && <VideoCallBox />}
      <TeacherRatingModal
        open={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        pendingRating={pendingRating}
      />
    </VideoCallContext.Provider>
  );
}

// VideoCallBox component (global, always rendered if callActive)
function VideoCallBox() {
  const {
    callInfo, agoraClient, setAgoraClient, audioTrack, setAudioTrack, videoTrack, setVideoTrack,
    audioMuted, setAudioMuted, videoMuted, setVideoMuted, joined, setJoined, endCall,
    localVideoRef, remoteVideoRef
  } = useVideoCall();

  React.useEffect(() => {
    if (!callInfo) return;
    let client = null;
    let _audioTrack = null;
    let _videoTrack = null;
    const startAgora = async () => {
      try {
        client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        setAgoraClient(client);
        await client.join(AGORA_APP_ID, callInfo.channel, callInfo.token || null, callInfo.username);
        // For parent role, do not create or publish local tracks
        if (callInfo.role === 'parent') {
          // Only subscribe to remote streams, do not publish
          setJoined(true);
          client.on('user-published', async (user, mediaType) => {
            await client.subscribe(user, mediaType);
            if (mediaType === 'video' && remoteVideoRef.current) {
              user.videoTrack.play(remoteVideoRef.current);
            }
            if (mediaType === 'audio') {
              user.audioTrack.play();
            }
          });
          client.on('user-unpublished', (user, mediaType) => {
            if (mediaType === 'video' && remoteVideoRef.current) {
              remoteVideoRef.current.innerHTML = '';
            }
          });
          return;
        }
        try {
          [_audioTrack, _videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        } catch (err) {
          try {
            _audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          } catch (audioErr) {
            return;
          }
        }
        setAudioTrack(_audioTrack);
        setVideoTrack(_videoTrack);
        if (localVideoRef.current && _videoTrack) {
          _videoTrack.play(localVideoRef.current);
        }
        if (_audioTrack && _videoTrack) {
          await client.publish([_audioTrack, _videoTrack]);
        } else if (_audioTrack) {
          await client.publish([_audioTrack]);
        }
        setJoined(true);
        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'video' && remoteVideoRef.current) {
            user.videoTrack.play(remoteVideoRef.current);
          }
          if (mediaType === 'audio') {
            user.audioTrack.play();
          }
        });
        client.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video' && remoteVideoRef.current) {
            remoteVideoRef.current.innerHTML = '';
          }
        });
      } catch (err) {
        return;
      }
    };
    startAgora();
    return () => {
      if (client) client.leave();
      if (_audioTrack) _audioTrack.close();
      if (_videoTrack) _videoTrack.close();
      setAudioTrack(null);
      setVideoTrack(null);
      setJoined(false);
    };
    // eslint-disable-next-line
  }, [callInfo]);

  const handleToggleAudio = async () => {
    if (audioTrack) {
      if (audioMuted) {
        await audioTrack.setEnabled(true);
        setAudioMuted(false);
      } else {
        await audioTrack.setEnabled(false);
        setAudioMuted(true);
      }
    }
  };

  const handleToggleVideo = async () => {
    if (videoTrack) {
      if (videoMuted) {
        await videoTrack.setEnabled(true);
        setVideoMuted(false);
      } else {
        await videoTrack.setEnabled(false);
        setVideoMuted(true);
      }
    }
  };

  return (
    <div className="video-call-container-global"> {/* Style this in CSS for bottom-right, non-fixed positioning */}
      <div className="video-call-header">Video Call In Progress</div>
      <div className="video-streams">
        <div ref={localVideoRef} className={`video-box${audioMuted ? ' muted' : ''}`}>Local Video</div>
        <div ref={remoteVideoRef} className="video-box">Remote Video</div>
      </div>
      <div className="video-call-controls">
        <button className="video-call-btn" onClick={handleToggleAudio}>
          {audioMuted ? (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6}}><path d="M3 3L17 17" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round"/><path d="M7 7V10C7 11.6569 8.34315 13 10 13C10.5304 13 11.0391 12.7893 11.4142 12.4142M13 10V7C13 5.34315 11.6569 4 10 4C9.20435 4 8.44129 4.31607 7.87868 4.87868" stroke="#2d3748" strokeWidth="2" strokeLinecap="round"/><path d="M5 10V7C5 3.68629 7.68629 1 11 1C14.3137 1 17 3.68629 17 7V10C17 13.3137 14.3137 16 11 16C9.34315 16 8 14.6569 8 13" stroke="#2d3748" strokeWidth="2" strokeLinecap="round"/></svg>
              Unmute
            </> 
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6}}><path d="M10 4C7.23858 4 5 6.23858 5 9V11C5 13.7614 7.23858 16 10 16C12.7614 16 15 13.7614 15 11V9C15 6.23858 12.7614 4 10 4Z" stroke="#2d3748" strokeWidth="2"/><rect x="7" y="7" width="6" height="6" rx="3" fill="#38d39f"/></svg>
              Mute
            </>
          )}
        </button>
        <button className="video-call-btn" onClick={handleToggleVideo} disabled={!videoTrack}>
          {videoMuted ? (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6}}><rect x="3" y="6" width="14" height="8" rx="2" stroke="#2d3748" strokeWidth="2"/><path d="M17 8L19 6V14L17 12" stroke="#e53e3e" strokeWidth="2" strokeLinecap="round"/></svg>
              Hide Video
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6}}><rect x="3" y="6" width="14" height="8" rx="2" stroke="#2d3748" strokeWidth="2"/><path d="M17 8L19 6V14L17 12" stroke="#38d39f" strokeWidth="2" strokeLinecap="round"/></svg>
              Show Video
            </>
          )}
        </button>
        <button className="video-call-btn danger" onClick={endCall}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 6}}><rect x="3" y="9" width="14" height="2" rx="1" fill="#fff"/><rect x="3" y="9" width="14" height="2" rx="1" fill="#e53e3e"/></svg>
          Leave Call
        </button>
      </div>
    </div>
  );
} 