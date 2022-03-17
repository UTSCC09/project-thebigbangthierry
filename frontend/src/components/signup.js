import {Box, Paper, TextField , Input} from "@mui/material"; 
import { useForm, Controller } from "react-hook-form";
import {useRef} from "react"; 
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const signUpPaper={padding: 20, height: '75%' , width: '40vw', margin:"20px auto"};

export function Signup() {
  const { handleSubmit, control, watch } = useForm();
  const onSubmit = data => console.log(data);
  const password = useRef({}); 
  password.current = watch("password", "");  
  const signupOptions = [
    {
      id: "fullName", 
      key: "fullName", 
      label: "Full Name", 
      type: "text"
    },
    {
      id: "email", 
      key: "email", 
      label: "Email Address",
      type: "text", 
      pattern: /^[A-Za-z0-9._%+-]+@[mail.utoronto.ca|utoronto.ca|alum.utoronto.ca|alumni.utoronto.ca]/g , 
      patternmessage: "The email must be in the following domains: mail.utoronto.ca, utoronto.ca, alum.utoronto.ca, alumni.utoronto.ca"
    },
    {
      id: "username",
      key: "username", 
      label: "Username",
      type: "text",  
    },
    {
      id: "password",
      key: "password" , 
      label: "Password", 
      type: "password" ,
      pattern: /^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8}/,
      patternmessage: "The password must be at least 8 characters long and contain at least 1 capital letter , number and special character"
    },
    {
      id: "confirmPass",
      key: "confirmPass", 
      label: "Confirm Password",
      type: "password",
      validate: value => value === password.current || "The passwords do not match"
    }
  ]

  return (
    <Box 
    sx={{
      textAlign: 'center',
      display: 'flex',
      backgroundColor: '#002f65',
      backgroundSize: 'cover', 
      minHeight: '100%', 
    }}>
      <Paper elevation={10} style={signUpPaper}>
        <AccountCircleIcon fontSize="large"/>
        <h1> Sign up </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          {signupOptions.map((option) => {
            return (
              <Controller 
               key={option.id} 
               name={option.id} 
               control={control} 
               defaultValue="" 
               render={({ field: {onChange, value}, fieldState: {error}}) => (
                <TextField 
                 variant="standard" 
                 {...option} 
                 onChange={onChange}
                 error={!!error} 
                 value={value}
                 helperText={error? error.message : null} 
                 margin="normal" 
                 fullWidth
                 /> 
               )} 
               rules={{
                 required: option.label + ' required', 
                 pattern: {value: option.pattern , message: option.patternmessage }, 
                 validate: option.validate
                }}
            /> )
          })}
          <Input type="submit"/>
        </form>
      </Paper>
    </Box>
  );
}
