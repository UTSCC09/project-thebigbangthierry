
import './App.css';
import {Signup} from "./components/signup"; 
import {Login} from "./components/login";
import {Profile} from "./components/profile";
import {Home} from "./components/home";
import {EditProfile} from "./components/editProfile";
import {AddFollowers} from "./components/addFollowers";
import {useState} from "react"; 
import Cookies from 'js-cookie'; 
import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient from "apollo-boost";
// import { WebSocketLink } from "apollo-link-ws";
// import { InMemoryCache } from "apollo-cache-inmemory";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate, 
} from 'react-router-dom';

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  // link: new WebSocketLink({
  //   uri: "wss://localhost:4000/graphql",
  //   options: {
  //     reconnect: true,
  //     connectionParams: {
  //       headers: {
  //         Authorization: "Bearer yourauthtoken",
  //       },
  //     },
  //   },
  // }),
  // cache: new InMemoryCache(),
});

/*** SOURCES THAT NEEDED TO BE CREDITED ***/
/***
 * For privated routes:  https://www.robinwieruch.de/react-router-private-routes/ 
***/
const ProtectedRoute = ({
  auth, 
  redirectPath = '/login',
  children,
}) => {
  if (!auth) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <AppRoutes/>
      </BrowserRouter>
    </ApolloProvider>
    
  );
}

function AppRoutes() {
  const [auth, setAuth] = useState(false);
  const [loginError, setLoginError] = useState(false); 
  const navigate = useNavigate(); 

  const checkCookie = (username) => {
    const user = Cookies.get("username");
    if (username) {
      // console.log("cookie " + user);
      // console.log("returned " + username); 
      if (username === user) {
        return true; 
      } 
    }
    return false; 
    
  }
  const handleLogin = (data) => {
    // console.log(data);
    fetch("/login", {
      method: "POST",
      headers: {
        'Content-type' : " application/json", 
      },
      body: JSON.stringify(data)
    })
    .then(res=> res.json()) 
    .catch(err => setLoginError(true))
    .then(data => {
      const valid = checkCookie(data)
      if (valid) {
        setAuth(true); 
        navigate("/"); 
      }
    })
  }

  const handleLogout = () => {
    //logout();
    fetch("/signout", {
      method: "GET",
      headers: {
        'Content-type' : " application/json", 
      },
    })
    .then(res=> res.json())
    .then(setAuth(false))
  };

  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login handleLogin={handleLogin} loginError={loginError}/>}/>
      <Route path="/" element={<ProtectedRoute auth={auth}> <Home handleLogout={handleLogout}/> </ProtectedRoute> }/>
      {/* <Route path="/profile" element={<ProtectedRoute auth={auth}><Profile/> </ProtectedRoute> }/> */}
      <Route path="/profile" element={<Profile/>}/> 
      <Route path="/profile/edit" element={<ProtectedRoute auth={auth}> <EditProfile/> </ProtectedRoute> }/>
      <Route path="/add/followers" element={<AddFollowers/>} /> 
    </Routes>
 
  );
}
export default App;
