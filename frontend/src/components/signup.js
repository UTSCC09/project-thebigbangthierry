import {Box, Paper, TextField , Input, IconButton, Button} from "@mui/material"; 
import { useForm, Controller } from "react-hook-form";
import {useRef, useState} from "react"; 
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

/*** SOURCES THAT NEEDED TO BE CREDITED ***/
/***
 * For file upload:  https://stackoverflow.com/questions/69485737/upload-file-using-react-hook-form-in-version-7 
 * For Text field:  https://levelup.gitconnected.com/using-react-hook-form-with-material-ui-components-ba42ace9507a
 * For Confirm Password: https://codesandbox.io/s/react-hook-form-password-match-check-standard-validation-eo6en?file=/src/index.js
 * Customization for input : https://kiranvj.com/blog/blog/file-upload-in-material-ui/
***/


const signUpPaper={padding: 20, height: '75%' , width: '40vw', margin:"20px auto"};

export function Signup() {
  const { register ,handleSubmit, control, watch } = useForm();
  const onSubmit = (data) => {
    // console.log(data);
    fetch("https://localhost:4000/signup", {
      method: "POST",
      headers: {
        'Content-type' : " application/json", 
      },
      body: JSON.stringify(data)
    })
    .then(res=> res.json())
  }
  const [uploaded, setUploaded] = useState(false); 
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
          <label htmlFor="upload-photo">
            <Input  {...register("profilePicture", { onChange: (e) => setUploaded(true) })} sx={{display:'none'}} id="upload-photo" type="file"/> 
            <IconButton size="large" component="span"> <PersonAddIcon/> </IconButton>
            {uploaded? <label> Uploaded </label> : null }
          </label>

          <TextField label="About" variant="standard" multiline maxRows={5} {...register("about")} fullWidth/> 

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
               rules={option.id==="confirmPass" ? {
                  required: "Please confirm your password",
                  validate: value => value === password.current || "The passwords do not match"
                }:
                {
                  required: option.label + ' required', 
                  pattern: {value: option.pattern , message: option.patternmessage }, 
                }
              }
            /> )
          })}
          <label htmlFor="submit-signup">
            <Input value="Signup" type="submit" id="submit-signup" sx={{ display: 'none'}}/>
            <Button sx={{margin: '10px'}} variant="outlined " component="span"> Sign Up </Button>
          </label>
          
        </form>
      </Paper>
    </Box>
  );
}
