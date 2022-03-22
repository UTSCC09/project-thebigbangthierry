import { useState, useEffect } from 'react';

export default function useFindUser() {
   const [user, setUser] = useState(null);
   const [isLoading, setLoading] = useState(true);
useEffect(() => {
   async function findUser() {
    const user = await JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUser(user.user);
      setLoading(false); 
    }     
  }
   findUser();
}, []);
return {
   user,
   isLoading
   }
}