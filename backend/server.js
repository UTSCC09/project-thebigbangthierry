const {graphqlHTTP} = require('express-graphql');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const https = require('https');
const fs = require('fs');
const path = require("path");
const session = require('express-session');
const cookie = require('cookie');
const validator = require('validator');
const bcrypt = require('bcrypt');

const typedefsSchema = require('./graphql_schema/typedefs/typedefs');
const resolvers = require('./graphql_schema/resolvers/resolvers');
const db = require('./config/keys').mongoURI;
const Users = require('./database/model/Users');
const graphqlSchema = require('./graphql_schema/schema');

// Calling express server
const app = express();
app.use(bodyParser.json());

app.use(session({
    secret: 'please change this secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'strict'
    }
}));

// Db connection
mongoose
    .connect(db)
    .then(() => {
        console.log("Database connected successfully....");
    })
    .catch((err) => {
        console.log(err);
    });

// Display the HTTPS request requested on console
app.use(function (req, res, next){
    let cookies = cookie.parse(req.headers.cookie || '');
    req.username = (cookies.username)? cookies.username : null;
    console.log("HTTPS request", req.username, req.method, req.url, req.body);
    next();
});

// Check username for bad inputs
const checkUsername = function(req, res, next) {
    if (!validator.isAlphanumeric(req.body.username)) return res.status(400).end(" Username should be alphabet or numeric");
    next();
};

// Check password for bad inputs
const checkPassword = function(req, res, next) {
    let password = req.body.password;
    if (!validator.isAlphanumeric(password)) return res.status(400).end(" Password should be alphabet or numeric");
    if(password.length <= 7) return res.status(400).end(" Password should atleast be 8 characters long")
    next();
};

// Signup rest api
app.post('/signup', checkUsername, checkPassword, (req, res, err) => {
    // extract data from HTTP request
    if (!('username' in req.body)) return res.status(400).end('username is missing');
    if (!('password' in req.body)) return res.status(400).end('password is missing');
    if (!('fullName' in req.body)) return res.status(400).end('Full name is missing');
    if (!('email' in req.body)) return res.status(400).end('Email is missing');

    // Avoid repeating email by users
    Users.findOne({email: req.body.email})
        .then((user, error) => {
            if(error) return res.status(500).end(error);
            if(user) return res.status(409).end("Email " + req.body.email + " is already in use");
            let pass = req.body.password;
            // Store password as a hashtable
            bcrypt.genSalt(10)
                .then(salt => {
                    bcrypt.hash(pass, salt)
                        .then(hashPass => {
                            const userDetails = new Users({
                                username: req.body.username,
                                password: hashPass,
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
                                });
                        })
                        .catch(error => {
                            console.log(error);
                            throw error;
                        });
                })
                .catch(error => {
                    console.log(error);
                    throw error;
                });
        })
        .catch(error => {
            console.log(error);
            throw error;
        });
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

app.use('/graphql', graphqlHTTP({
    schema: typedefsSchema,
    rootValue: resolvers,
    graphiql: true
}));

// HTTPS server
var privateKey = fs.readFileSync( 'server.key' );
var certificate = fs.readFileSync( 'server.crt' );
var config = {
        key: privateKey,
        cert: certificate
};

// Listen localhost server at port 4000
const PORT = 4000;
https.createServer(config, app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTPS server on https://localhost:%s", PORT);
});