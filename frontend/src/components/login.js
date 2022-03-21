import {Box, Paper, TextField , Input, Button} from "@mui/material"; 
import LockIcon from '@mui/icons-material/Lock';
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

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

export function Login(props) {
  const {register, handleSubmit} = useForm();
  const onSubmit = data =>{
    // console.log(data); 
    props.handleLogin(data); 
  }; 

  return (
    <Box sx={loginBoxStyle}>
      <Paper elevation={10} style={loginPaper}>
        <LockIcon fontSize="large"/>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1> Login </h1>
          <TextField id="username" label="Username" variant="standard" fullWidth {...register('username')}/>
          <TextField id="password" label="Password" type="password" variant="standard" fullWidth {...register('password')} />
          <Box sx={{ display: 'flex' , flexDirection: 'column'}}>
            <label htmlFor="submit-login">
              <Input value="Login" type="submit" id="submit-login" sx={{ display: 'none'}}/>
              <Button sx={{margin: '10px'}} variant="outlined " component="span"> Login </Button>
            </label>  
            <Link to="/signup"> Create an Account </Link>
          </Box>  
        </form>
        {props.loginError? <div style={{color: "red"}}> The username or password is wrong </div>: null} 
      </Paper>
    </Box>
  );
}

