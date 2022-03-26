/*** SOURCES THAT NEED TO BE CREDITED ***/
/*** 
 * Idea for structure of graphql apis from https://atheros.ai/blog/graphql-list-how-to-use-arrays-in-graphql-schema
 * CRUD functions for mongodb database https://www.mongodb.com/docs/manual/crud/
***/

// package imports
const graphql = require('graphql');
const bcrypt = require('bcrypt');
const Users = require('../database/Model/Users');
const Messages = require('../database/Model/Messages');
const {PubSub, withFilter} = require('graphql-subscriptions');
const pubsub = new PubSub();

const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
} = graphql;

const UserInputType = new GraphQLObjectType({
  name: 'UsersInput',
  fields: () => ({
    username: { type: new GraphQLNonNull(GraphQLString) },
    profilePicture: {type: GraphQLString}
  })
});

const AboutInputType = new GraphQLObjectType({
  name: 'AboutInput',
  fields: () => ({
    username: { type: new GraphQLNonNull(GraphQLString) },
    about: {type: GraphQLString}
  })
});

const PasswordInputType = new GraphQLObjectType({
  name: 'Password',
  fields: () => ({
    username: { type: new GraphQLNonNull(GraphQLString) },
    password: {type: new GraphQLNonNull(GraphQLString) }
  })
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    _id: { type: GraphQLID },
    username: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: GraphQLString },
    fullName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    about: {type: GraphQLString},
    profilePicture: {type: GraphQLString},
    followerList: {type: new GraphQLList(UserInputType)},
    followingList: {type: new GraphQLList(UserInputType)}
  })
});

