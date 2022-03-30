import {Box, Avatar, IconButton } from "@mui/material"; 
import {useWindowSize} from "../utils/windowSize";
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { useMessageDispatch, useMessageState } from "../services/message";
import AuthService from "../services/auth.service";

// const dummyUsers = [
//   {
//     username: 'john',
//     email: 'john@email.com',
//     profilePicture:
//       'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1700&q=80',
//   },
//   {
//     username: 'jane',
//     email: 'jane@email.com',
//     profilePicture:
//       'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2190&q=80',
//   },
//   {
//     username: 'boss',
//     email: 'boss@email.com',
//     profilePicture:
//       'https://images.unsplash.com/photo-1566753323558-f4e0952af115?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2122&q=80',
//   },
// ];

const unselectedStyle={ 
  display: 'flex', 
  alignItems: 'center', 
  padding: '5px 5px', 
  justifyContent: 'center'
}; 
const selectedStyle={ 
  backgroundColor: 'white', 
  display: 'flex', 
  alignItems: 'center', 
  padding: '5px 5px', 
  justifyContent: 'center'
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
  const username = AuthService.getCurrentUser().username;
  const { users } = useMessageState(); 
  
  const { loading } = useQuery(GET_USERS, {
    variables: {user: username}, 
    onCompleted: (data) => 
      dispatch({type: 'SET_USERS', payload: data.user.followingList}), 
    onError: (err) => console.log(err),
  });

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
        <Box key={user.username} sx={selected === user.username? selectedStyle : unselectedStyle}>
          <IconButton onClick={()=> props.setSelected(user.username)}> <Avatar src={user.profilePicture} sx={{width:'8vh', height: '8vh', cursor: 'pointer'}} />  </IconButton>
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