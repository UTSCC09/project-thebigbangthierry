import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import React, {useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { IconButton, Popover} from "@mui/material";
const REACT_MESSAGE = gql`
  mutation reactMessage($messageId: ID! , $reactEmoji: String!){
    reactMessage(messageId: $messageId, reactEmoji: $reactEmoji) {
      reactEmoji 
    }
  }
`;

const reactionEmojis = ["❤️", "😂", "🥺", "😡", "👍", "👎", "😮"];

export default function ReactBar(props) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpen = (event) => setAnchorEl(event.currentTarget); 
  const handleClose = () => setAnchorEl(null); 
  
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const [reactMessage] = useMutation(REACT_MESSAGE, {
    onCompleted : () => handleClose() , 
  })

  const react = (reaction) => {
    reactMessage({variables: {messageId: props.message._id, reactEmoji: reaction}}); 
  }

  return (
    <div style= {{display: 'flex', justifyContent: 'center'}}>
    <IconButton onClick={handleOpen}>
      <EmojiEmotionsIcon/> 
    </IconButton>
     <Popover
      id={id} 
      open={open}
      onClose={handleClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      {reactionEmojis.map((reaction, index) => {
        return (
          <button key={index} onClick={() =>react(reaction)} style={{ border: 'none', borderRadius: '100%', padding: 3, cursor: 'pointer'}}variant="text"  > {reaction} </button>
        );
      })}
    </Popover>
    
  </div>
  );
}