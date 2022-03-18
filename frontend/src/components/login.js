import {Box, Paper, TextField , Input} from "@mui/material"; 
import LockIcon from '@mui/icons-material/Lock';
import { Link } from "react-router-dom";

const loginPaper={padding: 20, height: '75%' , width: '40vw', margin:"20px auto"};

export function Login() {
  return (
    <Box
    sx={{
      textAlign: "center",
    }}>
      <Paper elevation={10} style={loginPaper}>
        <LockIcon fontSize="large"/>
        <h1> Login </h1>
        <TextField id="username" label="Username" variant="standard" fullWidth/>
        <TextField id="password" label="Password" variant="standard" fullWidth />
        <div>
          <Input label="Login" type="submit"> Login </Input> 
          <Link to="/signup"> Create an Account </Link>
        </div> 
      </Paper>
    </Box>
  );
}

