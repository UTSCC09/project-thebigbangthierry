import {Box, Paper, TextField , Input, Button} from "@mui/material"; 
import LockIcon from '@mui/icons-material/Lock';
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import React, { useState} from "react"; 
import { useAuthDispatch } from "../services/auth";
import AuthService from "../services/auth.service";

const loginBoxStyle = {
  textAlign: "center",
  backgroundColor: '#002f65',
  height: '100vh',
  paddingTop: '20px', 
}; 
const loginPaper={
  padding: 30, 
  height: '80vh' , 
  width: '40vw', 
  margin: 'auto'
};

export function Login() {
  const {register, handleSubmit} = useForm();
  const [loginError, setLoginError] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAuthDispatch(); 
  const onSubmit = data =>{
    // console.log(data); 
    // props.handleLogin(data); 
    AuthService.login(data)
    .then ((data)=> {
      if (data) {
        // console.log(data);
        dispatch({type: 'LOGIN', payload: data}); 
        navigate("/"); 
      }
      else {
        setLoginError(true);
      }
    })

  }; 

  return (
    <Box sx={loginBoxStyle}>
      <Paper elevation={10} style={loginPaper}>
        <LockIcon fontSize="large"/>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1> Login </h1>
          <TextField id="username" label="Username" variant="standard" fullWidth {...register('username')}/>
          <div style={{paddingTop:"1.5vh"}}><TextField  id="password" label="Password" type="password" variant="standard" fullWidth {...register('password')} /></div>
          <Box sx={{ display: 'flex' , flexDirection: 'column'}}>
            <label htmlFor="submit-login">
              <Input value="Login" type="submit" id="submit-login" sx={{ display: 'none'}}/>
              <Button sx={{margin: '10px'}} variant="outlined " component="span"> Login </Button>
            </label>  
            <Link to="/signup"> Create an Account </Link>
          </Box>  
        </form>
        {loginError? <div style={{color: "red"}}> The username or password is wrong </div>: null} 
      </Paper>
    </Box>
  );
}

