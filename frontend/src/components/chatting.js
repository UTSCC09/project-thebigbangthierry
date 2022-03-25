import {Box, Paper } from "@mui/material"; 
import {NavBar} from "./navbar"; 
import {ChattingUsers} from "./chattingUsers";
import {Message} from "./messages";  


const mainStyle= {
  display: 'flex',
  backgroundColor: '#002f65',
  backgroundSize: 'cover', 
  height: '89.6vh', 
}
const chattingPaper={
  overflow:'hidden', 
  position: 'relative', 
  height: '80vh' , 
  width: '60vw', 
  margin:"20px auto"
};
const userSectionStyle= {
  backgroundColor: '#d1d1d1',
  width: '30%', 
  height: '100%',
  position: 'absolute',
  left: 0,
  top: 0,
}; 
const messageSectionStyle={
  width: '65%', 
  height: '100%',
  position: 'absolute',
  overflowY:'scroll', 
  '&::-webkit-scrollbar': { display: 'none', },
  left: '32%',
  top: 0,
};
export function Chatting() {
  return (
      <Box >
        <NavBar/> 
        <Box sx={mainStyle}>
          <Paper elevation={10} style={chattingPaper}>
            <Box id="users-section" sx={userSectionStyle}> 
              <ChattingUsers/> 
            </Box>
            <Box id="message-section" sx={messageSectionStyle}>
              <Message/>
            </Box>
          </Paper>
        </Box>
      </Box>
  ); 
}