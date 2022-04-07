import React from 'react';
import {Outlet,  Navigate} from 'react-router-dom'; 

export default function DynamicRoute(props) {
  if (props.authenticated && !localStorage.getItem("isLogin")) {
    return <Navigate to="/login"/> 
  } else if (props.guest && localStorage.getItem("isLogin") ) {
    return <Navigate to="/"/> 
  }else {
    return <Outlet/>
  }   

}