
// package imports
const graphql = require('graphql');
const bcrypt = require('bcrypt');
const Users = require('../database/Model/Users');
const Post = require('../database/Model/Post');
const cloudinary = require('../config/cloudinary');
const Messages = require('../database/Model/Messages');
const Reactions = require('../database/Model/Reactions');
const {PubSub, withFilter} = require('graphql-subscriptions');
const {RedisPubSub} = require('graphql-redis-subscriptions');
const pubsub = new PubSub();
const redisPubsub = new RedisPubSub();
console.log(process.env.NODE_ENV);
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
} = graphql;

const reactionEmojis = ["❤️", "😂", "🥺", "😡", "👍", "👎", "😮"];

// Twilio Helper Code Starts
const twilioServer = require('twilio')(
  process.env.TWILIO_API_KEY_SID,
  process.env.TWILIO_API_KEY_SECRET,
  {accountSid: process.env.TWILIO_ACCOUNT_SID}
);

const createFindVideoRoom = async(videoRoomName) => {
  try 
  {
    // see if the room exists already. If it doesn't, this will throw
    // error 20404.
    await twilioServer.video.rooms(videoRoomName).fetch();
  } 
  catch (error) 
  {
    if(error.code === 20404)
    {
      // the room was not found, so create it
      await twilioServer.video.rooms.create({
        uniqueName: videoRoomName,
        type: "go"
      });
    }
    else
    {
      console.log(error);
      throw error;
    }
  }
};

const generateAccessToken = async (videoRoomName, username) => {
  // create an access token
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_API_KEY_SID,
    process.env.TWILIO_API_KEY_SECRET,
    // generate a random unique identity for this participant
    { identity: username }
  );

  // create a video grant for this specific room
  const videoGrant = new VideoGrant({
    room: videoRoomName,
  });

  // add the video grant
  token.addGrant(videoGrant);
  // serialize the token and return it
  return token.toJwt();
};
// Twilio Helper Code Ends

const VideoCallType = new GraphQLObjectType({
  name: 'VideoCall',
  fields: () => ({
    token: { type: new GraphQLNonNull(GraphQLString) }
  })
});

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

const DateInputType = new GraphQLScalarType({
  name: 'Date',
  parseValue(value)
  {
    return new Date(value);
  },
  serialize(value)
  {
    return value.toISOString();
  }
});

const CommentsInputType = new GraphQLObjectType({
  name: 'Comment',
  fields: () => ({
    _id: { type: GraphQLID },
    commentContent: { type: GraphQLString },
    commentDate: { type: DateInputType },
    commenter: { type: new GraphQLNonNull(GraphQLString) },
    commenterProfilePic: { type: GraphQLString }
  })
});

const LikesInputType = new GraphQLObjectType({
  name: 'Likes',
  fields: () => ({
    liker: { type: new GraphQLNonNull(GraphQLString) }
  })
});

const DislikesInputType = new GraphQLObjectType({
  name: 'Dislikes',
  fields: () => ({
    disliker: { type: new GraphQLNonNull(GraphQLString) }
  })
});

