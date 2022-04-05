import { NavBar } from "./navbar";

export default function Credits() {
  return (
    <div>
      <NavBar/> 
      <div style={{padding: 10}}>
        <h1> Credits </h1>
        <h2> Frontend </h2>
        <ul>
          <li> UIs were imported from <a href="https://mui.com/getting-started/installation/"> Material UI </a></li>
          <li> Code related to connecting to GraphQL using Apollo were from <a href="https://www.apollographql.com/docs/react/"> Apollo Official Documentation </a></li> 
          <li> Some of the code related to Authorization and Text Chatting were referenced from <a href="https://github.com/hidjou/node-graphql-react-chat-app/tree/class-15"> here </a> </li>
          <li> Some of the code related to Video Chatting were referenced from <a href="https://www.twilio.com/blog/video-chat-react-hooks"> here </a></li>
          <li> Some of the code related to jwt were referenced from <a href="https://www.bezkoder.com/react-hooks-jwt-auth/"> here </a></li> 
          <li> Usage of Window Size component comes from <a href="https://usehooks.com/useWindowSize/"> here </a> </li> 
          <li> Some of the Signup code was referenced from
             <a href="https://stackoverflow.com/questions/69485737/upload-file-using-react-hook-form-in-version-7 "> stackoverflow </a> and 
             <a href="https://levelup.gitconnected.com/using-react-hook-form-with-material-ui-components-ba42ace9507a"> levelup </a> and 
             <a href=" https://codesandbox.io/s/react-hook-form-password-match-check-standard-validation-eo6en?file=/src/index.js"> codesandbox </a> and 
             <a href="https://kiranvj.com/blog/blog/file-upload-in-material-ui/"> here </a> and lastly 
             <a href="https://react-hook-form.com/"> react hook form </a>
          </li> 
        </ul>
        <h2> Backend </h2>
        <ul>
          <li> Structure of GraphQL api referenced <a href="https://atheros.ai/blog/graphql-list-how-to-use-arrays-in-graphql-schema"> here</a> </li>
          <li> Backend code for Apollo Server was from <a href="https://www.apollographql.com/docs/apollo-server/data/subscriptions/"> Apollo official documentation</a> </li>
          <li> MongoDB CRUD api calls from <a href="https://www.mongodb.com/docs/manual/crud/"> MongoDB Official documentation </a></li>
          <li> Backend for Video chatting from <a href="https://www.twilio.com/docs/video/tutorials/get-started-with-twilio-video-node-express-server"> here </a></li>
          <li> Code for websockets comes from <a href="https://www.apollographql.com/docs/apollo-server/data/subscriptions/"> Apollo Offical Documentation </a></li>
        </ul>
      </div>
    </div>
  ); 
}