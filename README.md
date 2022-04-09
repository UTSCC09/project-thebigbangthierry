# UofTsocials

## Project URL

**Task:** Provide the link to your deployed application. Please make sure the link works. 

https://uoftsocials.herokuapp.com/
## Project Video URL 

**Task:** Provide the link to your youtube video. Please make sure the link works. 

https://youtu.be/0Pa6UtLa1yw

## Project Description

**Task:** Provide a detailed description of your app

UofTSocials is a social media app that allows the members of University of Toronto i.e., students and faculty to able to communicate with one another via this website. This app allows students to post their queries about a course or logistics information about UofT. UofT clubs can post about upcoming events then, faculty can post about any information regarding admissions or new course information. This allows for students of UofT to just signup on one social media app rather than having to signup on different social media apps like Facebook, Reddit and Instagram.

Features of UofTsocials app:
- **Text chatting** : Users who follow one another can communicate via text chatting in our app. If user A follows another user B but B does not follow back then the users A and B will not be able to communicate via text chatting.
- **Video calling** : Any user who is signed up on the app can use video calling to talk to one another. They just need to create a room with a unique name and provide the room name to the person they wanna talk to via our text chat. The video room allows only 2 participants to join so if a third user tries to enter the room the user will be redirected back to lobby and a message shows up that says room is full.
- **Posts** : User A can post a message or an image in the app. Only users who follow user A will be able to see that post on the website. Users can create, view and delete its own post in the Profile page under the Posts tab. Users can browse the posts of the users that they follow on the Home page and they can like or dislike the post as well.
- **Comments**: A user browsing the posts on Home page can comment on any of them.
- **Following users** : A user can follow another user by going to the Profile page and under the Search tab. The user needs to search for the username of the user that they want to follow or they can write a part of the username and it will show the top 10 results.
- **Edit profile information** - A user can update its profile picture, about section, full name and password.
- **Signup** - User can signup using their UofT email address (@utoronto.ca , @mail.utoronto.ca , @alum.utoronto.ca, @alumni.utoronto.ca) and needs to have a unique username. Same email cannot be used to signup for 2 accounts.

## Development

**Task:** Leaving deployment aside, explain how the app is built. Please describe the overall code design and be specific about the programming languages, framework, libraries and third-party api that you have used. 

**.github/workflows**
This folder has a yml file which allows for Continuous Integration and builds action workflows to deploy on Heroku. Only after the CI passes, the app can then be deployed.

**Backend**
The backend uses JavaScript as its main programming language. Backend is built mostly with GraphQL apis and few REST apis. The main server for backend is Apollo Server and adding Express as its middleware. The main files for the backend are `./backend/server.js` and `./backend/graphql_schema/schema.js` as that is where all the APIs are present. `server.js` in the backend folder has all the information necessary to connect to servers or files in config folder or authorization in auth folder.

The overall design based on folders is as follows: 
- **auth** : The file inside the folder has the code for verfiying the jwt token of the user received from frontend to check in the apis whether this user is allowed to perform the particular action.
- **config** : cloudinary file gets secret information about our cloudinary account from environment variables. config file helps get the information about the port that the app is running on and also gives urls for cors. keys gets the mongodb url to connect to the database. multer helps with storing images.
- **database** : This folder stores all the models for mongodb.
- **graphql_schema** : This folder has the file that contains all the GraphQL apis.

**Libraries used**
- apollo-server-express, express, graphql
- jsonwebtoken, bcrypt, validator
- ws, graphql-ws, graphql-subscriptions
- twilio
- express-sslify (redirect heroku app to https if http url is written)
- cors
- mongoose
- multer, cloudinary

**Third party**
- Twilio
- Cloudinary

**Frontend**
The frontend folder was created using create-react-app. Making the main language of the program Javascript. The main files that are rendered can be found in `./frontend/src`

The overall design based on folders is as follows: 
- **components** : holds the pages as well as any smaller UI components used inside the pages 
- **utils**: holds miscellaneous tools used by the overall structure of the app (windowsize, dynamicroute)
- **services**: holds authentication and context components 
- **media**: holds static UI images 

**Libraries used:** 
- react
- @mui/material
- @mui/icons-material 
- react-hook-form
- twilio-video
- apollo-boost
- @apollo/client
- @apollo/react-hooks
- graphql-ws 
- jwt-decode
- react-router-dom 
- prop-types


## Deployment

**Task:** Explain how you have deployed your application. 

The website UofTSocials is deployed on Heroku. We have added CI/CD to our deployment Heroku. CI is done using workflow file main.yml and once the CI passes then only does Heroku deploy automatically. To get CI working the HEROKU_API_KEY is needed in action secrets in the github repository. We have connected our Github repo to the Heroku account and enabled Deploying automatically when CI passes on the commits that happen on master branch. 

## Maintenance

**Task:** Explain how you monitor your deployed app to make sure that everything is working as expected.

In order to monitor our deployed app, we check the heroku logs so that there are no errors happening while deployed. When a deployment fails, a member of our team receives an email from Heroku about it. Since we are using third party applications like Cloudinary to store images and Twilio for video calling , we monitor those websites as well to ensure everything is working smoothly and there are no issues coming up which can halt the application on Heroku.

## Challenges

**Task:** What is the top 3 most challenging things that you have learned/developed for you app? Please restrict your answer to only three items. 

1. Deployment 
2. Video Chatting  
3. Subscription 

## Contributions

**Task:** Describe the contribution of each team member to the project. Please provide the full name of each team member (but no student number). 

**Cherie Chee Ching Kong** - assisted in Deployments , Designed and implemented Frontend portion of features 

**Vineet Arunkumar Desai** - Deployed the app to Heroku along with CI/CD, Designed and implemented the entire backend portion of features

# One more thing? 

**Task:** Any additional comment you want to share with the course staff? 

Note: 
- If you wish to emulate two users interacting it requires either two seperate browsers (ie. safari, chrome, firefox) or one regular/ incognito window as we store our jwt token in local storage so with same browser windows the local storage is shared and the users will get entangled. 
- Also since we have deployed on Heroku for free, the dyno goes off to sleep after 30 minutes of inactivity so it takes some seconds for the app to load at first. Once, loaded the app loads quickly the second time.