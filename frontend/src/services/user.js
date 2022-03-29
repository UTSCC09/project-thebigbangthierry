import React, { createContext, useReducer, useContext } from 'react'

const UserStateContext = createContext()
const UserDispatchContext = createContext()

const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
      }
    default:
      throw new Error(`Unknown action type: ${action.type}`)
  }
}

export const UserProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, { users: null })

  return (
    <UserDispatchContext.Provider value={dispatch}>
      <UserStateContext.Provider value={state}>
        {children}
      </UserStateContext.Provider>
    </UserDispatchContext.Provider>
  )
}

export const useUserState = () => useContext(UserStateContext)
export const useUserDispatch = () => useContext(UserDispatchContext)