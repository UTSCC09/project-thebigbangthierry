import {Container, InputAdornment, Paper, TextField, Box, IconButton, Snackbar} from "@mui/material"; 
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import Cookies from "js-cookie";
import { gql } from "apollo-boost";
import { ProfileName } from "./profileName";

const ADD_FOLLOWER = gql`
  mutation AddFollower($username1: String!, $username2: String!, $profilePicture: String!) {
    addToFollowerList(username1: $username1, username2: $username2, profilePicture: $profilePicture) {
      username
    }
  }
  `;

export function AddFollowers() {
  const [addNotif, setAddNotif] = useState(false); 
  const [notifMsg, setNotifMsg] = useState(" "); 

  // console.log(props);  
  const displayNotif = () => {
    setAddNotif(true);
  }; 
  const closeNotif = () => {
    setAddNotif(false); 
  }
  const changeMsg = (msg) => {
    setNotifMsg(msg); 
  }; 

  const [addFollower] = useMutation(ADD_FOLLOWER, {
    onCompleted: () => {
      changeMsg("Followed successfully");
      displayNotif(); 
    },
    onError: (error) => {
      changeMsg(error.message); 
      displayNotif();
    }
  });
  const handleSubmit = (targetUser) => {
    const curr_user = Cookies.get("username"); 
    const profilePic = ""; 
    if (curr_user) {
      addFollower({ variables: { username1: targetUser, username2: curr_user, profilePicture: profilePic } }); 
    }
  } 
  const users = [
  {
    username: 'test'
  }
  ,
  {
    username: 'test2'
  }]; 
  
  return (
    <Box>
      <Container maxWidth="sm">
        <Paper>
        <TextField
          id="search bar"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          variant="standard"
          fullWidth
        />
        </Paper>
        <Paper>
          {users.map((user, index)=> {
            return (
              <Box key={index} sx={{display: 'flex', padding: "10px"}}>
                  <Box sx={{width: 500}}><ProfileName user={user} picSize="10vh"/> </Box>
                  <IconButton onClick={() => handleSubmit(user.username)} sx={{width: '10vh' , height: '10vh' }}> <PersonAddIcon/> </IconButton>        
              </Box>
            );
          })}
        </Paper>
      </Container>
      <Snackbar open={addNotif} onClose={closeNotif} autoHideDuration={2000} message={notifMsg} />
    </Box>
  );
}
