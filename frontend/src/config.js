export const api_base =
  process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : 'https://uoftsocials.herokuapp.com'

export const ws_base = 
  process.env.NODE_ENV === 'development' ? `ws://localhost:4000` : `wss://uoftsocials.herokuapp.com`