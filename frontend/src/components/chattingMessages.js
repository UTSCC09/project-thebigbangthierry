import React, {useEffect } from "react"; 
import { useLazyQuery, useMutation , useSubscription} from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { TextField , Button, Input } from "@mui/material";
import { useForm } from "react-hook-form";
import SendIcon from '@mui/icons-material/Send';
import AuthService from "../services/auth.service";
import { useMessageDispatch, useMessageState } from "../services/message";
import ReactBar from './reactBar'; 

const GET_MESSAGES = gql`
  query($from: String!, $to: String!) {
    getMessages(fromUsername: $from , toUsername: $to){
      _id
      content 
      fromUsername
      toUsername
      createdAt
      reaction {
        reactEmoji
      }
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation sendMessage($from: String! , $to: String! , $content: String!) {
    sendMessage(username: $from, toUsername: $to, content: $content) {
      content 
      fromUsername 
      toUsername 
    }
  }
`;

const NEW_MESSAGE = gql`
  subscription newMessage ($username: String!) {
    newMessage(username: $username){
      _id
      fromUsername
      toUsername
      content
      createdAt
      reaction {
        reactEmoji
      }
    } 
  }
`;

const NEW_REACTION = gql`
  subscription newReactions ($username: String!) {
    newReactions(username: $username){
      reactEmoji 
      messageId {
        _id
        toUsername
        fromUsername
        content
      }
      userId {
        fullName
        about
      }
    } 
  }
`;

const sentMessageStyle={
  backgroundColor: '#002f65',  
  display: 'flex', 
  color: 'white', 
  padding: 7, 
  borderRadius: 15,
}
const receivedMessageStyle={
  backgroundColor: '#d9d8d4',  
  display: 'flex', 
  color: 'black', 
  padding: 7, 
  borderRadius: 15,
}
const messagesStyle= {
  display: 'flex', 
  flexDirection: 'column-reverse',
  width: '65%', 
  height: '80%',
  position: 'absolute',
  overflowY:'scroll',
  left: '32%',
  top: 0,
}

const inputStyle = {
  display:'flex', 
  position: 'absolute',
  padding: '5vh 0vh', 
  justifyContent: 'center', 
  alignItems: 'center',
  left: '32%',
  bottom: 0,
}; 

const reactStyle = {
  display: 'flex', 
  borderRadius: 15, 
  position: 'absolute',
  height: '4vh', 
  alignItems: 'center', 
  fontSize: '2vmin',
  right: 0, 
  bottom: 0, 
}

export function ChattingMessages(props) {
  const {users} = useMessageState(); 
  const dispatch = useMessageDispatch();
  const currentUser = AuthService.getCurrentUser(); 
  
  const selectedUser = users?.find((u) => u.username === props.selected); 
  const messages = selectedUser?.messages; 

  const { register ,handleSubmit , reset} = useForm();
  const [ getMessages, {loading, data ,error} ] = useLazyQuery(GET_MESSAGES)
  const [sendMessage] = useMutation(SEND_MESSAGE, { onError: err => console.log(err), }) 
  const {data: newData, error: newError} = useSubscription(NEW_MESSAGE ,{
    variables: {username: currentUser} , 
  });
  const {data: newReactData, error: newReactError} = useSubscription(NEW_REACTION ,{
    variables: {username: currentUser} , 
  });

  const submitMessage = (message) => {
    sendMessage({ variables: { from: currentUser , to: props.selected, content: message.message } });
    reset({message: ''}); 
  }; 

  useEffect(() => {
    if (selectedUser && !selectedUser.messages) {
      getMessages({ variables: { from: currentUser , to: props.selected } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser])

  useEffect(() => {
    if (data) {
      dispatch({
        type: 'SET_USER_MESSAGES',
        payload: {
          username: props.selected,
          messages: data.getMessages,
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  
  useEffect(() => {
    if (newError) console.log(newError); 
    if (newData) { 
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          username: props.selected,
          message: newData.newMessage,
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newError, newData]);

  useEffect(() => {
    if (newReactError) console.log(newReactError); 
    if (newReactData) { 
      dispatch({
        type: 'ADD_REACTION',
        payload: {
          username: props.selected,
          reaction: newReactData.newReactions,
        },
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newReactData, newReactError]);

  let messageDisplay;
  if (loading) {
    messageDisplay = <p>Loading ...</p>
  }
  else if (error) {
    messageDisplay = <div>Error!</div>
  }
  else if (!selectedUser) {
    messageDisplay = <p> Select a User</p>; 
  }
  else if (!messages || messages.length === 0) {
    messageDisplay = <p> Send a message ! </p>
  }
  else if (messages.length > 0 ) {
    messageDisplay = messages.map((message, index)=>{ 
      return (
        <div style={message.toUsername === props.selected ? {display: 'flex', marginLeft: 'auto'} : {display: 'flex', marginRight: 'auto'} } key={index} >
          {message.toUsername === props.selected ? <ReactBar message={message} /> : null } 
          <div style={{position: 'relative'}}>
            {message.reaction.length > 0 ? 
            <div style={reactStyle}> 
              {message.reaction.map((react, index) => { 
                return (
                  // <div> {console.log(react)} helo </div>
                    <p key={index}> {react.reactEmoji} </p>
                );
              })}
            </div> : null }
            <p key={index} style={message.toUsername === props.selected ? sentMessageStyle : receivedMessageStyle} > {message.content} </p>  
          </div>
          {message.fromUsername === props.selected ? <ReactBar message={message}/> : null} 
        </div>
        );
      })
  }

  return (
    <div>
      <div>
        <div style={messagesStyle}>
          {messageDisplay}
        </div>
        <div style={inputStyle}>
          <form  onSubmit={handleSubmit(submitMessage)}>
            <TextField
              id="post-form"
              placeholder="Send a message"
              variant="outlined"
              sx={{width: '31vw'}}
              {...register("message")}
            />
            <label htmlFor="submit-message">
            <Input value="Signup" type="submit" id="submit-message" sx={{ display: 'none'}}/>
            <Button component="span"> <SendIcon/> </Button>
          </label>
          </form>
        </div>
      </div>
    </div>
    
  );
}