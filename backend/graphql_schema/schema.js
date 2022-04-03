/*** SOURCES THAT NEED TO BE CREDITED ***/
/*** 
 * Idea for structure of graphql apis from https://atheros.ai/blog/graphql-list-how-to-use-arrays-in-graphql-schema
***/

// package imports
const graphql = require('graphql');
const bcrypt = require('bcrypt');
const Users = require('../database/Model/Users');
const Post = require('../database/Model/Post');
const cloudinary = require('../config/cloudinary');
const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLString,
  GraphQLID,
  GraphQLInt
} = graphql;

const UserInputType = new GraphQLObjectType({
  name: 'Users',
  fields: () => ({
    username: { type: new GraphQLNonNull(GraphQLString) },
    profilePicture: {type: GraphQLString}
  })
});

const AboutInputType = new GraphQLObjectType({
  name: 'About',
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
    commentContent: { type: GraphQLString },
    commentDate: { type: DateInputType },
    commenter: { type: new GraphQLNonNull(GraphQLString) }
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
    content: { type: GraphQLString },
    image: { type: GraphQLString },
    likes: { type: new GraphQLList(GraphQLString) },
    dislikes: { type: new GraphQLList(GraphQLString) },
    comments: { type: new GraphQLList(CommentsInputType) },
    createdAt: { type: GraphQLString }
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
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
          throw new err;
        }
      }
    },

    // Get the posts posted by the user
    getMyPosts: {
      type: new GraphQLList(new GraphQLNonNull(PostType)),
      args: { username: {type: new GraphQLNonNull(GraphQLString)}, pageIndex: {type: GraphQLInt}},
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
          return Post.find({posterUsername: args.username})
            .skip(skipPages)
            .limit(10)
            .sort({createdAt: -1})
            .then((posts) => {
              if(!posts) return new Error("No posts found for the user " + args.username);
              if(posts.length == 0) return new Error("No posts found for the user " + args.username);

              console.log(posts);
              return posts;
            })
            .catch(err => {
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
      args: { username: {type: new GraphQLNonNull(GraphQLString)}, pageIndex: {type: GraphQLInt}},
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

                  console.log(posts);
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
            .exec()
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

    // // Get comments for the given post id
    // getComments: {
    //   type: new GraphQLList(CommentsInputType),
    //   args: {
    //     username: { type: new GraphQLNonNull(GraphQLString) },
    //     postId: { type: new GraphQLNonNull(GraphQLID) }
    //   },
    //   async resolve(parent, args, {authUser})
    //   {
    //     if(!authUser)
    //     {
    //       throw new Error("Unauthenticated user");
    //     }
    //     try 
    //     {
    //       return Post.findOne({_id: args.postId})
    //     } 
    //     catch (error) {
    //       console.log(error);
    //       throw error;
    //     }
    //   }
    // }
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
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
              })
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
            // update full name of the given username
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
    addToFollowerList: {
      type: UserType,
      args: {
        username1: { type: new GraphQLNonNull(GraphQLString) },
        username2: { type: new GraphQLNonNull(GraphQLString) },
        profilePicture: { type: GraphQLString }
      },
      // Username1 gets followed by Username2. Profile picture of username2
      async resolve(parent, args, {authUser}) {
        if(authUser.username !== args.username1)
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
                  followingList.push({"username": user1, "profilePicture": user1.profilePicture})
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
            })
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
        } 
        catch (error) 
        {
          console.log(error);
          throw error;
        }
      }
    }
  }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
