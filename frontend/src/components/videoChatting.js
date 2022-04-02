import React, { useState , useCallback} from 'react'; 
import VideoRoom from './videoRoom'; 
import VideoLobby from './videoLobby';
import AuthService from '../services/auth.service';

export function VideoChatting () {
  const [roomName, setRoomName] = useState(null);
  const [token, setToken] = useState('');
  const username = AuthService.getCurrentUser()?.username; 

  const handleRoomName = (event) => {
    setRoomName(event.target.value); 
  }

  const handleSubmit = useCallback(async event => {
    event.preventDefault();
    const data = await fetch('/video/token', {
      method: 'POST',
      body: JSON.stringify({
        identity: username,
        room: roomName
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.json());
    setToken(data.token);
  }, [roomName]);

  const leaveRoom = useCallback(event => {
    setToken(null);
  }, []);


  let render; 
  if (token) {
    render =  <VideoRoom username={username} token={token} roomName={roomName} leaveRoom={leaveRoom}/> 
  }
  else {
    render = <VideoLobby handleSubmit={handleSubmit} handleRoomName={handleRoomName}/>
  }
  return render; 
}
