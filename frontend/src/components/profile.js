
import { useLazyQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Cookies from 'js-cookie'; 
import {NavBar} from "./navbar"; 
import DisplayProfile from "./displayProfile"; 
import {useState} from "react"; 
import EditProfile from "./editProfile"; 
import {Snackbar} from "@mui/material"; 
import { useUserDispatch } from "../services/user";

const GET_PROFILE = gql`
  query($user: String!) {
    user(username: $user){
      fullName,
      email
      about
      profilePicture
      followerList {
        username
        profilePicture
      }
      followingList {
        username
        profilePicture
      }
    }
  }
`;


export function Profile(){
  const [editMode, setEditMode] = useState(false);
  const [notif, setNotif] = useState(false);  
  const [notifMsg, setNotifMsg] = useState(" ");   
  const username = Cookies.get("username"); 
  const dispatch = useUserDispatch(); 
  // const [data, setData] = useState(null); 
  const [loadProfile, { called, loading , data , error}]= useLazyQuery(GET_PROFILE, {
    variables: { user: username},
    onCompleted: (data) => {
      dispatch({type: 'SET_USERS', payload: data.user.followingList});  
    }, 
    // pollInterval: 1000,
  });

  const openEditMode = () => setEditMode(true); 
  const closeEditMode = () => setEditMode(false); 

  const displayNotif = () => setNotif(true); 
  const closeNotif = () => setNotif(false); 
  const changeMsg = (msg) => setNotifMsg(msg); 
  if (called && loading) return <p>Loading ...</p>
  if (!called) {
    return loadProfile();
  }
  if (error) return <div>Error!</div>

  return (
    <div>
    <NavBar/>
      {editMode? 
        <EditProfile displayNotif={displayNotif} changeMsg={changeMsg} data={data.user} loadProfile={loadProfile} closeEditMode={closeEditMode}/> 
        :
        <DisplayProfile data={data} loadProfile={loadProfile} openEditMode={openEditMode}/>
      }  
      <Snackbar open={notif} onClose={closeNotif} autoHideDuration={2000} message={notifMsg} />  
    </div>
  );
}