import {Box, Container, Paper, Avatar , Button} from "@mui/material"; 
import { Link } from "react-router-dom";
import {useEffect, useState} from "react"; 

export function Profile(){
  const [profile, setProfile] = useState({}); 
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
    <Box sx={{backgroundColor: '#002f65', backgroundSize: 'cover', height: '100%'}}>
      <Container maxWidth="sm" sx={{padding: "5vh 0vh"}}>
        <Paper sx={{padding: '10px'}}>
          <Box sx={{display: 'flex', flexDirection: 'column', alignItems:'center', justifyContent:'center'}}>
            <Box id="about-picture" sx={{display: 'flex', padding:'3vh 0vh', borderBottom: '2px grey solid'}}>
              <div>
                <Avatar sx={{width: 70, height: 70}}/> 
                <Button sx={{fontSize: "1vw"}}> Edit Profile</Button>
              </div>
              <label> {profile.about} </label>   
            </Box>
              
            <Box id="other-info">
              
            </Box>

            <Box id="friend-list">

            </Box>
          </Box>
          
        </Paper>
      </Container>
    </Box>
  );
}