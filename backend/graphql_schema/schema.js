/*** SOURCES THAT NEED TO BE CREDITED ***/
/*** 
 * Idea for structure of graphql apis from https://atheros.ai/blog/graphql-list-how-to-use-arrays-in-graphql-schema
***/

// package imports
const graphql = require('graphql');
const bcrypt = require('bcrypt');
const Users = require('../database/Model/Users');
const {
  GraphQLObjectType,
  GraphQLList,
  GraphQLSchema,
  GraphQLNonNull,
  GraphQLString,
  GraphQLID,
  GraphQLInt
} = graphql;

const User = require('../database/Model/Users');

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

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: new GraphQLNonNull(UserType),
      args: { username: { type: new GraphQLNonNull(GraphQLString) } },
      async resolve(parent, args, req) {
        if(!req.isAuth)
        {
          throw new Error("Unauthenticated user");
        }
        try 
        {
          const users = await User.findOne({username: args.username});

          console.log(users);
          return users;
        } 
        catch (err) 
        {
          console.log(err);
          throw new err;
        }
      }
    }
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
      async resolve(parent, args, req)
      {
        if(!req.isAuth)
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
              .then((data) => {
                //console.log(data);
                const users = User.findOne({username: args.username});
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
      async resolve(parent, args, req) 
      {
        if(!req.isAuth)
        {
          throw new Error("Unauthenticated user");
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
      async resolve (parent, args, req) {
        if(!req.isAuth)
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
    addToFollowerList: {
      type: UserType,
      args: {
        username1: { type: new GraphQLNonNull(GraphQLString) },
        username2: { type: new GraphQLNonNull(GraphQLString) },
        profilePicture: { type: GraphQLString }
      },
      // Username1 gets followed by Username2. Profile picture of username2
      async resolve(parent, args, req) {
        if(!req.isAuth)
        {
          throw new Error("Unauthenticated user");
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
    }
  }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
