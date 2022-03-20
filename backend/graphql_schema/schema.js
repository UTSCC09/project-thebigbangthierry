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
    username: {type: GraphQLString},
    password: { type: GraphQLString },
    fullName: { type: GraphQLString },
    email: { type: GraphQLString },
    about: {type: GraphQLString},
    profilePicture: {type: GraphQLString}
  })
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: new GraphQLList(new GraphQLNonNull(UserType)),
      args: {},
      async resolve(parent, args) {
        try {
              const users = await User.find({});
              console.log(users);
              return users;
          } catch (err) {
              console.log(err);
              throw new err;
          }
      }
    }
  }
});

module.exports = new GraphQLSchema({
    query: RootQuery
});
