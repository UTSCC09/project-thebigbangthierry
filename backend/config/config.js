console.log( process.env.NODE_ENV );
const port = process.env.NODE_ENV === ("development") ? 4000 : process.env.PORT;
const config = {
  server: {
    port: port 
  },
  app : {
    origin: ["http://localhost:3000", "https://uoftsocials.herokuapp.com", "wss://uoftsocials.herokuapp.com"]
  }
 }; 

 module.exports = config;