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
      async resolve(parent, args) {
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
      async resolve(parent, args)
      {
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
            return {error: args.fullName + " not defined or null or empty. Please send a legitimate string."}
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
      async resolve(parent, args) {
        try 
        {
          let user1 = args.username1;
          let user2 = args.username2;
          let pic = args.profilePicture;

          Users.findOne({username: user1})
            .exec()
            .then((user) => {
              if (!user) return {error: user + " not in database "}
              Users.findOne({username: user2})
                .exec()
                .then((user2exist) => {
                  if (!user2exist) return {error: user2exist + " not in database "}
                  let followerList = user.followerList;
                  for(let i = 0; i < followerList.length; i++)
                  {
                    if (followerList[i].username == user2)
                    {
                      return {message: user2 + " already following the user " + user1};
                    }
                    followerList.push({"username": user2, "profilePicture": pic});
                    console.log(followerList);
                    Users.updateOne({username: user1}, {followerList: followerList})
                      .exec()
                      .then(() => {
                        return {message: user2 + " added to the follower list of " + user1 + " successfully"}
                      })
                      .catch((err) => {
                        console.log(err);
                        throw new err;
                      });
                  }
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
          
        }
      }
    }
  }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
