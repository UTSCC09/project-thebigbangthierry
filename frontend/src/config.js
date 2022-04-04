export const api_base =
  process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '/api'

export const ws_base = 
  process.env.NODE_ENV === 'development' ? `ws://localhost:4000` : `/wsapp`