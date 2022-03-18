const {graphqlHTTP} = require('express-graphql');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const typedefsSchema = require('./graphql_schema/typedefs/typedefs');
const resolvers = require('./graphql_schema/resolvers/resolvers');
const db = require('./config/keys').mongoURI;
const Users = require('./database/model/Users');

// Calling express server
const app = express();
app.use(bodyParser.json());

// Db connection
mongoose
    .connect(db)
    .then(() => {
        console.log("Database connected successfully....");
    })
    .catch((err) => {
        console.log(err);
    });

// Signup rest api
app.post('/signup', (req, res, err) => {
    const userDetails = new Users({
        username: req.body.username,
        password: req.body.password,
        fullName: req.body.fullName,
        email: req.body.email,
        about: req.body.about,
        profilePicture: req.body.profilePicture
    });
    userDetails.save()
        .then(data => res.json(data))
        .catch(error => {
            console.log(error);
            res.status(500).json({
                error: error
            });
        })
});

// Login rest api
app.post('/login', (req, res, err) => {
    let username = req.body.username;
    let password = req.body.password;
    Users.findOne({username: username, password: password})
        .exec()
        .then(accounts => {
            if (accounts == null)
            {
                res.status(422).json({message: "Invalid username and password"});
            }
            else
            {
                res.status(200).json({
                    message: "login successful",
                    currentUser: username
                });
            }
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                error: error
            });
        })
});

// app.use("/", (req, res) => {
//     res.send("Welcome to UofT Socials!!!");
//     res.status(200);
//     res.end();
// });

app.use('/graphql', graphqlHTTP({
    schema: typedefsSchema,
    rootValue: resolvers,
    graphiql: true
}));

// Listen localhost server at port 4000
const PORT = 4000;
app.listen(PORT, (err) => {
    if (err) console.log(err);
    else console.log("Server listening at port 4000 and on http://localhost:%s", PORT)
});