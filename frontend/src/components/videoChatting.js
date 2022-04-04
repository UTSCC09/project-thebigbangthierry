import React, { useState , useCallback} from 'react'; 
import VideoRoom from './videoRoom'; 
import VideoLobby from './videoLobby';
import AuthService from '../services/auth.service';
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

const GET_ROOM = gql` 
  mutation JoinVideoCallRoom($username: String!, $videoRoomName: String!) {
    joinVideoCallRoom(username: $username, videoRoomName: $videoRoomName) {
      token
    }
  }
`;

export function VideoChatting () {
  const [roomName, setRoomName] = useState(null);
  const [token, setToken] = useState('');
  const username = AuthService.getCurrentUser(); 
  const [fullRoom, setFullRoom] = useState(false); 

  const [getRoom] = useMutation(GET_ROOM, {
    onCompleted: data =>  setToken(data.joinVideoCallRoom.token) ,
    onError: (err) => console.log(err), 
  }); 

  const handleRoomName = (event) => {
    setRoomName(event.target.value); 
  }

  const handleSubmit = useCallback(async event => {
    event.preventDefault();
    getRoom({variables: {username: username, videoRoomName: roomName}}); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomName]);

  const leaveRoom = useCallback(event => {
    setToken(null);
  }, []);

  const setFull = () => {
    setFullRoom(true); 
  }

  let render; 
  if (token && !fullRoom) {
    render =  <VideoRoom  setFull={setFull} token={token} roomName={roomName} leaveRoom={leaveRoom}/> 
  }
  else {
    render = <VideoLobby fullRoom={fullRoom} handleSubmit={handleSubmit} handleRoomName={handleRoomName}/>
  }
  return render; 
}
