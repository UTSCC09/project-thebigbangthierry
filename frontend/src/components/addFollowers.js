import React from "react"; 
import {InputAdornment,  TextField, Box, IconButton, Snackbar, Button} from "@mui/material"; 
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useState } from "react";
import { useMutation, useLazyQuery } from "@apollo/react-hooks";
import AuthService from "../services/auth.service";
import { gql } from "apollo-boost";
import { ProfileName } from "./profileName";
import SendIcon from '@mui/icons-material/Send';

const ADD_FOLLOWER = gql`
  mutation AddFollower($username1: String!, $username2: String!, $profilePicture: String!) {
    addToFollowerList(username1: $username1, username2: $username2, profilePicture: $profilePicture) {
      username
    }
  }
  `;

const SEARCH_USERS = gql`
  query search($username: String!, $searchContent: String!) {
    searchListUsers(username: $username, searchContent: $searchContent) {
      profilePicture
      username
    }
  }
`;

const BoxStyle = {
  width: '40vw',
};  

export default function AddFollowers(props) {
  const [addNotif, setAddNotif] = useState(false); 
  const [notifMsg, setNotifMsg] = useState(" "); 
  const [search, setSearch] = useState("");
  const [results, setResults] = useState(null); 
  const [searchError, setSearchError] = useState(false); 
  const username = AuthService.getCurrentUser(); 

  const [searchUser] = useLazyQuery(SEARCH_USERS, {
    onCompleted: data => {
      setSearchError(false); 
      setResults(data.searchListUsers);
    }, 
  }); 
  const [addFollower] = useMutation(ADD_FOLLOWER, {
    onCompleted: () => {
      changeMsg("Followed successfully");
      displayNotif(); 
      props.loadProfile();
    },
    onError: (error) => {
      changeMsg(error.message); 
      displayNotif();
    }
  });

  const displayNotif = () => {
    setAddNotif(true);
  }; 
  const closeNotif = () => {
    setAddNotif(false); 
  }
  const changeMsg = (msg) => {
    setNotifMsg(msg); 
  }; 

  const handleSearchValue = (event) => setSearch(event.target.value);  

  const handleSubmit = (targetUser) => {
    const curr_user = AuthService.getCurrentUser(); 
    const profilePic = ""; 
    if (curr_user) {
      addFollower({ variables: { username1: targetUser, username2: curr_user, profilePicture: profilePic } }); 
    }
  } 

  const searchResults = () => {
    if (search.length < 3 ) setSearchError(true); 
    else {
      searchUser({variables: {username: username, searchContent: search}}); 
    } 
  }

  return (
    <div>
    <Box sx={BoxStyle}>
      <TextField
        id="search bar"
        onChange={handleSearchValue}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <Button onClick={searchResults}>
              <SendIcon/> 
            </Button>
          )
        }}
        variant="outlined"
        fullWidth
      />
      {!results ? <p> Search for some users ! </p> 
      : results.length === 0 ? <p> No results found </p> 
      :  results.map((user, index)=> {
        return (
          <Box key={index} sx={{display: 'flex', padding: "10px"}}>
              <Box sx={{width: 500}}><ProfileName user={user} picSize="10vh"/> </Box>
              <IconButton onClick={() => handleSubmit(user.username)} sx={{width: '10vh' , height: '10vh' }}> <PersonAddIcon/> </IconButton>        
          </Box>
        );})
      }
      {searchError ? <p style={{color :'red'}}> Type at least 3 letters </p> : null }
    <Snackbar open={addNotif} onClose={closeNotif} autoHideDuration={2000} message={notifMsg} />
    </Box>
    </div>
  );
}
