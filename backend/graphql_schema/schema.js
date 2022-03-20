// package imports
const graphql = require('graphql');
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

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    _id: { type: GraphQLID },
    username: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: GraphQLString },
    fullName: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    about: {type: GraphQLString},
    profilePicture: {type: GraphQLString}
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
      args: { username: { type: new GraphQLNonNull(GraphQLString) } },
      async resolve(parent, args)
      {
        try 
        {
          const users = await User.findOne({username: args.username});

        } 
        catch(err) 
        {
          console.log(err);
          throw new err;
        }
        
      }
    }
  }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
