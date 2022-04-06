import React from "react"; 
import {ProfileName} from "./profileName"; 

export default function Comment(props) {
  const comment = props.comment;  
  return (
    <div key={comment._id}>
      <ProfileName user={{username: comment.commenter , profilePicture: comment.commenterProfilePic}}/> 
      <p> {comment.commentContent} </p>
    </div>
  );
}