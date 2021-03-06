import React from "react"; 
import {Box, Paper } from "@mui/material"; 
import {NavBar} from "./navbar"; 
import {ChattingUsers} from "./chattingUsers";
import {ChattingMessages} from "./chattingMessages"; 
import { useState } from "react";


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

export function Chatting() {
  const [selected, setSelected] = useState(''); 
  return (
      <Box >
        <NavBar/> 
        <Box sx={mainStyle}>
          <Paper elevation={10} style={chattingPaper}>
            <Box id="users-section" sx={userSectionStyle}> 
              <ChattingUsers selected={selected} setSelected={setSelected} /> 
            </Box>
            <Box id="message-section">
              <ChattingMessages selected={selected} />
            </Box>
          </Paper>
        </Box>
      </Box>
  ); 
}