const MessageType = new GraphQLObjectType({
  name: 'Message',
  fields: () => ({
    uuid: { type: new GraphQLNonNull(GraphQLID) },
    fromUsername: { type: new GraphQLNonNull(GraphQLString) },
    toUsername: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: GraphQLString },
    createdAt: { type: GraphQLString }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    // Get Users
    user: {
      type: new GraphQLNonNull(UserType),
      args: { username: { type: new GraphQLNonNull(GraphQLString) } },
      async resolve(parent, args, {authUser}) {
        console.log(authUser);
        try 
        {
          if(!authUser)
          {
            throw new Error("Unauthenticated user");
          }
          const users = await Users.findOne({username: args.username});

          console.log(users);
          return users;
        } 
        catch (err) 
        {
          console.log(err);
          throw err;
        }
      }
    },

    // Get messages for the chat between 2 usernames
    getMessages: {
      type: new GraphQLList(new GraphQLNonNull(MessageType)),
      args: { 
        fromUsername: { type: new GraphQLNonNull(GraphQLString) },
        toUsername: { type: new GraphQLNonNull(GraphQLString) } 
      },
      async resolve(parent, args, {authUser})
      {
        try {
          if(!authUser)
          {
            throw new Error("Unauthenticated user");
          }
          const user1 = await Users.findOne({username: args.fromUsername});
          if (!user1) return new Error("Username " + args.fromUsername + " does not exist");
          const user2 = await Users.findOne({username: args.toUsername});
          if (!user2) return new Error("Username " + args.toUsername + " does not exist");

          const messages = await Messages.find({ 
            $or: [ 
              { $and: [{fromUser: user1.username}, {toUser: user2.username}] }, 
              { $and: [{fromUser: user2.username}, {toUser: user1.username}] } 
            ] }).sort({createdAt: -1});

          console.log(messages);
          return messages;
        } 
        catch (error) {
          console.log(error)
          throw error;
        }
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // All APIs related to Edit

    // Editing full name for a given username
    editFullName: {
      type: UserType,
      args: { 
        username: { type: new GraphQLNonNull(GraphQLString) } ,
        fullName: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parent, args, {authUser})
      {
        if(!authUser)
        {
          throw new Error("Unauthenticated user");
        }
        try 
        {
          if(args.fullName != null && args.fullName != undefined && args.fullName != "")
          {
            // update full name of the given username
            return Users.updateOne({username: args.username}, {fullName: args.fullName})
              .exec()
              .then(() => {
                const users = Users.findOne({username: args.username});
                return users;
              })
              .catch(err => {
                console.log(err);
                throw err;
              });
          }
          else
          {
            return new Error(args.fullName + " not defined or null or empty. Please send a legitimate string.");
          }
        } 
        catch(err) 
        {
          console.log(err);
          throw err;
        }
      }
    },

    // Edit about field for given username
    editAbout: {
      type: AboutInputType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        about: { type: GraphQLString }
      },
      // Edit About section for a user
      async resolve(parent, args, {authUser}) 
      {
        if(!authUser)
        {
          throw new Error("Unauthenticated user");
        }
        try 
        {
          if(args.about != null && args.about != undefined)
          {
            // update about section of the given username
            return Users.updateOne({username: args.username}, {about: args.about})
              .exec()
              .then(() => {
                const users = {username: args.username, about: args.about};
                return users;
              })
              .catch(err => {
                console.log(err);
                throw err;
              })
          }
        } 
        catch (error) 
        {
          console.log(error);
          throw error;
        }
      }
    },

    editPassword: {
      type: PasswordInputType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: GraphQLString }
      },
      async resolve (parent, args, {authUser}) {
        if(!authUser)
        {
          throw new Error("Unauthenticated user");
        }
        try 
        {
          let pass = args.password;
          if(args.password != null && args.password != undefined && args.password != "")
          {
            // update full name of the given username
            return Users.findOne({username: args.username})
              .exec()
              .then((user) => {
                if (!user) return new Error(args.username + " not a user");

                const regex = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");
                if (!regex.test(pass))
                {
                  return new Error("Password should be atleast 8 characters and contain atleast 1 uppercase and atleast 1 lowercase alphabet, atleast 1 number and atleast 1 of !@#$&*");   
                }

                return bcrypt.genSalt(10)
                  .then(salt => {
                    return bcrypt.hash(pass, salt)
                      .then(hashPass => {
                        return User.updateOne({username: args.username}, {password: hashPass})
                          .then(() => {
                            const users = {username: args.username, password: hashPass}
                            return users;
                          })
                          .catch(err => {
                            console.log(err);
                            throw err;
                          });
                      })
                      .catch(err => {
                        console.log(err);
                        throw err;
                      });
                  })
                  .catch(err => {
                    console.log(err);
                    throw err;
                  });
              })
              .catch((err) => {
                console.log(err);
                throw err;
              });
          }
          else
          {
            return new Error(args.password + " not defined or null or empty. Please send a legitimate password.");
          }
        } 
        catch(err) 
        {
          console.log(err);
          throw err;
        }
      }
    },
    
    // APIs related follower and following below

    // Add a user (A) to the follower list of another user (B). And add B to following list of A
    addToFollowerList: {
      type: UserType,
      args: {
        username1: { type: new GraphQLNonNull(GraphQLString) },
        username2: { type: new GraphQLNonNull(GraphQLString) },
        profilePicture: { type: GraphQLString }
      },
      // Username1 gets followed by Username2. Profile picture of username2
      async resolve(parent, args, {authUser}) {
        try 
        {
          if(!authUser)
          {
            throw new Error("Unauthenticated user");
          }
          let user1 = args.username1;
          let user2 = args.username2;
          let pic = args.profilePicture;

          return Users.findOne({username: user1})
            .exec()
            .then((user) => {
              if (!user) return new Error(user + " not in database ");
              return Users.findOne({username: user2})
                .exec()
                .then((user2exist) => {
                  if (!user2exist) return new Error(user2exist + " not in database ");
                  let followerList = user.followerList;
                  let followingList = user2exist.followingList;
                  for(let i = 0; i < followerList.length; i++)
                  {
                    if (followerList[i].username == user2)
                    {
                      return new Error(user2 + " already following the user " + user1);
                    }
                  }
                  for(let j = 0; j < followerList.length; j++)
                  {
                    if (followerList[j].username == user1)
                    {
                      return new Error(user2 + " already following the user " + user1);
                    }
                  }
                  followerList.push({"username": user2, "profilePicture": pic});
                  followingList.push({"username": user1, "profilePicture": user1.profilePicture});
                  return Users.updateOne({username: user1}, {followerList: followerList})
                    .exec()
                    .then(() => {
                      return Users.updateOne({username: user2}, {followingList: followingList})
                        .exec()
                        .then(() => {
                          const updatedUsers = Users.findOne({username: user2});
                          return updatedUsers;
                        })
                        .catch((err) => {
                          console.log(err);
                          throw err;
                        });
                      })
                    .catch((err) => {
                      console.log(err);
                      throw err;
                    });
                })
                .catch((err) => {
                  console.log(err);
                  throw err;
                });
            })
            .catch((err) => {
              console.log(err);
              throw err;
            });
        } 
        catch (error) 
        {
          console.log(error);
          throw error;
        }
      }
    },

    // All APIs related to messages in chatting

    // Send a message to the user you are chatting to
    sendMessage: {
      type: new GraphQLNonNull(MessageType),
      args: {
        username: {type: new GraphQLNonNull(GraphQLString)},
        toUsername: {type: new GraphQLNonNull(GraphQLString)},
        content: {type: new GraphQLNonNull(GraphQLString)}
      },
      async resolve(parent, args, {authUser})
      {
        try {
          if(!authUser)
          {
            throw new Error("Unauthenticated user");
          }

          const senderUser = await Users.findOne({username: args.username});
          const receiverUser = await Users.findOne({username: args.toUsername});

          if(!receiverUser)
          {
            throw new Error("Username " + args.toUsername + " does not exist");
          }
          else if(!senderUser)
          {
            throw new Error("Username " + args.username + " does not exist");
          }
          else if(receiverUser.username === senderUser.username)
          {
            throw new Error("You cannot message to yourself");
          }

          if(args.content.trim() === '')
          {
            throw new Error("Message is empty. You cannot send an empty message.");
          }

          const message = new Messages({
            content: args.content,
            fromUsername: args.username,
            toUsername: args.toUsername
          });

          const save = await message.save();
          console.log(save);
          pubsub.publish('NEW_MESSAGE_ARRIVED', { newMessage: save });
          return save;
        } 
        catch (error) {
          console.log(error);
          throw error;
        }
      }
    }
  }
});

const Subscription = new GraphQLObjectType({
  name: 'Subscription',
  fields: {
    // Subscription APIs for text chat

    // Receive new message from users you are chatting to
    newMessage: {
      type: new GraphQLNonNull(MessageType),
      args: {username: {type: new GraphQLNonNull(GraphQLString)}},
      subscribe: withFilter((parent, args, context) => {
        //console.log(context.authUser);
        try 
        {
          // if(!authUser)
          // {
          //   throw new Error("Unauthenticated user");
          // }
          return pubsub.asyncIterator('NEW_MESSAGE_ARRIVED');
        } 
        catch (error) 
        {
          console.log(error);
          throw error;
        }
      }, ({newMessage}, args, context) => {
        if(newMessage.fromUsername == args.username || newMessage.toUsername == args.username)
        {
          return true;
        }
        return false;
      }) 
    }
  }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
    subscription: Subscription
});
