/*** SOURCES THAT NEED TO BE CREDITED ***/
/*** 
 * Idea for structure of graphql apis from https://atheros.ai/blog/graphql-list-how-to-use-arrays-in-graphql-schema
***/

// package imports
const graphql = require('graphql');
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
        console.log(req);
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
              .then(() => {
                const users = User.findOne({username: args.username});
                return users;
              })
              .catch(err => {
                console.log(err);
                throw new err;
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
          throw new err;
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
                          throw new err;
                        });
                      })
                    .catch((err) => {
                      console.log(err);
                      throw new err;
                    });
                })
                .catch((err) => {
                  console.log(err);
                  throw new err;
                });
            })
            .catch((err) => {
              console.log(err);
              throw new err;
            });
        } 
        catch (error) 
        {
          console.log(error);
          throw new error;
        }
      }
    }
  }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
