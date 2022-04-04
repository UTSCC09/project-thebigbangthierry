console.log( process.env.NODE_ENV );
const port = process.env.NODE_ENV === ("development") ? 4000 : 80;
const config = {
  server: {
    port: port 
  },
  app : {
    origin: "http://localhost:3000"
  }
 }; 

 module.exports = config;