import React from "react"; 
import { Container } from "@mui/material";
import {NavBar} from "./navbar"; 
import PostForum from "./postForum"; 

//LINKS TO AUTH: https://ui.dev/react-router-protected-routes-authentication
export function Home() {
  return(
    <div style={{minHeight: '100vh', backgroundColor: '#002f65', color: 'white'}}> 
      <NavBar/> 
      <Container sx={{paddingTop: '2vh'}}>
        <PostForum profile={false} />        
      </Container>
    </div>
  );
}