import {TextField, InputAdornment, IconButton} from "@mui/material"; 
import PostAddIcon from '@mui/icons-material/PostAdd';
import {useForm} from "react-hook-form"; 
import SendIcon from '@mui/icons-material/Send';
import AuthService from "../services/auth.service";
import { useMutation } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

const POST_COMMENT = gql `
  mutation ($username: String!, $postId: ID!, $commentContent: String! ){
    addComments(username: $username, postId: $postId, commentContent: $commentContent) {
      commenter
    }
  }
`;

export default function CommentForm({post, getComments, page, resetPage}) {
  const { register ,handleSubmit, reset } = useForm();
  const username = AuthService.getCurrentUser(); 
  const [postComment] = useMutation(POST_COMMENT, {
    onCompleted: () => { 
      resetPage(); 
      getComments({variables: {username: username, postId: post._id, pageIndex: page}}); 
    }
  })
  const submitComment = (newData) => {
    postComment({variables: {username: username, postId: post._id , commentContent: newData.content}}); 
    reset({
      content: ''
    }); 
  };

  return (
    <div style={{position: 'relative'}}> 
      <form onSubmit={handleSubmit(submitComment)}>   
        <TextField
            id="comment-form"
            placeholder="Comment something"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" >
                  <PostAddIcon/> 
                </InputAdornment>
              ),
              endAdornment: (
                <IconButton sx={{color: '#002f65'}}type="submit"> 
                  <SendIcon/> 
                </IconButton>
              )
            }}
            variant="outlined"
            fullWidth
            {...register("content")}
          />
        </form>
      </div>
  ) ; 
}