
import './App.css';
import {Signup} from "./components/signup"; 
import {Login} from "./components/login";
import {Profile} from "./components/profile"
import { ApolloProvider } from "@apollo/react-hooks";
import ApolloClient from "apollo-client";
import { WebSocketLink } from "apollo-link-ws";
import { InMemoryCache } from "apollo-cache-inmemory";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

const client = new ApolloClient({
  link: new WebSocketLink({
    uri: "wss://localhost:4000/graphql",
    options: {
      reconnect: true,
      connectionParams: {
        headers: {
          Authorization: "Bearer yourauthtoken",
        },
      },
    },
  }),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
      <div>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/profile" element={<Profile/>}/> 
        </Routes>
      </div>
    </BrowserRouter>
    </ApolloProvider>
    
  );
}

export default App;
