import {Box, Avatar, IconButton } from "@mui/material"; 
import {useWindowSize} from "../utils/windowSize";
// import { useQuery } from "@apollo/react-hooks";
// import { gql } from "apollo-boost";



const users = [
  {
    username: 'john',
    email: 'john@email.com',
    profilePicture:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1700&q=80',
  },
  {
    username: 'jane',
    email: 'jane@email.com',
    profilePicture:
      'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2190&q=80',
  },
  {
    username: 'boss',
    email: 'boss@email.com',
    profilePicture:
      'https://images.unsplash.com/photo-1566753323558-f4e0952af115?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2122&q=80',
  },
];

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

// const GET_USERS = gql`
//   query getUsers {
//     getUsers {
//       username
//       createdAt
//       imageUrl
//       latestMessage {
//         uuid
//         from
//         to
//         content
//         createdAt
//       }
//     }
//   }`; 

export function ChattingUsers(props) {
  const size = useWindowSize();
  const selected = props.selected; 
  
  // const { loading, data, error } = useQuery(GET_USERS);


  return (
    <div>
      {users.map((user)=> {
        return (
          <Box key={user.username} sx={selected === user.username? selectedStyle : unselectedStyle}>
            <IconButton onClick={()=> props.setSelected(user.username)}> <Avatar src={user.profilePicture} sx={{width:'8vh', height: '8vh', cursor: 'pointer'}} />  </IconButton>
            {size.width > 700?  
              <div style={{fontSize: '2vmin', paddingLeft: 5}}>
              <p> <b> {user.username}</b>  </p>
              <p> {user.latestMessage? user.latestMessage.content : 'You are now connected!'} </p>
            </div> 
            : null }
          </Box>      
        );
      })}
    </div>
  );
}