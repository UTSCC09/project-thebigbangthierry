import { Button } from '@mui/material';
import React, { useState, useEffect, useRef } from 'react';

const VideoParticipant = ({ participant , self }) => {
  const [videoTracks, setVideoTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);
  const [mute, setMute] = useState(true); 
  
  const videoRef = useRef(); 
  const audioRef= useRef(); 

  const trackpubsToTracks = trackMap => Array.from(trackMap.values())
  .map(publication => publication.track)
  .filter(track => track !== null);

  useEffect(() => {
    const trackSubscribed = track => {
      if (track.kind === 'video') {
        setVideoTracks(videoTracks => [...videoTracks, track]);
      } else {
        setAudioTracks(audioTracks => [...audioTracks, track]);
      }
    };

    const trackUnsubscribed = track => {
      if (track.kind === 'video') {
        setVideoTracks(videoTracks => videoTracks.filter(v => v !== track));
      } else {
        setAudioTracks(audioTracks => audioTracks.filter(a => a !== track));
      }
    };

    setVideoTracks(trackpubsToTracks(participant.videoTracks));
    setAudioTracks(trackpubsToTracks(participant.audioTracks));

    participant.on('trackSubscribed', trackSubscribed);
    participant.on('trackUnsubscribed', trackUnsubscribed);

    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      participant.removeAllListeners();
    };
  }, [participant]);

  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach();
      };
    }
  }, [videoTracks]);

  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach();
      };
    }
  }, [audioTracks]);

  return (
    <div style={{ display: 'flex' , justifyContent: 'center', flexDirection: 'column'}}>
      <div style={{ display: 'flex' }}>
        <h3>{participant.identity}</h3>
        {self ? 
          <div style={{paddingLeft: '30vw', alignSelf: 'flex-end'}}>
            <Button sx={{color: 'white'}} onClick={() => setMute(!mute)}> {mute? 'Unmute' : 'Mute'}  </Button>
          </div>
          : null }
      </div>
      
      <video style={{height: '30vw', width: 'auto', paddingRight: '5vw'}} muted ref={videoRef} autoPlay={true}/> 
      <audio ref={audioRef} autoPlay={true} muted={mute} />
    </div>
  );
};

export default VideoParticipant;