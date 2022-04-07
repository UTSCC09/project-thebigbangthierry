import {TextField, InputAdornment, IconButton, Input} from "@mui/material"; 
import PostAddIcon from '@mui/icons-material/PostAdd';
import {useForm} from "react-hook-form"; 
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import React, {useState} from "react"; 
import SendIcon from '@mui/icons-material/Send';
import AuthService from "../services/auth.service";
import { api_base } from "../config";


export default function PostForm({getPost, resetPage, page}) {
  const { register ,handleSubmit, reset } = useForm();
  const [uploaded, setUploaded] = useState(false);
  const username = AuthService.getCurrentUser(); 
  const token = AuthService.getToken(); 
  const [postError, setPostError] = useState(false); 
  const [errMessage, setErrMessage] = useState(''); 

  const submitPost = (newData) => {
    const formData = new FormData(); 
    formData.append( 'image', newData.postPicture[0])      
    formData.append('username', username); 
    formData.append('textContent', newData.content); 
    fetch(api_base + "/createPost", {
      method: "POST",
      headers: new Headers({
        'authorization': 'Bearer ' + token,
      }),
      body: formData
    })
    .then((res) => {
      if (res.ok) {
        reset({ 
          content: '', 
          postPicture: null, 
        })
        setUploaded(false); 
        setPostError(false); 
        resetPage(); 
        getPost({variables: {username: username, pageIndex: page}}); 
      }
      else {
        throw res.json();
      }
    })
    .catch(err => {
      if (err) {
        setPostError(true);
        setErrMessage("Post needs to have some text or upload an image"); 
      }
    })
  };

  return (
    <div style={{position: 'relative'}}> 
      <form onSubmit={handleSubmit(submitPost)}>   
        <TextField
            id="post-form"
            placeholder="Post something"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" >
                  <PostAddIcon/> 
                </InputAdornment>
              ),
            }}
            variant="outlined"
            fullWidth
            {...register("content")}
          />
          <div style={{display: 'flex', justifyContent:'flex-end'}}>  
            <label htmlFor="upload-photo">
                {uploaded? <label> Uploaded </label> : null }
                <Input  {...register("postPicture", { onChange: () => setUploaded(true) })} sx={{display:'none'}} id="upload-photo" type="file"/> 
                <IconButton sx={{width: '50px' , height: '50px'}} component="span"> <PersonAddIcon/> </IconButton>
            </label>
            <IconButton sx={{color: '#002f65'}}type="submit"> <SendIcon/> </IconButton>
          </div>
        </form>
        {postError? <p style={{color: "red"}}> {errMessage} </p>: null }
      </div>
  ) ; 
}