const LikeDislikeInputType = new GraphQLObjectType({
  name: 'LikeDislikeInput',
  fields: () => ({
    likeCount: {type: GraphQLInt},
    dislikeCount: {type: GraphQLInt}
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

const PostType = new GraphQLObjectType({
  name: 'Posts',
  fields: () => ({
    _id: { type: GraphQLID },
    poster: { type: new GraphQLNonNull(GraphQLID) },
    posterUsername: {type: new GraphQLNonNull(GraphQLString)},
    posterProfilePic: {type: GraphQLString},
    textContent: { type: GraphQLString },
    image: { type: GraphQLString },
    likes: { type: new GraphQLList(LikesInputType) },
    dislikes: { type: new GraphQLList(DislikesInputType) },
    comments: { type: new GraphQLList(CommentsInputType) },
    createdAt: { type: GraphQLString }
  })
});

const ReactionInputType = new GraphQLObjectType({
  name: 'ReactionInput',
  fields: () => ({
    _id: {type: new GraphQLNonNull(GraphQLID)},
    reactEmoji: {type: new GraphQLNonNull(GraphQLString)}
  })
});

const MessageType = new GraphQLObjectType({
  name: 'Message',
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    fromUsername: { type: new GraphQLNonNull(GraphQLString) },
    toUsername: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    reaction: {type: new GraphQLList(ReactionInputType)}
  })
});

const ReactionType = new GraphQLObjectType({
  name: 'Reaction',
  fields: () => ({
    _id: { type: new GraphQLNonNull(GraphQLID) },
    reactEmoji: {type: new GraphQLNonNull(GraphQLString)},
    messageId: {type: new GraphQLNonNull(MessageType)},
    userId: {type: new GraphQLNonNull(UserType)}
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
        try 
        {
          if(authUser.username !== args.username)
          {
            return new Error("Unauthenticated user");
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
          if(authUser.username !== args.fromUsername)
          {
            return new Error("Unauthenticated user");
          }
          const user1 = await Users.findOne({username: args.fromUsername});
          if (!user1) return new Error("Username " + args.fromUsername + " does not exist");
          const user2 = await Users.findOne({username: args.toUsername});
          if (!user2) return new Error("Username " + args.toUsername + " does not exist");

          const messages = await Messages.find({ 
            $or: [ 
              { $and: [{fromUsername: user1.username}, {toUsername: user2.username}] }, 
              { $and: [{fromUsername: user2.username}, {toUsername: user1.username}] } 
            ] }).sort({createdAt: -1});
          let modifiedMessage = [];
          for(let i = 0; i < messages.length; i++)
          {
            let reactArr = [];
            let reactionId = messages[i].reaction[0];
            let reactionData = await Reactions.findOne({_id: reactionId});
            if(reactionData) 
            {
              reactArr.push({_id: reactionId, reactEmoji: reactionData.reactEmoji})
              messages[i].reaction = reactArr;
            }
            modifiedMessage.push({_id: messages[i]._id, content: messages[i].content, fromUsername: messages[i].fromUsername, 
              toUsername: messages[i].toUsername, createdAt: messages[i].createdAt, reaction: reactArr});
          }
          
          console.log(modifiedMessage);
          return modifiedMessage;
        } 
        catch (error) {
          console.log(error)
          throw error;
        }
      }
    },

    // Get the posts posted by the user
    getMyPosts: {
      type: new GraphQLList(new GraphQLNonNull(PostType)),
      args: { 
        username: {type: new GraphQLNonNull(GraphQLString)}, 
        pageIndex: {type:  new GraphQLNonNull(GraphQLInt)}
      },
      async resolve(parent, args, {authUser})
      {
        try 
        {
          if(authUser.username !== args.username)
          {
            return new Error("Unauthenticated user");
          }
          if(args.pageIndex <= 0)
          {
            return new Error("Invalid Page Index")
          }
          let skipPages = (args.pageIndex * 10) - 10;
          return Users.findOne({username: args.username})
            .then((user) => {
              if (!user) return new Error("Username " + args.username + " does not exist");

              return Post.find({posterUsername: args.username})
                .skip(skipPages)
                .limit(10)
                .sort({createdAt: -1})
                .then((posts) => {
                  if(!posts) return new Error("No posts found for the user " + args.username);
                  if(posts.length == 0) return new Error("No posts found for the user " + args.username);

                  return posts;
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
        catch (error) 
        {
          console.log(error);
          throw error;
        }
      }
    },

    // The posts of the users in the following list for current users
    getFollowingPosts: {
      type: new GraphQLList(new GraphQLNonNull(PostType)),
      args: { 
        username: {type: new GraphQLNonNull(GraphQLString)},
         pageIndex: {type:  new GraphQLNonNull(GraphQLInt)}
        },
      async resolve(parent, args, {authUser})
      {
        try 
        {
          if(authUser.username !== args.username)
          {
            return new Error("Unauthenticated user");
          }

          if(args.pageIndex <= 0)
          {
            return new Error("Invalid Page Index")
          }
          let skipPages = (args.pageIndex * 20) - 20;

          return Users.findOne({username: args.username})
            .then((user) => {
              if (!user) return new Error("Username " + args.username + " does not exist");
              let followingList = user.followingList;
              let followingUsers = [];
              for(let i = 0; i < followingList.length; i++)
              {
                followingUsers.push((followingList[i].username));
              }
              
              return Post.find({posterUsername: followingUsers})
                .skip(skipPages)
                .limit(20)
                .sort({createdAt: -1})
                .then((posts) => {
                  if(!posts) return new Error("No posts found in the following list for the user " + args.username);
                  if(posts.length == 0) return new Error("No more posts found in the following list for the user " + args.username);

                  return posts;
                })
                .catch(err => {
                  console.log(err);
                  throw err;
                })
            })
            .catch(err => {
              console.log(err);
              throw err;
            })
        } 
        catch (error) 
        {
          console.log(error);
          throw error;
        }
      }
    },

    // Search the user to add to following list
    searchListUsers: {
      type: new GraphQLNonNull(new GraphQLList(UserType)),
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        searchContent: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parent, args, {authUser})
      {
        if(authUser.username !== args.username)
        {
          return new Error("Unauthenticated user");
        }

        try 
        {
          if(args.searchContent.length < 3)
          {
            return new Error("Type atleast 3 characters for correct searches.")
          }

          return Users.find({username: {$regex: args.searchContent, $options: 'i'}})
            .limit(10)
            .then((data) => {
              return data;
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

    // Get comments for the given post id
    //page index starts from 0
    getComments: {
      type: new GraphQLList(CommentsInputType),
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        postId: { type: new GraphQLNonNull(GraphQLID) },
        pageIndex: { type:  new GraphQLNonNull(GraphQLInt) }
      },
      async resolve(parent, args, {authUser})
      {
        if(authUser.username !== args.username)
        {
          throw new Error("Unauthenticated user");
        }
        if(args.pageIndex <= 0)
        {
          return new Error("Invalid Page Index")
        }
        try 
        {
          return Users.findOne({username: args.username})
            .then((user) => {
              if(!user) return new Error("User does not exist");

              return Post.findOne({_id: args.postId})
                .then((post) => {
                  if (!post) return new Error("Post doesn't exist");

                  let comments = post.comments.sort(function(a, b){
                    return DateInputType.parseValue(b.commentDate) - DateInputType.parseValue(a.commentDate);
                  });
                  let startComment = (args.pageIndex * 5 - 5)
                  return comments.slice(startComment, startComment + 5);
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
        catch (error) {
          console.log(error);
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
        if(authUser.username !== args.username)
        {
          return new Error("Unauthenticated user");
        }
        try 
        {
          if(args.fullName != null && args.fullName != undefined && args.fullName != "")
          {
            // update full name of the given username
            return Users.updateOne({username: args.username}, {fullName: args.fullName})
              .exec()
              .then((data) => {
                //console.log(data);
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
        if(authUser.username !== args.username)
        {
          return new Error("Unauthenticated user");
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
        if(authUser.username !== args.username)
        {
          return new Error("Unauthenticated user");
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
                        return Users.updateOne({username: args.username}, {password: hashPass})
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
        if(authUser.username !== args.username2)
        {
          return new Error("Unauthenticated user");
        }
        if(args.username1 === args.username2)
        {
          return new Error("You cannot follow yourself");
        }
        try 
        {
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
          if(authUser.username !== args.username)
          {
            return new Error("Unauthenticated user");
          }

          const senderUser = await Users.findOne({username: args.username});
          const receiverUser = await Users.findOne({username: args.toUsername});

          if(!receiverUser)
          {
            return new Error("Username " + args.toUsername + " does not exist");
          }
          else if(!senderUser)
          {
            return new Error("Username " + args.username + " does not exist");
          }
          else if(receiverUser.username === senderUser.username)
          {
            return new Error("You cannot message to yourself");
          }

          if(args.content.trim() === '')
          {
            return new Error("Message is empty. You cannot send an empty message.");
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
    },

    // React to a message
    reactMessage: {
      type: new GraphQLNonNull(ReactionType),
      args: {
        messageId: {type: new GraphQLNonNull(GraphQLID) },
        reactEmoji: {type: new GraphQLNonNull(GraphQLString)}
      },
      async resolve(parent, args, {authUser})
      {
        try 
        {
          // Check whether user inputted valid reaction emoji
          if(!reactionEmojis.includes(args.reactEmoji))
          {
            return new Error('Invalid emoji input');
          }

          // Check whether the user reacting exist in DB or not
          let username = authUser.username ? authUser.username : '';
          let user = await Users.findOne({username: username});
          if(!user) return new Error("User " + username + " does not exist");

          // Check whether the message getting reacted exist in DB or not
          let message = await Messages.findOne({_id: args.messageId});
          if(!message)  return new Error("Message does not exist");

          // Check whether the user is authorized to react to the given message
          if (message.fromUsername !== username && message.toUsername !== username) 
          {
            return new Error("User " + username + " is not authorized to react to this message");
          }

          let reaction = await Reactions.findOne({$and: [{messageId: args.messageId}, {userId: user._id}]});
          if(reaction)
          {
            reaction = await Reactions.findOneAndUpdate({_id: reaction._id}, {reactEmoji: args.reactEmoji});
          }
          else
          {
            const storeReaction = new Reactions({
              reactEmoji: args.reactEmoji,
              messageId: args.messageId,
              userId: user._id
            });
            console.log(storeReaction);
            reaction = await storeReaction.save();
          }
          await Messages.updateOne({_id: args.messageId}, {reaction: reaction._id});

          let emojiReact = {reactEmoji: args.reactEmoji, userId: user, messageId: message};
          pubsub.publish('NEW_REACTION_ARRIVED', { newReactions: emojiReact });
          return emojiReact;
        } 
        catch (error) 
        {
          console.log(error);
          throw error;
        }
      }
    },
    // All APIs related to posts are below
    
    // Add user who likes the post
    updatePostLikesDislikes: {
      type: LikeDislikeInputType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        postId: { type: new GraphQLNonNull(GraphQLID) },
        action: {type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parent, args, {authUser})
      {
        if(authUser.username !== args.username)
        {
          return new Error("Unauthenticated user");
        }

        try 
        {
          return Users.findOne({username: args.username})
            .then((user) => {
              if(!user) return new Error("User does not exist");

              return Post.findById({_id: args.postId})
                .exec()
                .then((post) => {
                  if(!post) return new Error("Post doesn't exist");

                  if(args.action === "like")
                  {
                    if(post.likes.map(a=>a.liker).includes(args.username))
                    {
                      return new Error("User " + args.username + " has already liked this post");
                    }
                    post.likes.push({liker: args.username});
                    post.save();
                    return {likeCount: post.likes.length, dislikeCount: post.dislikes.length};
                  }
                  else if(args.action === "dislike")
                  {
                    if(post.dislikes.map(a=>a.disliker).includes(args.username))
                    {
                      return new Error("User " + args.username + " has already disliked this post");
                    }
                    post.dislikes.push({disliker: args.username});
                    post.save();
                    return {likeCount: post.likes.length, dislikeCount: post.dislikes.length};
                  }
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
    // Delete the post
    deletePost: {
      type: GraphQLString,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        postId: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve(parent, args, {authUser})
      {
        if(authUser.username !== args.username)
        {
          return new Error("Unauthenticated user");
        }

        try 
        {
          return Users.findOne({username: args.username})
            .then((user) => {
              if(!user) return new Error("User does not exist");

              return Post.findById({_id: args.postId})
                .then((post) => {
                  if (!post) return new Error("Post doesn't exist");

                  if(post.posterUsername !== args.username)
                  {
                    return new Error("You are unauthorized to delete this post");
                  }
                  let imageUrl = post.image;
                  let publicId;
                  if(imageUrl !== "")
                  {
                    let splitImage = imageUrl.split('/');
                    let imageFile = splitImage[splitImage.length - 1];
                    publicId = imageFile.slice(0, imageFile.indexOf('.'));
                  }
                  
                  
                  return Post.deleteOne({_id: args.postId})
                    .then(async () => {
                      try 
                      {
                        if(publicId !== null && publicId !== undefined && imageUrl !== "")
                        {
                          await cloudinary.uploader.destroy(publicId, function(result) {console.log(result)});
                        }
                        return "Post deleted successfully";
                      } 
                      catch (error) 
                      {
                        console.log(error);
                        throw error;
                      }
                      
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
    // All APIs related to comments are below

    // Add comments to a particular post
    addComments: {
      type: CommentsInputType,
      args: {
        username: { type: new GraphQLNonNull(GraphQLString) },
        postId: { type: new GraphQLNonNull(GraphQLID) },
        commentContent: { type: new GraphQLNonNull(GraphQLString) }
      },
      async resolve(parent, args, {authUser})
      {
        if(authUser.username !== args.username)
        {
          return new Error("Unauthenticated user");
        }

        if(args.commentContent === "")
        {
          return new Error("Comment cannot be empty");
        }

        try 
        {
          return Users.findOne({username: args.username})
          .then((user) => {
            if(!user) return new Error("User does not exist");

            return Post.findById({_id: args.postId})
              .then((post) => {
                if (!post) return new Error("Post doesn't exist");

                let newComment = {commenter: args.username, commentContent: args.commentContent, commenterProfilePic: user.profilePicture};
                post.comments.push(newComment);
                post.save();
                let date = post.comments[post.comments.length - 1].commentDate;
                let returnComment = {commenter: args.username, commentContent: args.commentContent, 
                  commentDate: date, commenterProfilePic: user.profilePicture};
                return returnComment;
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
    // Video call api for joining room
    joinVideoCallRoom: {
      type: new GraphQLNonNull(VideoCallType),
      args: {
        username: {type: new GraphQLNonNull(GraphQLString)},
        videoRoomName: {type: new GraphQLNonNull(GraphQLString)}
      },
      async resolve(parent, args, {authUser})
      {
        try {
          // check user
          if(authUser.username !== args.username)
          {
            return new Error('Unauthenticated user');
          }

          // find or create a room with the given roomName
          createFindVideoRoom(args.videoRoomName);

          // generate an Access Token for a participant in this room
          const token = generateAccessToken(args.videoRoomName, args.username);
          let returnToken = {token: token};
          return returnToken;
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
      subscribe: withFilter(
        () => pubsub.asyncIterator('NEW_MESSAGE_ARRIVED'), 
        ({newMessage}, args) => (newMessage.fromUsername == args.username || newMessage.toUsername == args.username)
    )},

    // Reactions on messages
    newReactions: {
      type: new GraphQLNonNull(ReactionType),
      args: {username: {type: new GraphQLNonNull(GraphQLString)}},
      subscribe: withFilter(
        () => pubsub.asyncIterator('NEW_REACTION_ARRIVED'), 
        ({newReactions}, args) => (newReactions.messageId.fromUsername == args.username || newReactions.messageId.toUsername == args.username)
      )}
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
    subscription: Subscription
});
