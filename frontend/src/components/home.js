import {Button} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/auth.service";

//LINKS TO AUTH: https://ui.dev/react-router-protected-routes-authentication
export function Home(props) {
  const navigate = useNavigate(); 
  const logout = () => {
    AuthService.logout(); 
    // props.handleLogout(); 
    navigate("/login");
  }
  return(
    <div> 
      Hello , we finally made it here
      <Button onClick={logout}>Logout</Button>
      <Button onClick={() => navigate("/profile")}> View Profile </Button>
      <Button onClick={() => navigate("/add/followers")}> Add Follower </Button>
    </div>
  );
}