const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require("path");
const session = require('express-session');
const cookie = require('cookie');
const validator = require('validator');
const bcrypt = require('bcrypt');
const enforce = require("express-sslify");
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: __dirname + '/./.env'});
const {WebSocketServer} = require('ws');
const {useServer} = require('graphql-ws/lib/use/ws');
const { createServer } = require('http');
const {ApolloServer} = require('apollo-server-express');

const db = require('./config/keys').mongoURI;
const Users = require('./database/Model/Users');
const Post = require('./database/Model/Post');
const schema = require('./graphql_schema/schema');
const cloudinary = require('./config/cloudinary');
const upload = require('./config/multer');
const context = require('./auth/contextMiddleware');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const config = require('./config/config'); 

// Calling express server
const app = express();
app.use(bodyParser.json());
const appOrigin = config.app.origin
// Add cors
app.use(cors({ 
    origin: function(origin, callback) {
        if(!origin) return callback(null, true);

        if(appOrigin.indexOf(origin) === -1){
            var msg = 'The CORS policy for this site does not ' +
                      'allow access from the specified Origin.';
            return callback(new Error(msg), false);
          }
        return callback(null, true);
    } 
}));

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

// Display the HTTPS request requested on console
app.use(function (req, res, next){
    let username = (req.session.user)? req.session.user.username : '';
    res.setHeader('Set-Cookie', cookie.serialize('username', username, {
        path : '/', 
        maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
    }));
    console.log("HTTP request", username, req.method, req.url, req.body);
    next();
});

// Check username for bad inputs
const checkUsername = function(req, res, next) {
    if (!validator.isAlphanumeric(req.body.username)) return res.status(400).json({"error": "Username should be alphabet or numeric"});
    next();
};

// Check password for bad inputs
const checkPassword = function(req, res, next) {
    let password = req.body.password;
    const regex = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");
    if (!regex.test(password))
    {
        return res.status(400).json({"error": "Password should be atleast 1 uppercase and atleast 1 lowercase alphabet, atleast 1 number and atleast 1 of !@#$&*"});   
    }
    if(password.length <= 7) return res.status(400).json({"error": " Password should atleast be 8 characters long"});
    next();
};

// Signup rest api
app.post('/signup', upload.single('profilePicture'), checkUsername, checkPassword, (req, res, next) => {
    // extract data from HTTPS request
    if (!('username' in req.body)) return res.status(400).json({"error": "username is missing"});
    if (!('password' in req.body)) return res.status(400).json({"error": "password is missing"});
    if (!('fullName' in req.body)) return res.status(400).json({"error": "Full name is missing"});
    if (!('email' in req.body)) return res.status(400).json({"error": "Email is missing"});

    Users.findOne({username: req.body.username})
        .then((checkUser, error) => {
            if(error) return res.status(500).json(error);
            if(checkUser) return res.status(409).json({"error": "Username " + req.body.username + " is already in use"});

            // Avoid repeating email by users
            Users.findOne({email: req.body.email})
                .then((user, error) => {
                    if(error) return res.status(500).json(error);
                    if(user) return res.status(409).json({"error": "Email " + req.body.email + " is already in use"});
                    let pass = req.body.password;
                    // Store password as a hashtable
                    bcrypt.genSalt(10)
                        .then(salt => {
                            bcrypt.hash(pass, salt)
                                .then(async (hashPass) => {
                                    try
                                    {
                                        let profilePicUrl = "";
                                        if (req.file != undefined)
                                        {
                                            let pathFile = req.file.path;
                                            if (pathFile !== undefined && pathFile !== null && pathFile !== "")
                                            {
                                                const picture = await cloudinary.uploader.upload(pathFile, {
                                                    public_id: req.body.username,
                                                    eager: [{ width: 180, height: 180, crop: "scale", quality: "100" }]
                                                });
                                                profilePicUrl = picture.eager[0].secure_url;
                                            }
                                        }
                                        
                                        const userDetails = new Users({
                                            username: req.body.username,
                                            password: hashPass,
                                            fullName: req.body.fullName,
                                            email: req.body.email,
                                            about: req.body.about,
                                            profilePicture: profilePicUrl
                                        });
                                        console.log(userDetails);
                                        userDetails.save()
                                            .then(data => res.json(data))
                                            .catch(error => {
                                                console.log(error);
                                                res.status(500).json({
                                                    error: error
                                                });
                                            });
                                    }
                                    catch(e)
                                    {
                                        console.log(e);
                                        res.status(500).json({
                                            error: e
                                        });
                                    }
                                })
                                .catch(error => {
                                    console.log(error);
                                    res.status(500).json({
                                        error: error
                                    });
                                });
                        })
                        .catch(error => {
                            console.log(error);
                            res.status(500).json({
                                error: error
                            });
                        });
                })
                .catch(error => {
                    console.log(error);
                    res.status(500).json({
                        error: error
                    });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: error
            });
        });
});

