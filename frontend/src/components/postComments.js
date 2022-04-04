import {useState, useEffect} from "react"; 
import {Button} from "@mui/material"; 
import { useLazyQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import AuthService from "../services/auth.service";
import CommentForm from "./commentForm";
import Comment from "./comment"; 

const GET_COMMENT = gql`
  query ($username: String! , $postId: ID!, $pageIndex: Int!) {
    getComments (username: $username, postId: $postId, pageIndex: $pageIndex) {
      commentContent 
      commentDate
      commenter 
      commenterProfilePic
    }
  }
`;
export default function PostComments(props) { 
  const post = props.post; 
  const [comments, setComments] = useState([]);  
  const [page, setPage] = useState(1);  
  const username = AuthService.getCurrentUser(); 

  const [getComments] = useLazyQuery(GET_COMMENT, {
    onCompleted: data => {
      if (data.getComments.length === 0) {
        if (page === 1) setComments(null); 
        else setPage(page-1); 
      }
      else {
        setComments(data.getComments);
      }
    },  
  })

  const goBack = () => {
    if (page > 1) setPage(page-1); 
  };

  const goForward = () => { 
    setPage(page+1);
  };

  const resetPage = () => {
    setPage(0); 
  }
  useEffect(() => {
    getComments({variables: {username: username, postId: post._id, pageIndex: page}}); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  return (
    <div >
      <div style={{display: 'flex', justifyContent: 'flex-end'}}>
        <Button onClick={goBack}>  Prev </Button>
        <Button onClick={goForward}> Next  </Button>
      </div>
      {comments ? 
      comments.map((comment) => {
        return (
          <Comment comment={comment}/> 
        );
      }) 
      :null}
      <CommentForm post={post} getComments={getComments} resetPage={resetPage} page={page} /> 
    </div>
  );
}