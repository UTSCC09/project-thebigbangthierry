import {Box, Paper, Avatar , Button} from "@mui/material"; 
import { useNavigate } from "react-router-dom";
import {useEffect, useState} from "react"; 

const otherInfoElementStyle = {
  fontSize: "1.5vw", 
  width: "20vw", 
  height: "20vh", 
};

const otherInfoStyle = {
  display: "flex" , 
  flexWrap: "wrap" , 
  width: "40vw" ,
  borderRight: "grey 2px solid"
}; 

const aboutPictureStyle = {
  display: 'flex', 
  height: '24 vh', 
  padding:'3vh 2vw', 
  borderBottom: '2px grey solid'
}; 

const backgroundBoxStyle = {
  display: 'flex', 
  justifyContent: "center" ,
  backgroundColor: '#002f65', 
  height: '90vh' , 
  padding:'5vh 0vw'
}; 

const mainBoxStyle = {
  display: 'flex', 
  flexDirection: 'column', 
  alignItems:'center', 
  justifyContent:'center'
};

export function Profile(){
  const [profile, setProfile] = useState({}); 
  const navigate = useNavigate(); 
  useEffect(() => {
    setProfile(
      {
        username: 'test', 
        profilePicture: 'fake image', 
        email: 'test@utoronto.ca', 
        fullName: 'Testing', 
        about: 'This is a fake about description needed for testing purposes. All of the following is using staic dummy data that will be later integrated with backend ', 
      })
  }, []);

  return (
    <Box sx={backgroundBoxStyle}>
        <Paper sx={{width: "75vw" , padding: '2vh'}}>
          <Box sx={mainBoxStyle}>
            <Box id="about-picture" sx={aboutPictureStyle}>
              <div>
                <Avatar sx={{width: '15vh', height: '15vh'}} src={profile.profilePicture}/> 
                <Button sx={{fontSize: "1vw"}} onClick={() => navigate("/profile/edit")}> Edit Profile</Button>
              </div>
              <label style={{padding: "0vh 2vw", fontSize: "1.75vw"}}> {profile.about} </label>   
            </Box>
             <Box sx={{display: "flex", padding: "10px 0px", height: '50vh'}}>
                <Box id="other-info" sx={otherInfoStyle}>
                  <div style={otherInfoElementStyle}>
                    <b><p> Full Name</p></b>
                    <p> {profile.fullName} </p>
                  </div>
                  <div style={otherInfoElementStyle}>
                    <b><p> Email </p></b>
                    <p> {profile.email} </p>
                  </div>
                </Box>
    
                <Box id="friend-list" sx={{ display: "flex", flexDirection: "column"}}>
                  <b> <h1 style={{padding: "0vh 1vw", fontSize:"3vw"}}> Friend List </h1></b>
                </Box >
             </Box> 
            
          </Box>
          
        </Paper>
    </Box>
  );
}