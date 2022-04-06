import React from 'react'; 
import {TextField, Button, Paper, Typography} from "@mui/material"; 
import {NavBar} from "./navbar"; 

export default function VideoLobby({handleSubmit, handleRoomName, fullRoom}) {

  return (
    <div style={{ height: "100vh", backgroundColor: '#002f65', }}>
      <NavBar/> 
      <div style={{display: "flex", justifyContent: "center", marginTop: 20}}>
      <Paper sx={{padding: '1vh 4vw'}}>
        <Typography> Enter Room Id to Join Video </Typography>
        <form style={{padding: '6vh 0px'}} onSubmit={handleSubmit}> 
          <TextField sx={{color: 'white' }}variant="standard" placeholder="Enter the room ID" onChange={handleRoomName}/>  
          <div style={{textAlign: "center"}}> <Button type="submit"> Join Room </Button> </div>
        </form>
        {fullRoom ?  <p style={{color: 'red' , textAlign: 'center'}}>Room is full</p> : null }
      </Paper>
    </div>
    </div> 
  );
}