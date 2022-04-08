import {Box, Paper, TextField , Input, Button, IconButton} from "@mui/material"; 
import { useForm, Controller } from "react-hook-form";
import React, {useRef, useState} from "react";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import AuthService from "../services/auth.service";
import {api_base} from "../config"; 

const editProfilePaper={padding: 20, height: '75%' , width: '40vw', margin:"20px auto"};
const EDIT_ABOUT = gql`
  mutation editAbout($username: String!, $about: String! ) {
    editAbout(username: $username, about: $about) {
      username
    }
  }
  `;
const EDIT_FULLNAME = gql`
  mutation editFullName($username: String!, $fullName: String! ) {
    editFullName(username: $username, fullName: $fullName) {
      username
    }
  }
`;
const EDIT_PASSWORD = gql`
  mutation editPassword($username: String!, $password: String! ) {
    editPassword(username: $username, password: $password) {
      username
    }
  }
`;
export default function EditProfile(props) {
  const { register ,handleSubmit, control, watch, setError } = useForm();
  const data = props.data; 
  const username = AuthService.getCurrentUser(); 
  const token = AuthService.getToken(); 
  const [profilePictureError, setProfilePictureError] = useState(false); 
  const [errorMsg, setErrorMsg] = useState(''); 

  const [editAbout] = useMutation(EDIT_ABOUT, {
    onCompleted: () => {
      props.changeMsg("Updated successfully");
      props.displayNotif(); 
      props.loadProfile();
      props.closeEditMode(); 
    }, 
  });
  const [editFullName] = useMutation(EDIT_FULLNAME, {
    onCompleted: () => {
      props.changeMsg("Updated successfully");
      props.displayNotif(); 
      props.loadProfile();
      props.closeEditMode(); 
    }, 
  });
  const [editPassword] = useMutation(EDIT_PASSWORD, {
    onCompleted: () => {
      props.changeMsg("Updated successfully");
      props.displayNotif(); 
      props.loadProfile();
      props.closeEditMode(); 
    },
  });
  const onSubmit = (newData) => {
    if (password.current) {
      if (/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9]).{8}/.test(password.current)) {
        if (password.current === confirmPass.current) {
          editPassword({variables: {username: username , password: (password.current)}}); 
        } 
        else {
          setError("password", {type: "manual", message: "Password does not match"});       
        }
      } 
      else {
        setError("password", {type: "manual", message: "The password must be at least 8 characters long and contain at least 1 capital letter , number and special character"});    
      }
    }
    
    if (newData.about !== data.about) {
      editAbout({variables: {username: username , about: (newData.about)}}); 
    }
    
    if (newData.fullName !== data.fullName) {
      editFullName({variables: {username: username , fullName: (newData.fullName)}}); 
    } 

    if (uploaded) {

      if (newData.profilePicture.length !== 0)  {
        if (newData.profilePicture[0].type === "image/png" || newData.profilePicture[0].type === "image/jpg" || newData.profilePicture[0].type === "image/jpeg") {
          const formData = new FormData(); 
          formData.append( 'profilePicture', newData.profilePicture[0])      
          formData.append("username", username); 
          fetch(api_base + "/editProfilePicture", {
            method: "PUT",
            headers: new Headers({
              'authorization': 'Bearer ' + token,
            }),
            body: formData
          })
          .then((res) => {
            if (res.ok) {
              props.changeMsg("Updated successfully");
              props.displayNotif(); 
              props.loadProfile();
              props.closeEditMode(); 
            }
            else {
              throw res.json();
            }
          })
          .catch(() => {
            setUploaded(false); 
            setProfilePictureError(true); 
            setErrorMsg('file size too large');
          })
        }
        else {
          setUploaded(false); 
          setProfilePictureError(true); 
          setErrorMsg('File must be of type png, jpg or jpeg');
        }
      }
      else {
        setProfilePictureError(true); 
        setErrorMsg('Invalid file uploaded'); 
        setUploaded(false); 
      }
      
    }
  } 

  const [uploaded, setUploaded] = useState(false);
  const password = useRef({}); 
  const confirmPass = useRef({}); 
  password.current = watch("password", "");
  confirmPass.current = watch("confirmPass", "") ;  
  const editProfileOptions = [
    {
      id: "fullName", 
      key: "fullName", 
      label: "Full Name", 
      type: "text",
    },
    {
      id: "password",
      key: "password" , 
      label: "New Password", 
      type: "password" ,
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
      <Paper elevation={10} style={editProfilePaper}>
        <h1> Edit Profile </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label htmlFor="upload-photo">
            <Input  {...register("profilePicture", { onChange: () => {setUploaded(true); setProfilePictureError(false); } })} sx={{display:'none'}} id="upload-photo" type="file"/> 
            <IconButton sx={{width: '50px' , height: '50px'}} component="span"> <PersonAddIcon/> </IconButton>
            {uploaded? <label> Uploaded </label> : null }
            {profilePictureError ? <label style={{color: "red"}}> {errorMsg} </label> : null}
          </label>

          <TextField 
            InputLabelProps={{ shrink: true }} 
            label="About" defaultValue={data.about} 
            variant="outlined" multiline rows={5} 
            {...register("about")} fullWidth
            /> 

          {editProfileOptions.map((option) => {
            return (
              <Controller 
               key={option.id} 
               name={option.id} 
               control={control} 
               defaultValue={data[option.key]}
               render={({ field: {onChange, value}, fieldState: {error}}) => (
                <TextField 
                 InputLabelProps={{ shrink: true }}
                 variant="outlined" 
                 {...option} 
                 onChange={onChange}
                 error={!!error}
                 value={value}
                 helperText={error? error.message : null} 
                 margin="normal" 
                 fullWidth
                 /> 
               )} 
            /> )
          })}
          <Box sx={{display: 'flex'}}> 
            <label htmlFor="submit-signup">
              <Input value="Signup" type="submit" id="submit-signup" sx={{ display: 'none'}}/>
              <Button sx={{margin: '10px'}} variant="outlined " component="span"> Save Changes </Button>
            </label>
            <Button sx={{margin: '10px'}} variant="outlined " component="span" onClick={() => props.closeEditMode()}> Discard Changes </Button>
          </Box>
          
        </form>
      </Paper>
    </Box>
  );
}