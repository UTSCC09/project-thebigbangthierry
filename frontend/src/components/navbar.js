// import {Link} from "react-router-dom"; 

// export function NavBar() {
//   const pages = [
//     {name: "Profile", link: "/profile"},
//     {name: "Home" , link: "/"}
//   ]
//   return (
//     <div>
//       {pages.map((page) => {
//         return (
//           <Link to={page.link}> {page.name} </Link>
//         )
//       })}
//     </div>
//   );
// }
import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,

} from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Link } from "react-router-dom";

const navLinkStyles ={
  marginLeft: 10,
  display: "flex",
}; 

const logoStyles = {
  flexGrow: "1",
  cursor: "pointer",
};

const linkStyles = {
  textDecoration: "none",
  color: "white",
  fontSize: "20px",
  marginLeft: 20,
  "&:hover": {
    color: "yellow",
    borderBottom: "1px solid white",
  }
 };

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
  },
});
export function NavBar() {

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="static">
      <Toolbar>
        <Typography variant="h4" style={logoStyles}>
          UofTSocials
        </Typography>
          <div style={navLinkStyles}>
            <Link to="/" style={linkStyles}>
              Home
            </Link>
            <Link to="/add/followers" style={linkStyles}>
              Add Follower
            </Link>
            <Link to="/profile" style={linkStyles}>
              Profile
            </Link>
            {/* <Link to="/faq" style={linkStyles}>
              FAQ
            </Link> */}
          </div>
      </Toolbar>
    </AppBar>
    </ThemeProvider>
    
  );
}