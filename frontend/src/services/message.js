import React, { createContext, useReducer, useContext } from 'react'
const MessageStateContext = createContext()
const MessageDispatchContext = createContext()

const messageReducer = (state, action) => {
  let usersCopy, userIndex
  const { username, message, messages, reaction } = action.payload
  switch (action.type) {
    case 'ADD_USER':
      usersCopy = state.users? [...state.users] : [];   

      let userLen = action.payload.length; 

      if (userLen > 0) {
        usersCopy = [...usersCopy, {...action.payload[userLen-1], messages: []}]
      }
      return {
        ...state,
        users: usersCopy 
      }
    case 'SET_USERS':
      return {
        ...state,
        users: action.payload,
      }
    case 'SET_USER_MESSAGES':
      usersCopy = [...state.users]

      userIndex = usersCopy.findIndex((u) => u.username === username)

      usersCopy[userIndex] = { ...usersCopy[userIndex], messages }

      return {
        ...state,
        users: usersCopy,
      }
    case 'ADD_MESSAGE':
      usersCopy = [...state.users]

      userIndex = usersCopy.findIndex((u) => u.username === username)

      let newUser = {
        ...usersCopy[userIndex],
        messages: usersCopy[userIndex].messages
          ? [message, ...usersCopy[userIndex].messages]
          : null,
      }

      usersCopy[userIndex] = newUser

      return {
        ...state,
        users: usersCopy,
      }
    
    case 'ADD_REACTION' : 
      usersCopy = [...state.users]

      userIndex = usersCopy.findIndex((u) => u.username === username)

      let userCopy = {...usersCopy[userIndex]} 
      
      const messageIndex = userCopy.messages?.findIndex(m => m._id === reaction.messageId._id);
      if (messageIndex > -1) {
        let messagesCopy = [...userCopy.messages];

        let reactionsCopy = [{reactEmoji: reaction.reactEmoji}] ; 

        messagesCopy[messageIndex] = {
          ...messagesCopy[messageIndex], 
          reaction: reactionsCopy
        }; 
        userCopy = {...userCopy, messages: messagesCopy}; 
        usersCopy[userIndex] = userCopy; 
      }
      return {
        ...state, 
        users: usersCopy
      }
    default:
      throw new Error(`Unknown action type: ${action.type}`)
  }
}

export const MessageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, { users: null })

  return (
    <MessageDispatchContext.Provider value={dispatch}>
      <MessageStateContext.Provider value={state}>
        {children}
      </MessageStateContext.Provider>
    </MessageDispatchContext.Provider>
  )
}

export const useMessageState = () => useContext(MessageStateContext)
export const useMessageDispatch = () => useContext(MessageDispatchContext)