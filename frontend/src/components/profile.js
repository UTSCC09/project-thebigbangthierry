import {Box, Paper, Avatar , Button, Tab, Tabs, TextField, InputAdornment} from "@mui/material"; 
import { useNavigate } from "react-router-dom";
import { useState, useEffect} from "react"; 
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Cookies from 'js-cookie'; 
import {TabPanel} from "./tabPanel";
import { ProfileName } from "./profileName";
import PostAddIcon from '@mui/icons-material/PostAdd';
import SendIcon from '@mui/icons-material/Send';
import {NavBar} from "./navbar"

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
  const navigate = useNavigate(); 
  const [value, setValue] = useState(0);
  const [post, setPost] = useState(""); 
  const username = Cookies.get("username"); 
  const { loading, error, data } = useQuery(GET_PROFILE, {
    variables: { user: username},

  });

 
  const handleChange = (e) => {
    setPost(e.target.value); 
  };

  const [dummyPost, setDummyPost] = useState([
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

  ]); 

  const submitPost = () => {
    const newDummy = dummyPost; 
    const newPost = {
      username: username, 
      profilePicture: "", 
      content: post, 
      timePosted: "03/22/2022", 
      comments: [], 
    }
    newDummy.push(newPost); 
    setDummyPost(newDummy); 
  };

  useEffect(() => {
    // Update the document title using the browser API
    
  },[dummyPost]);
  
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  if (loading) return <div>Loading...</div>;
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
                {/* <Button sx={{fontSize: "2vmin"}} onClick={() => navigate("/profile/edit")}> Edit Profile</Button>           */}
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
                  </Tabs>
              </Box>
              <TabPanel id="about" value={value} index={0}>
                <Box sx={aboutStyle}>
                  <p> <b> Full Name: </b> {data.user.fullName} </p>
                  <p> <b> Email: </b>{data.user.email} </p>
                </Box>
              </TabPanel>
              <TabPanel id="post" value={value} index={1}>
                <TextField
                  id="post-form"
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" >
                        <PostAddIcon/> 
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <Button onClick={submitPost}>
                        <SendIcon/> 
                      </Button>
                    ), 
                  }}
                  variant="outlined"
                  fullWidth
                />
                {dummyPost.map((post, index)=> {
                  return (
                    <Box key={index} sx={{ padding: '1vh'}} >                      
                       <Box sx={{display:'flex', alignItems: 'center'}}>
                        <Avatar src={post.profilePicture}/> 
                        <div style={{ paddingLeft: '0.5vw',  fontSize:"1.5vmin"}}> 
                          <p> {post.username} </p>
                          <p> {post.timePosted} </p>
                        </div>
                       </Box>
                       <p> {post.content }</p>
                    </Box>
                  );
                })}
              </TabPanel>
              <TabPanel id="follow" value={value} index={2}>
                <Box sx={{display:'flex'}}> 
                  <Box sx={{width: '35vw',borderRight: "2px grey solid",  minHeight: "45vh"}}>
                    <Box sx={{display: 'flex'}}> 
                      <p style={{fontSize: "3vmin", width: "20vw"}}> <b> Following </b> </p> 
                      <Button variant="contained" sx={{height: '5vh'}} onClick={() => navigate("/add/followers")}> Search </Button>
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
             </Box> 
            
          </Box>
        </Paper>
    </Box>
    </div>
  );
}