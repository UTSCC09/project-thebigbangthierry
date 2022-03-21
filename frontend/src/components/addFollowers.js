import {Container, InputAdornment, Paper, TextField, Box, Avatar, IconButton, Snackbar} from "@mui/material"; 
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import Cookies from "js-cookie";
import { gql } from "apollo-boost";

const ADD_FOLLOWER = gql`
  mutation AddFollower($username1: String!, $username2: String!, $profilePicture: String!) {
    addToFollowerList(username1: $username1, username2: $username2, profilePicture: $profilePicture) {
      username
    }
  }
  `;

const Result = (user) => { 
  const [addNotif, setAddNotif] = useState(false); 
  const [addFollower] = useMutation(ADD_FOLLOWER);

  const handleSubmit = (targetUser) => {
    const curr_user = Cookies.get("username"); 
    const profilePic = " "; 
    if (curr_user) {
      addFollower({ variables: { username1: targetUser, username2: curr_user, profilePicture: profilePic } }); 
    }
    setAddNotif(true);  
  }

  return (
    <Box sx={{display: 'flex', padding: "10px"}}>
        <Avatar sx={{width: '10vh' , height: '10vh' }}/> 
        <p style={{width: 500}}> {user.username} </p>
        <IconButton onClick={() => handleSubmit(user.username)} sx={{width: '10vh' , height: '10vh' }}> <PersonAddIcon/> </IconButton>        
        {addNotif ? <Snackbar message="Followed!" />: null} 
    </Box>
  );
};

export function AddFollowers() {
 
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
          {users.map((user)=> {
            return (
              <Result key={user.username} username={user.username}/> 
            ); 
          })}
        </Paper>
      </Container>
      
    </Box>
  );
}
