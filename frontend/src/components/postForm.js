import {TextField, InputAdornment, Button} from "@mui/material"; 
import PostAddIcon from '@mui/icons-material/PostAdd';
import {useState} from "react"; 
import SendIcon from '@mui/icons-material/Send';

export default function PostForm() {
  const [post, setPost] = useState(""); 

  const handleChange = (e) => {
    setPost(e.target.value); 
  };

  const submitPost = () => {
    console.log(post); 
  };

  return (
    <TextField
        id="post-form"
        placeholder="Post something"
        onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start" >
              <PostAddIcon/> 
            </InputAdornment>
          ),
          endAdornment: (
            <Button onClick={submitPost}>
              <SendIcon/> 
            </Button>
          ), 
        }}
        variant="outlined"
        fullWidth
      />
  ) ; 
}