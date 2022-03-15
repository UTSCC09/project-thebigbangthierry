const dbConnect = require('./database/Connection/connection');
const {ApolloServer} = require('apollo-server-express');
const express = require('express');

const startServer = async () => {
    await dbConnect()
        .then((result) => console.log(result))
        .catch((err) => console.log(err));
    const app = express();
    app.use("/", (req, res) => res.send("Welcome to UofT Socials!!!"));

    const PORT = 4000;
    app.listen(PORT, (err) => {
        if (err) console.log(err);
        else console.log("Server listening at port 4000 and on http://localhost:%s", PORT)
    });
};

startServer();