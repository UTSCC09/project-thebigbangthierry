import React from "react"; 
import {  Box, Container} from "@mui/material";
import {useState, useEffect} from "react"; 
import Video from "twilio-video"; 
import VideoParticipant from "./videoParticpant"; 

const buttonStyle = { 
  backgroundColor: '#002f65', 
  border: '3px solid white ', 
  color: 'white', 
  cursor: 'pointer', 
  padding: 10, 
  right: '10vw',
  position: 'absolute',
}; 
// Code of room follows similarly to this guide: 
//https://www.twilio.com/blog/video-chat-react-hooks

export default function VideoRoom({setFull, token, roomName, leaveRoom}) {
  const [room, setRoom] = useState(null);   
  const [participants, setParticipants] = useState([]); 

  const remoteParticipants = participants.map(participant => {
    return  (
      <VideoParticipant key={participant.sid} participant={participant}/> 
   );
  })
  
  useEffect(() => {
    const participantConnected = participant => {
      setParticipants(prevParticipants => [...prevParticipants, participant]);
    };
    const participantDisconnected = participant => {
      setParticipants(prevParticipants =>
        prevParticipants.filter(p => p !== participant)
      );
    };
    Video.connect(token, {
      name: roomName
    }).then(room => {
      setRoom(room);
      room.on('participantConnected', participantConnected);
      room.on('participantDisconnected', participantDisconnected);
      room.participants.forEach(participantConnected);
    })
    .catch((err) => {
      console.log(err); 
      setFull(); 
    });
    return () => {
      setRoom(currentRoom => {
        if (currentRoom && currentRoom.localParticipant.state === 'connected') {
          currentRoom.localParticipant.tracks.forEach(function(trackPublication) {
            trackPublication.track.stop();
          });
          currentRoom.disconnect();
          return null;
        } else {
          return currentRoom;
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName, token]);

  return (
    <Box sx={{ height: '100vh',backgroundColor: '#002f65', color: 'white' ,}}>
      <Container sx={{paddingTop: '2vh'}}>
      <h1 style={{textAlign: 'center'}}> Welcome to Room : {roomName} </h1>
      <button style={buttonStyle} onClick={leaveRoom}>Leave Room</button>
      <Box sx={{display: 'flex' , justifyContent: 'center', alignItems: 'center'}}>
        {room ? (
           <VideoParticipant
           key={room.localParticipant.sid}
           participant={room.localParticipant}
           self
            />
        ) : (
          ''
        )}

      {remoteParticipants}
      </Box>
      </Container>
    </Box>
  ); 
}