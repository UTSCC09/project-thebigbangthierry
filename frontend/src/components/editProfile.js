import {Box, Paper, Avatar , Tab, Tabs, Button} from "@mui/material"; 
import { useState} from "react"; 
import { useLazyQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import Cookies from 'js-cookie'; 
import {TabPanel} from "./tabPanel";
import { ProfileName } from "./profileName";
import PostForm from "./postForm"; 
import {NavBar} from "./navbar"; 
import Post from "./post";
import AddFollowers from "./addFollowers"; 
import {useNavigate} from "react-router-dom";
import { useForm, Controller } from "react-hook-form";

const GET_PROFILE = gql`
  query($user: String!) {
    user(username: $user){
      fullName,
      email
      about
      profilePicture
    }
  }
`;

export function EditProfile() {
  return (
    <div>
      
    </div>
  );
}