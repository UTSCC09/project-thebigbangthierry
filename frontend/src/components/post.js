import {Box, Avatar} from "@mui/material"

export default function Post(props) {
  const post = props.post; 
  
  return (
    <Box key={post.username} sx={{ padding: '1vh'}} >                      
      <Box sx={{display:'flex', alignItems: 'center'}}>
      <Avatar src={post.profilePicture}/> 
      <div style={{ paddingLeft: '0.5vw',  fontSize:"1.5vmin"}}> 
        <p> {post.username} </p>
        <p> {post.timePosted} </p>
      </div>
      </Box>
      <p> {post.content }</p>
    </Box>
  );
}