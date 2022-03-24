import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { Link , useNavigate} from "react-router-dom";
import AuthService from "../services/auth.service";
import UofTSocialLogo from "../media/UofTSocials_logo.png"
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useAuthDispatch } from '../services/auth'; 
import {Notification} from "./notifications"; 
const pages = [
  {
    name: 'Home', 
    link: '/'
  }, 
  {
    name: 'Chatting', 
    link: 'chatting',
  }, 
  {
    name: 'Profile',
    link: '/profile'
  }, 
  
];

export const NavBar = () => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const dispatch = useAuthDispatch();
   
  const navigate = useNavigate(); 
  const logout = () => {
    AuthService.logout(); 
    dispatch({type: 'LOGOUT'}); 
    // props.handleLogout(); 
    navigate("/login");
  }
  const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
  },
});
  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };


  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };


  return (
    <ThemeProvider theme={darkTheme}>
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}
            >
              UofTSocials
              <img style={{width: '5vh', height: '5vh'}} src={UofTSocialLogo} alt=""></img>
            </Typography>
            <Box sx={{ flexGrow: 1, alignSelf: 'center',display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page.name}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page.name}
                </Button>
              ))}
            </Box>
            <Notification/>  
            <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                    <Link style={{color: 'white', textDecoration: 'none'}} to={page.link}>{page.name}</Link>
                  </MenuItem>
                ))}
                <MenuItem> <Typography sx={{color: 'white'}} onClick={logout}>Logout</Typography> </MenuItem>
              </Menu>
            </Box>
        </Toolbar>
      </Container>
    </AppBar>
    </ThemeProvider>
  );
};
