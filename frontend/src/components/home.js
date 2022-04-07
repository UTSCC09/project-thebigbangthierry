import React from "react"; 
import { Container } from "@mui/material";
import {NavBar} from "./navbar"; 
import PostForum from "./postForum"; 

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