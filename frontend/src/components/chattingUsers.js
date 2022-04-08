import React from "react"; 
import {Box, Avatar } from "@mui/material"; 
import {useWindowSize} from "../utils/windowSize";
import { useLazyQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { useMessageDispatch, useMessageState } from "../services/message";
import AuthService from "../services/auth.service";

const unselectedStyle={ 
  display: 'flex', 
  alignItems: 'center', 
  padding: '5px 5px', 
  justifyContent: 'center',
  cursor: 'pointer'
}; 
const selectedStyle={ 
  backgroundColor: 'white', 
  display: 'flex', 
  alignItems: 'center', 
  padding: '5px 5px', 
  justifyContent: 'center',
  cursor: 'pointer'
}; 

const GET_USERS = gql`
query($user: String!) {
  user(username: $user){
    followingList {
      username
      profilePicture
    }
  }
}
`;

export function ChattingUsers(props) {
  const size = useWindowSize();
  const selected = props.selected; 
  const dispatch = useMessageDispatch(); 
  const username = AuthService.getCurrentUser();
  const { users } = useMessageState(); 
  
  const [getUsers, { loading, called }] = useLazyQuery(GET_USERS, {
    variables: {user: username}, 
    onCompleted: (data) => 
      dispatch({type: 'SET_USERS', payload: data.user.followingList}), 
  });

  if (!called) {
    getUsers(); 
  }
  let usersList; 
  if (!users || loading) {
   usersList = <p> Loading ... </p>
  }
  else if (users.length === 0) {
    usersList = <p> no users have been followed </p>
  }
  else if (users.length > 0 ) {
    usersList = users.map((user)=> {
      return (
        <Box  onClick={()=> props.setSelected(user.username)} key={user.username} sx={selected === user.username? selectedStyle : unselectedStyle}>
          <Avatar src={user.profilePicture} sx={{width:'8vh', height: '8vh'}} /> 
          {size.width > 700?  
            <div style={{fontSize: '2vmin', paddingLeft: 5}}>
            <p> <b> {user.username}</b>  </p>
            <p> {user.latestMessage? user.latestMessage.content : 'You are connected!'} </p>
          </div> 
          : null }
        </Box>      
      );
    })
  }
  return (
    <div>
      {usersList}
    </div>
  );
}