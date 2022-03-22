
import './App.css';
import {Signup} from "./components/signup"; 
import {Login} from "./components/login";
import {Profile} from "./components/profile";
import {Home} from "./components/home";
import {EditProfile} from "./components/editProfile";
import {AddFollowers} from "./components/addFollowers";
import { ApolloProvider } from "@apollo/react-hooks";
// import ApolloClient from "apollo-boost";
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
// import { WebSocketLink } from "apollo-link-ws";
// import { InMemoryCache } from "apollo-cache-inmemory";
import {
  BrowserRouter,
  Routes,
  Route,
  
} from 'react-router-dom';

const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    const token = user.token; 
    // return the headers to the context so  httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      }
    }
  }
  
});

const client = new ApolloClient({
  // uri: "http://localhost:4000/graphql",
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
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
 * JWT Authetication: https://www.bezkoder.com/react-hooks-jwt-auth/ 
***/

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />}/>
          <Route path="/" element={ <Home/>}/>
          {/* <Route path="/profile" element={<ProtectedRoute auth={auth}><Profile/> </ProtectedRoute> }/> */}
          <Route path="/profile" element={<Profile/>}/> 
          <Route path="/profile/edit" element={<EditProfile/>}/>
          <Route path="/add/followers" element={<AddFollowers/>} /> 
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
    
  );
}

export default App;
