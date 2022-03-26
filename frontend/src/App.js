
import './App.css';
import {Signup} from "./components/signup"; 
import {Login} from "./components/login";
import {Profile} from "./components/profile";
import {Home} from "./components/home";
import {Chatting} from "./components/chatting"; 
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import {AuthProvider} from './services/auth'; 
import DynamicRoute from './utils/dynamicRoute'; 
import { MessageProvider } from './services/message'

// import { WebSocketLink } from "apollo-link-ws";
import {
  BrowserRouter,
  Routes,
  Route,
  
} from 'react-router-dom';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
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
 * JWT Authetication: https://www.bezkoder.com/react-hooks-jwt-auth/ 
 * Contexts : https://github.com/hidjou/node-graphql-react-chat-app/blob/ 
 * Dynamic Routes: https://www.youtube.com/watch?v=NTU-vLYNTJQ&list=PLMhAeHCz8S3_VYiYxpcXtMz96vePOuOX3&index=8&ab_channel=Classsed
***/

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <MessageProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<DynamicRoute authenticated/>}>
                    <Route exact path='/' element={<Home/>}/>
                    <Route path="/profile" element={<Profile/>}/> 
                    <Route path="/chatting" element={<Chatting/>}/> 
              </Route>
              <Route element={<DynamicRoute guest/>}>
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />}/>
              </Route>
            </Routes>
          </BrowserRouter>
        </MessageProvider>
      </AuthProvider>
    </ApolloProvider>
    
  );
}

export default App;
