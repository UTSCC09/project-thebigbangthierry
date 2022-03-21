import {Box, Paper, Avatar , Button} from "@mui/material"; 
import { useNavigate } from "react-router-dom";
// import { useState} from "react"; 
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Cookies from 'js-cookie'; 

const GET_PROFILE = gql`
  query($user: String!) {
    user(username: $user){
      fullName,
      email
      about
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

// const otherInfoElementStyle = {
//   fontSize: "1.5vw", 
//   width: "20vw", 
//   height: "20vh", 
// };

// const postStyle = {
//   display: "flex" , 
//   flexWrap: "wrap" , 
//   width: "40vw" ,
//   borderRight: "grey 2px solid"
// }; 

const aboutPictureStyle = {
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
  alignItems:'center', 
  justifyContent:'center'
};

export function Profile(){
  const navigate = useNavigate(); 
  const username = Cookies.get("username"); 
  const { loading, error, data } = useQuery(GET_PROFILE, {
    variables: { user: username},
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>

  return (
    <Box sx={backgroundBoxStyle}>   
      {console.log(data)} 
        <Paper sx={{width: "75vw" , padding: '2vh'}}>
          <Box sx={mainBoxStyle}>
            <Box id="about-picture" sx={aboutPictureStyle}>
              <div style={{fontSize: "1vw"}}>
                <Avatar sx={{width: '15vh', height: '15vh'}} src={data.user.profilePicture}/> 
                <Button onClick={() => navigate("/profile/edit")}> Edit Profile</Button>
                <p> <b> Full Name: </b> {data.user.fullName} </p>
                <p><b> Email: </b>{data.user.email} </p>
              </div>
              <label style={{padding: "0vh 2vw", fontSize: "1.75vw"}}> {data.user.about} </label>              
            </Box>
             <Box sx={{display: "flex", padding: "10px 0px", height: '50vh'}}>
                {/* <Box id="other-info" sx={postStyle}>
                </Box> */}
    
                <Box id="following-list" sx={{ display: "flex", flexDirection: "column"}}>
                  <b> <h1 style={{padding: "0vh 1vw", fontSize:"3vw"}}> Following List </h1></b>
                  
                </Box >
             </Box> 
            
          </Box>
          
        </Paper>
    </Box>
  );
}