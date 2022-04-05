import React from "react"; 
import { Avatar } from "@mui/material";

export function ProfileName(props) {
  // console.log(props);
  const user = props.user?  props.user : null;
  var profilePicture = ""
  if (user) profilePicture =  user.profilePicture ? user.profilePicture : ""; 
  return (
    <div style={{display: 'flex', fontSize: props.fontSize, alignItems: "center"}}>
      <Avatar sx={{width: props.picSize , height: props.picSize }} src={profilePicture}/>
      <label style={{padding: "0.5vw"}}> {user.username} </label> 
    </div>
  ); 
}