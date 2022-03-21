import {Box, Paper, Avatar , Button, Tab, Tabs } from "@mui/material"; 
import { useNavigate } from "react-router-dom";
import { useState} from "react"; 
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Cookies from 'js-cookie'; 
import {TabPanel} from "./tabPanel";
import { ProfileName } from "./profileName";

const GET_PROFILE = gql`
  query($user: String!) {
    user(username: $user){
      fullName,
      email
      about
      profilePicture
      followerList {
        username
        profilePicture
      }
      followingList {
        username
        profilePicture
      }
    }
  }
`;

const pictureStyle = {
  display: 'flex', 
  height: '24 vh', 
  width: "70vw",
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
  justifyContent:'center'
};

const aboutStyle ={
  fontSize: '2vw',
};
export function Profile(){
  const navigate = useNavigate(); 
  const [value, setValue] = useState(0);
  const username = Cookies.get("username"); 
  const { loading, error, data } = useQuery(GET_PROFILE, {
    variables: { user: username},
  });

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>

  return (
    <Box sx={backgroundBoxStyle}>  
    {console.log(data)} 
        <Paper sx={{width: "75vw" , padding: '2vh'}}>
          <Box sx={mainBoxStyle}>
            <Box id="about-picture" sx={pictureStyle}>
              <div style={{fontSize: "1vw"}}>
                <Avatar sx={{width: '15vh', height: '15vh'}} src={data.user.profilePicture}/> 
                <Button onClick={() => navigate("/profile/edit")}> Edit Profile</Button>          
              </div>
              <label style={{padding: "0vh 2vw", fontSize: "1.75vw"}}> {data.user.about} </label>              
            </Box>
             <Box id="other-tabs" sx={{padding: "10px 0px", height: '50vh'}}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs sx={{fontSize: '1.5vw'}} value={value} onChange={(e, newValue) => setValue(newValue)} aria-label="basic tabs example">
                    <Tab label="About" {...a11yProps(0)} />
                    <Tab label="Posts" {...a11yProps(1)} />
                    <Tab label="Follow" {...a11yProps(2)} />
                  </Tabs>
              </Box>
              <TabPanel value={value} index={0}>
                <Box sx={aboutStyle}>
                  <p> <b> Full Name: </b> {data.user.fullName} </p>
                  <p> <b> Email: </b>{data.user.email} </p>
                </Box>
              </TabPanel>
              <TabPanel value={value} index={1}>
                In Construction 
              </TabPanel>
              <TabPanel value={value} index={2}>
                <Box sx={{display:'flex'}}> 
                  <Box sx={{width: '35vw',borderRight: "2px grey solid",  height: "45 vh"}}>
                    <p style={{fontSize: "2vmin"}}> <b> Following </b> </p>
                    {data.user.followingList.map((follow) => {
                      return (
                        <ProfileName key={follow.username} user={follow}/> 
                      );
                    })}
                  </Box>
                  <Box sx={{width: '35vw', paddingLeft: '2vw'}}>
                    <p> <b> Followers  </b> </p>
                  </Box>
                </Box>
              </TabPanel>
             </Box> 
            
          </Box>
        </Paper>
    </Box>
  );
}