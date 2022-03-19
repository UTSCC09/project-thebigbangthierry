import {Box, Paper, TextField , Input, Button} from "@mui/material"; 
import LockIcon from '@mui/icons-material/Lock';
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";

const loginPaper={padding: 20, height: '75%' , width: '40vw', margin:"20px auto"};

export function Login() {
  const {register, handleSubmit} = useForm();
  const onSubmit = data => console.log(data); 

  return (
    <Box
    sx={{
      textAlign: "center",
    }}>
      <Paper elevation={10} style={loginPaper}>
        <LockIcon fontSize="large"/>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h1> Login </h1>
          <TextField id="username" label="Username" variant="standard" fullWidth {...register("username")}/>
          <TextField id="password" label="Password" variant="standard" fullWidth {...register("password")} />
          <Box sx={{ display: 'flex' , flexDirection: 'column'}}>
            <label htmlFor="submit-login">
              <Input value="Login" type="submit" id="submit-login" sx={{ display: 'none'}}/>
              <Button sx={{margin: '10px'}} variant="outlined " component="span"> Login </Button>
            </label>  
            <Link to="/signup"> Create an Account </Link>
          </Box>  
        </form>
         
      </Paper>
    </Box>
  );
}

