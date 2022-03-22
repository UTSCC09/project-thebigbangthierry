import React, { useContext } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { UserContext } from './userContext';

export default function PrivateRoute(props) {
   const { user, isLoading } = useContext(UserContext);
   if(isLoading) {
      return (<div> Loading ... </div>); 
   }
   return user ? <Outlet /> : <Navigate to="/login" />;
}