// Login rest api
app.post('/login', checkUsername, checkPassword, (req, res, next) => {
    // extract data from HTTPS request
    if (!('username' in req.body)) return res.status(400).json({"error": "username is missing"});
    if (!('password' in req.body)) return res.status(400).json({"error": "password is missing"});

    let username = req.body.username;
    let password = req.body.password;

    // retrieve user
    Users.findOne({username: username})
        .then(user => {
            console.log(user);
            if (!user) return res.status(401).json({"error": "Invalid username or password"});
            bcrypt.compare(password, user.password)
                .then(validUser => {
                    if (!validUser) return res.status(401).json({"error": "Invalid username or password"});

                    // start a session
                    req.session.user = user;
                    res.setHeader('Set-Cookie', cookie.serialize('username', username, {
                        path : '/', 
                        maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
                        httpOnly: false,
                        secure: true,
                        sameSite: 'strict'
                   }));
                   const token = jwt.sign({username}, process.env.JSON_SECRET, {expiresIn: 24 * 60 * 60});
                   return res.status(200).json({username: username, token: token, tokenExpiration: 1});
                })
                .catch(error => {
                    console.log(error);
                    res.status(500).json({
                        error: error
                    });
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
        if (err) return res.status(500).json({"error": err});
        res.setHeader('Set-Cookie', cookie.serialize('username', '', {
            path : '/', 
            maxAge: 60 * 60 * 24 * 7 // 1 week in number of seconds
      }));
      return res.json("Signout successful");
    }); 
});

// Rest api for create post (doing it in rest because of multer and cloudinary so that it is consistent)
// Request body - username, textContent, image; Request header - authorization
app.post('/createPost', upload.single('image'), function (req, res, next) {
    if (!('username' in req.body)) return res.status(400).json({"error": "username is missing"});
    if (!('textContent' in req.body) && !('image' in req.body)) 
    {
        return res.status(400).json({"error": "Text and Image are missing"});
    }

    let token;
    if(req.headers.authorization)
    {
        token = req.headers.authorization.split('Bearer ')[1];
    }
    let decodedToken
    if(token)
    {
        try 
        {
            decodedToken = jwt.verify(token, process.env.JSON_SECRET);
        } 
        catch (error) 
        {
            console.log(error);
            return res.status(500).json({error: error});
        }
    }

    if(decodedToken.username !== req.body.username)
    {
        return res.status(401).json({"error": "Unauthenticated user"});
    }

    let username = req.body.username;
    let content = req.body.textContent;

    if(content === "" && (req.file === undefined || req.file === null))
    {
        return res.status(400).json({"error": "Post needs to have some text or upload an image"});
    }

    // Find the user 
    Users.findOne({username: username})
        .then(async (user) => {
            if (!user) return res.status(401).json({"error": "Username does not exist in the db"});

            try 
            {
                let profilePicUrl = "";

                if(req.file !== undefined && req.file !== null)
                {
                    let pathFile = req.file.path;
                    if(pathFile !== undefined && pathFile !== null && pathFile !== "")
                    {
                        const picture = await cloudinary.uploader.upload(pathFile, {
                            eager: [{width: 400, height: 400, crop: "scale", quality: "100"}]
                        });
                        profilePicUrl = picture.eager[0].secure_url;
                    }
                }

                const postDetails = new Post({
                    poster: user._id,
                    posterUsername: username,
                    posterProfilePic: user.profilePicture,
                    textContent: content,
                    image: profilePicUrl
                });
                console.log(postDetails);
                postDetails.save()
                    .then((data) => {
                        return res.json(data)
                    })
                    .catch((error) => {
                        console.log(error);
                        return res.status(500).json({
                            error: error
                        });
                    });
            } 
            catch (error) 
            {
                console.log(error);
                return res.status(500).json({
                    error: error
                });
            }
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({
                error: err
            });
        });
});

// Rest api for updating profile picture (doing it in rest because of multer and cloudinary so that it is consistent)
// Request body - username, profile picture file; Request header - authorization
app.put('/editProfilePicture',upload.single('profilePicture'), function (req, res, next) {
    if (!('username' in req.body)) return res.status(400).json({"error": "username field is missing"});

    let token;
    if(req.headers.authorization)
    {
        token = req.headers.authorization.split('Bearer ')[1];
    }
    let decodedToken
    if(token)
    {
        try 
        {
            decodedToken = jwt.verify(token, process.env.JSON_SECRET);
        } 
        catch (error) 
        {
            console.log(error);
            return res.status(500).json({error: error});
        }
    }

    if(decodedToken.username !== req.body.username)
    {
        return res.status(401).json({"error": "Unauthenticated user"});
    }

    let username = req.body.username;

    if(req.file === undefined || req.file === null)
    {
        return res.status(400).json({"error": "User needs to upload an image"});
    }

    // Find the user
    Users.findOne({username: username})
        .then(async (user) => {
            if (!user) return res.status(401).json({"error": "Username does not exist in the db"});

            try 
            {
                let profilePicUrl = "";

                if(req.file !== undefined && req.file !== null)
                {
                    let pathFile = req.file.path;
                    if(pathFile !== undefined && pathFile !== null && pathFile !== "")
                    {
                        const picture = await cloudinary.uploader.upload(pathFile, {
                            public_id: username,
                            eager: [{width: 180, height: 180, crop: "scale", quality: "100"}]
                        });
                        profilePicUrl = picture.eager[0].secure_url;
                    }
                }

                Users.updateOne({username: username}, {profilePicture: profilePicUrl})
                    .exec()
                    .then(() => res.json({message: "Profile picture updated successfully!"}))
                    .catch((error) => {
                        console.log(error);
                        return res.status(500).json({error: error});
                    });
            } 
            catch (error) 
            {
                console.log(error);
                return res.status(500).json({
                    error: error
                });
            }
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).json({
                error: err
            });
        });
});

// Frontend connect for deployment
if (process.env.NODE_ENV === "production") {
    app.use(enforce.HTTPS({ trustProtoHeader: true }));
    app.use(express.static(path.join(__dirname, "../frontend/build")));
  
    app.get("*", (req, res) =>
      res.sendFile(path.join(__dirname, "../frontend/build/index.html"))
    );
}

const httpServer = createServer(app);
const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql'
});

const serverCleanup = useServer({ 
        schema,
    }, 
    wsServer);

let server
async function startServer()
{
    server = new ApolloServer({
        schema,
        context: context,
        plugins: [
            // Shutdown http server
            ApolloServerPluginDrainHttpServer({httpServer}),
            // Shutdown web socket server
            {
                async serverWillStart()
                {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ]
    });
    await server.start();
    server.applyMiddleware({app});
}

startServer();
// Listen localhost server at port 4000
const PORT = 4000;
httpServer.listen(config.server.port, function(err){
    if (err) console.log(err);
    else 
    {
        console.log("HTTP server on http://localhost:%s%s", config.server.port, server.graphqlPath);
    }
});