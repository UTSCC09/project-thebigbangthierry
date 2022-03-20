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
const enforce = require("express-sslify");
const cors = require('cors');

const typedefsSchema = require('./graphql_schema/typedefs/typedefs');
const resolvers = require('./graphql_schema/resolvers/resolvers');
const db = require('./config/keys').mongoURI;
const Users = require('./database/Model/Users');
const schema = require('./graphql_schema/schema');

// Calling express server
const app = express();
app.use(bodyParser.json());

// Add cors
app.use(cors());

// Add cookie session
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

// GraphQL APIs
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}));

// Display the HTTPS request requested on console
app.use(function (req, res, next){
    let username = (req.session.user)? req.session.user.username : '';
    res.setHeader('Set-Cookie', cookie.serialize('username', username, {
        path : '/', 
        maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    console.log("HTTPS request", username, req.method, req.url, req.body);
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
app.post('/api/signup', checkUsername, (req, res, err) => {
    // extract data from HTTPS request
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
app.post('/login', checkUsername, checkPassword, (req, res, err) => {
    // extract data from HTTPS request
    if (!('username' in req.body)) return res.status(400).end('username is missing');
    if (!('password' in req.body)) return res.status(400).end('password is missing');

    let username = req.body.username;
    let password = req.body.password;

    // retrieve user
    Users.findOne({username: username})
        .then(user => {
            console.log(user);
            if (!user) return res.status(401).end("Invalid username or password");
            bcrypt.compare(password, user.password)
                .then(validUser => {
                    if (!validUser) return res.status(401).end("Invalid username or password");

                    // start a session
                    req.session.user = user;
                    res.setHeader('Set-Cookie', cookie.serialize('username', username, {
                        path : '/', 
                        maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
                        httpOnly: false,
                        secure: true,
                        sameSite: 'strict'
                   }));
                   return res.status(200).json(username);
                })
                .catch(error => {
                    console.log(error);
                    throw error;
                });
        })
        .catch(error => {
            console.log(error);
            res.status(500).json({
                error: error
            });
        });
});

// Rest api for sign out
app.get('/signout', function (req, res, next) {
    // destroy session after sign out
    req.session.destroy(function(err){
        if (err) return res.status(500).end(err);
        res.setHeader('Set-Cookie', cookie.serialize('username', '', {
            path : '/', 
            maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
      }));
      return res.json("Signout successful");
    }); 
});

// Frontend connect
// console.log(process.env);
if (process.env.NODE_ENV === "production") {
    app.use(enforce.HTTPS({ trustProtoHeader: true }));
    app.use(express.static(path.join(__dirname, "../frontend/build")));
  
    app.get("*", (req, res) =>
      res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
    );
}

// Listen localhost server at port 4000
const PORT = 4000;
app.listen(PORT, function(err){
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});