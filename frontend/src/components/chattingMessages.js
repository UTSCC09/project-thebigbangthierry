import {useEffect } from "react"; 
import { useLazyQuery, useMutation , useSubscription} from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { TextField , Button, Input } from "@mui/material";
import { useForm } from "react-hook-form";
import SendIcon from '@mui/icons-material/Send';
import AuthService from "../services/auth.service";
import { useMessageDispatch, useMessageState } from "../services/message";

// const messages = [
//   {
//     uuid: '7648485a-6657-48d7-87d6-6a98931d3598',
//     content: 'Hey Jane!',
//     from: 'john',
//     to: 'jane',
//     createdAt: '2020-07-01 07:00:00',
//     updatedAt: '2020-07-01 07:00:00',
//   },
//   {
//     uuid: 'ae4df4f1-a428-400d-bb16-edd4237e0c47',
//     content: "Hey John, how's it going?",
//     from: 'jane',
//     to: 'john',
//     createdAt: '2020-07-01 08:00:00',
//     updatedAt: '2020-07-01 08:00:00',
//   },
//   {
//     uuid: '0a7c92ac-f69c-4799-8aad-9663a4afb47d',
//     content: 'Not too bad, just getting to work, you?',
//     from: 'john',
//     to: 'jane',
//     createdAt: '2020-07-01 09:00:00',
//     updatedAt: '2020-07-01 09:00:00',
//   },
//   {
//     uuid: '240dd560-5825-4d5d-b089-12a67e8ec84c',
//     content: "I'm working from home now",
//     from: 'jane',
//     to: 'john',
//     createdAt: '2020-07-01 10:00:00',
//     updatedAt: '2020-07-01 10:00:00',
//   },
//   {
//     uuid: 'fd4cee68-5caf-4b1b-80a9-5b9add7fd863',
//     content: 'Hey John, are you done with that task?',
//     from: 'boss',
//     to: 'john',
//     createdAt: '2020-07-01 11:00:00',
//     updatedAt: '2020-07-01 11:00:00',
//   },
//   {
//     uuid: '0a7c92ac-f69c-4799-8aad-9663a4afb47d',
//     content: 'Not too bad, just getting to work, you?',
//     from: 'john',
//     to: 'jane',
//     createdAt: '2020-07-01 09:00:00',
//     updatedAt: '2020-07-01 09:00:00',
//   },
//   {
//     uuid: '240dd560-5825-4d5d-b089-12a67e8ec84c',
//     content: "I'm working from home now",
//     from: 'jane',
//     to: 'john',
//     createdAt: '2020-07-01 10:00:00',
//     updatedAt: '2020-07-01 10:00:00',
//   },
//   {
//     uuid: 'fd4cee68-5caf-4b1b-80a9-5b9add7fd863',
//     content: 'Hey John, are you done with that task?',
//     from: 'boss',
//     to: 'john',
//     createdAt: '2020-07-01 11:00:00',
//     updatedAt: '2020-07-01 11:00:00',
//   },
//   {
//     uuid: '0a7c92ac-f69c-4799-8aad-9663a4afb47d',
//     content: 'Not too bad, just getting to work, you?',
//     from: 'john',
//     to: 'jane',
//     createdAt: '2020-07-01 09:00:00',
//     updatedAt: '2020-07-01 09:00:00',
//   },
//   {
//     uuid: '240dd560-5825-4d5d-b089-12a67e8ec84c',
//     content: "I'm working from home now",
//     from: 'jane',
//     to: 'john',
//     createdAt: '2020-07-01 10:00:00',
//     updatedAt: '2020-07-01 10:00:00',
//   },
//   {
//     uuid: 'fd4cee68-5caf-4b1b-80a9-5b9add7fd863',
//     content: 'Hey John, are you done with that task?',
//     from: 'boss',
//     to: 'john',
//     createdAt: '2020-07-01 11:00:00',
//     updatedAt: '2020-07-01 11:00:00',
//   },
// ]
const GET_MESSAGES = gql`
  query($from: String!, $to: String!) {
    getMessages(fromUsername: $from , toUsername: $to){
      _id
      content 
      fromUsername
      toUsername
      createdAt
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
      fromUsername
      toUsername
      content
      createdAt
    } 
  }
`;
const sentMessageStyle={
  backgroundColor: '#002f65',  
  color: 'white', 
  padding: 7, 
  borderRadius: 15,
  marginLeft: 'auto',  
  
}
const receivedMessageStyle={
  backgroundColor: '#d9d8d4',  
  color: 'black', 
  padding: 7, 
  borderRadius: 15,
  marginRight: 'auto', 
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
export function ChattingMessages(props) {
  const {users} = useMessageState(); 
  const dispatch = useMessageDispatch();
  const currentUser = AuthService.getCurrentUser().username; 
  
  const selectedUser = users?.find((u) => u.username === props.selected); 
  const messages = selectedUser?.messages; 

  const { register ,handleSubmit , reset} = useForm();
  const [ getMessages, {loading, data ,error} ] = useLazyQuery(GET_MESSAGES)
  const [sendMessage] = useMutation(SEND_MESSAGE, { onError: err => console.log(err), }) 
  const {data: newData, error: newError} = useSubscription(NEW_MESSAGE ,{
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
  }, [data])

  
  useEffect(() => {
    if (newError) console.log(newError); 
    if (newData) { 
      // console.log(newData); 
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          username: props.selected,
          message: newData.newMessage,
        },
      })
    }
  }, [newError, newData]);

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
        <p key={index} style={message.toUsername === props.selected ? sentMessageStyle : receivedMessageStyle}> {message.content} </p>
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