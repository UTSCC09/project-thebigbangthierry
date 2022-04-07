import React from "react"; 
import {Box, Avatar, Paper, IconButton, Snackbar, Menu, MenuItem, Button} from "@mui/material"
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import AuthService from "../services/auth.service";
import {useEffect, useState} from "react";
import MoreVert from "@mui/icons-material/MoreVert";
import PostComments from "./postComments";

const month = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];

const LIKE_DISLIKE = gql`
  mutation likedislike($username: String!, $postId: ID!, $action: String!) {
    updatePostLikesDislikes (username: $username, postId: $postId, action: $action ) {
      likeCount
      dislikeCount
    }
  }
`; 

export default function Post(props) {
  const post = props.post; 
  const profile = props.profile; 
  const username = AuthService.getCurrentUser(); 
  const createdInt = parseInt(post.createdAt); 
  const createdAt  = new Date(createdInt);
  const timeStamp = month[createdAt.getMonth()] + " " + createdAt.getDate() + ", " + createdAt.toLocaleTimeString('en-US');   
  
  const [showComments, setShowComments] = useState(false); 
  const [notifMsg, setNotifMsg] = useState(""); 
  const [openNotif, setOpenNotif] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes.length); 
  const [dislikeCount, setDislikeCount] = useState(post.dislikes.length);
  const [action , setAction] = useState('');  
  const [updateLikeDislike] = useMutation(LIKE_DISLIKE, {
    onCompleted: (data) => {
      setLikeCount(data.updatePostLikesDislikes.likeCount);
      setDislikeCount(data.updatePostLikesDislikes.dislikeCount); 
    },
    onError: () => {
      if (action === "like") {
        setNotifMsg("User has already liked the post"); 
        setOpenNotif(true); 
      }
      else if (action === "dislike"){ 
        setNotifMsg("User has already disliked the post"); 
        setOpenNotif(true);
      }
    }
  }); 
  const handleLike = () => {
    if (post.likes.find(u => u.liker === username)) {
      setNotifMsg("User has already liked the post"); 
      setOpenNotif(true); 
    }
    else {
      setAction("like");
      updateLikeDislike({variables: {username: username, postId: post._id, action: "like"}})
    }
  }
  const handleDislike = () => {
    if (post.dislikes.find(u => u.disliker === username)) {
      setNotifMsg("User has already disliked the post"); 
      setOpenNotif(true); 
    }
    else {
      setAction("dislike");
      updateLikeDislike({variables: {username: username, postId: post._id, action: "dislike"}})
    }
  }
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    props.deletePost({variables: {username: username, postId: post._id}});
  }

  useEffect(() => {
    setLikeCount(post.likes.length);
    setDislikeCount(post.dislikes.length);
  }, [post])

  return (
    <Box key={post.username} sx={{ padding: '1vh'}} >  
    <Paper sx={{padding: 2}}>
      <Box sx={{display:'flex', alignItems: 'center'}}>
        <Avatar src={post.posterProfilePic}/> 
        <div style={{ paddingLeft: '0.5vw',  fontSize:"1.5vmin"}}> 
          <p><b> {post.posterUsername} </b> </p>
          <p> {timeStamp} </p>
        </div>
        {profile ? 
        <div id="delete-post" style={{paddingLeft: '5vw'}}>
          <IconButton onClick={handleClick}> <MoreVert/> </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={handleDelete}>Delete</MenuItem>
          </Menu>
        </div>
        :null }
      </Box>
      <p> {post.textContent }</p>
      {post.image? <img alt="none" style={{width: 'auto', height: '20vh'}}src={post.image}/> : null} 

    </Paper>
    <Paper sx={{display: 'flex', alignItems: 'center'}}>
      <IconButton onClick={handleLike}> <ThumbUpOffAltIcon/> </IconButton>  
      {likeCount} 
      <IconButton onClick={handleDislike}> <ThumbDownOffAltIcon/> </IconButton>  
      {dislikeCount}
      <Button onClick={()=>setShowComments(!showComments)}> {showComments? "Hide Comments" : "Show Comments"} </Button>
    </Paper>
    
    {showComments? 
    <Paper sx={{padding: '2vmin'}}> 
      <PostComments post={post} />
    </Paper> 
    : null}

    <Snackbar open={openNotif} onClose={()=> setOpenNotif(false)} autoHideDuration={2000} message={notifMsg} />
    </Box>
  );
}