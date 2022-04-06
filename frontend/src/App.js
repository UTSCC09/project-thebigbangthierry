
import React from "react"; 
import './App.css';
import {Signup} from "./components/signup"; 
import {Login} from "./components/login";
import {Profile} from "./components/profile";
import {Home} from "./components/home";
import {Chatting} from "./components/chatting"; 
import Credits from "./components/credits"; 
import {AuthProvider} from './services/auth'; 
import { MessageProvider} from './services/message'; 
import DynamicRoute from './utils/dynamicRoute'; 
import {VideoChatting} from './components/videoChatting';
import { split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { ApolloClient, InMemoryCache , ApolloProvider} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { setContext } from '@apollo/client/link/context'
import {api_base, ws_base} from "./config"; 

import {
  BrowserRouter,
  Routes,
  Route,
  
} from 'react-router-dom';

const httpLink = new HttpLink({
  uri: api_base + '/graphql',
  
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

const wsLink =new GraphQLWsLink(createClient({
  url: ws_base + `/graphql`, 
  options: {
    reconnect: true , 
  }, 
  connectionParams: {
    authorization: `Bearer ${localStorage.getItem("token")}`,
  }, 
})); 

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink),
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
});

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
                    <Route path="/video" element={<VideoChatting/>}/> 
                    <Route path="/credit" element={<Credits/>} /> 
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
