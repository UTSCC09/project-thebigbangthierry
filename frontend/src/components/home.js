import {Button} from "@mui/material";
import { useNavigate } from "react-router-dom";

//LINKS TO AUTH: https://ui.dev/react-router-protected-routes-authentication
export function Home(props) {
  const navigate = useNavigate(); 
  const logout = () => {
    props.handleLogout(); 
    navigate("/");
  }
  return(
    <div> 
      Hello , we finally made it here
      <Button onClick={logout}>Logout</Button>
      <Button onClick={() => navigate("/profile")}> View Profile </Button>
      <Button> Chat with Users </Button>
    </div>
  );
}