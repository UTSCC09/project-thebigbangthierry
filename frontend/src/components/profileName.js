import { Avatar } from "@mui/material";

export function ProfileName(props) {
  console.log(props); 
  const user = props.user?  props.user : null;  
  return (
    <div style={{display: 'flex', fontSize: "1.5vw"}}>
      <Avatar />
      <label> {"testing"} </label> 
    </div>
  ); 
}