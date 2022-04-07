import React, { createContext , useReducer, useContext} from 'react'; 
import jwtDecode from 'jwt-decode'; 

const AuthStateContext = createContext(); 
const AuthDispatchContext = createContext(); 

let usertoken = null; 
const user = JSON.parse(localStorage.getItem('user')); 
if (user) {
  // console.log(user); 
  const token = user.token; 
  const decodedToken = jwtDecode(token) 
  const expiresAt = new Date(decodedToken.exp * 1000); 
  
  if (new Date() > expiresAt) {
    localStorage.removeItem('user');
    localStorage.removeItem("token");
    localStorage.removeItem("isLogin");  
  }
  else {
    usertoken = decodedToken; 

  }
} else console.log("no token found"); 

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN': 
      return {
        ...state, 
        user: action.payload
      }
    case 'LOGOUT': 
      return {
        ...state, 
        user: action.payload
      }
    default: 
      throw new Error(`Unknown action type': ${action.type}`)
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { usertoken })
  return (
    <AuthDispatchContext.Provider value={dispatch}>
      <AuthStateContext.Provider value={state}>
        {children} 
      </AuthStateContext.Provider>
    </AuthDispatchContext.Provider>
  )
}

export const useAuthState = () => useContext(AuthStateContext)
export const useAuthDispatch = () => useContext(AuthDispatchContext)