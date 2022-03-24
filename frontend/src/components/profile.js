import {Box, Paper, Avatar , Tab, Tabs, Button} from "@mui/material"; 
import { useState} from "react"; 
import { useLazyQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Cookies from 'js-cookie'; 
import {TabPanel} from "./tabPanel";
import { ProfileName } from "./profileName";
import PostForm from "./postForm"; 
import {NavBar} from "./navbar"; 
import Post from "./post";
import AddFollowers from "./addFollowers"; 
import {useNavigate} from "react-router-dom";

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
  minHeight: '90vh' , 
  padding:'5vh 0vw'
}; 

const mainBoxStyle = {
  display: 'flex', 
  flexDirection: 'column', 
  justifyContent:'center'
};

const aboutStyle ={
  fontSize: '3vmin',
};
export function Profile(){
  const [value, setValue] = useState(0);
  const username = Cookies.get("username"); 
  const navigate = useNavigate(); 
  const [loadProfile, { called, loading, data , error}]= useLazyQuery(GET_PROFILE, {
    variables: { user: username},
    // pollInterval: 1000,
  });

  const dummyPost = [
    {
      username: username, 
      profilePicture: "", 
      content: "Here is a sample post ",
      timePosted: "01/02/2022",
      comments: [
        {
          username: "test", 
          content: "Hello! "
        }, 
      ]
    },
    {
      username: username, 
      profilePicture: "", 
      content: "Hello there! ",
      timePosted: "01/02/2022",
      comments: [
        {
          username: "test", 
          content: "Hello! "
        }, 
        {
          username: "test1", 
          content: "Hello! "
        }, 
        {
          username: "test2", 
          content: "Hello! "
        }, 
      ]
    },

  ]; 

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  if (called && loading) return <p>Loading ...</p>
  if (!called) {
    return loadProfile();
  }
  if (error) return <div>Error!</div>

  return (
    <div>
    <NavBar/>
    <Box sx={backgroundBoxStyle}>
      <Paper sx={{width: "75vw" , padding: '2vh'}}>
        <Box sx={mainBoxStyle}>
          <Box id="about-picture" sx={pictureStyle}>
            <div>
              <Avatar sx={{width: '15vh', height: '15vh'}} src={data.user.profilePicture}/> 
              <Button sx={{fontSize: "2vmin"}} onClick={() => navigate("/profile/edit")}> Edit Profile</Button>          
            </div>
            <div  style={{padding: "0vh 2vw",}}>
            <p style={{ fontSize: "2vmin"}}><b> About Me </b></p>
            <label style={{ fontSize: "3vmin"}}> {data.user.about} </label>              
            </div>
            
          </Box>
            <Box id="other-tabs" sx={{padding: "10px 0px", minHeight: '50vh'}}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs sx={{fontSize: '1.5vmin'}} value={value} onChange={(e, newValue) => setValue(newValue)} aria-label="basic tabs example">
                  <Tab label="About" {...a11yProps(0)} />
                  <Tab label="Posts" {...a11yProps(1)} />
                  <Tab label="Follow" {...a11yProps(2)} />
                  <Tab label="Search" {...a11yProps(3)} />
                </Tabs>
            </Box>
            <TabPanel id="about" value={value} index={0}>
              <Box sx={aboutStyle}>
                <p> <b> Full Name: </b> {data.user.fullName} </p>
                <p> <b> Email: </b>{data.user.email} </p>
              </Box>
            </TabPanel>
            <TabPanel id="post" value={value} index={1}>
              <PostForm/> 
              {dummyPost.map((post, index)=> {
                return (
                  <Post key={index} post={post}/> 
                );
              })}
            </TabPanel>
            <TabPanel id="follow" value={value} index={2}>
              <Box sx={{display:'flex'}}> 
                <Box sx={{width: '35vw',borderRight: "2px grey solid",  minHeight: "45vh"}}>
                  <Box sx={{display: 'flex'}}> 
                    <p style={{fontSize: "3vmin", width: "20vw"}}> <b> Following </b> </p> 
                  </Box>
                  {data.user.followingList.map((follow) => {
                    return (
                      <div key={follow.username} style={{paddingTop: "0.5vh"}}> <ProfileName  user={follow} fontSize="2vmin"/>  </div>
                    );
                  })}
                </Box>
                <Box sx={{width: '35vw', paddingLeft: '2vw'}}>
                  <p style={{fontSize: "3vmin"}}> <b> Followers  </b> </p>
                  {data.user.followerList.map((follow) => {
                    return (
                      <ProfileName key={follow.username} user={follow} fontSize="2vmin"/> 
                    );
                  })}
                </Box>
              </Box>
            </TabPanel>
            <TabPanel id="search" value={value} index={3}>
              <AddFollowers loadProfile={loadProfile} />
            </TabPanel>
            </Box> 
          
        </Box>
      </Paper>
    </Box>
    </div>
  );
}