import { Container } from "@mui/material";
import {NavBar} from "./navbar"; 
import PostForum from "./postForum"; 

//LINKS TO AUTH: https://ui.dev/react-router-protected-routes-authentication
export function Home() {
  return(
    <div> 
      <NavBar/> 
      <Container sx={{paddingTop: '2vh'}}>
        <PostForum profile={false} />        
      </Container>
    </div>
  );
}