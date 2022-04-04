import {ProfileName} from "./profileName"; 

export default function Comment(props) {
  const comment = props.comment; 
  return (
    <div>
      <ProfileName user={{username: comment.commenter , profilePicture: comment.commenterProfilePic}}/> 
      <p> {comment.commentContent} </p>
    </div>
  );
}