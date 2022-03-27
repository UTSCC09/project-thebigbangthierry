import React from 'react';
import {Outlet,  Navigate} from 'react-router-dom'; 

import {useAuthState} from '../services/auth'; 

export default function DynamicRoute(props) {
  const {user, isLoading } = useAuthState();
  console.log(isLoading);
  if (props.authenticated && !user && !isLoading ) {
    return <Navigate to="/login"/> 
  } else if (props.guest && user && !isLoading) {
    return <Navigate to="/"/> 
  } else if (isLoading) {
    return <div> Loading ... </div>
  }else {
    return <Outlet/>
  }   

}