import { Container } from "@mui/material";
import {NavBar} from "./navbar"
import PostForm from "./postForm";

//LINKS TO AUTH: https://ui.dev/react-router-protected-routes-authentication
export function Home(props) {
  
  return(
    <div> 
      <NavBar/> 
      <Container sx={{paddingTop: '2vh'}}>
        <PostForm/>
        
      </Container>
    </div>
  );
}