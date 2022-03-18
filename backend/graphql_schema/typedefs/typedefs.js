const {buildSchema} = require('graphql');

const typeDefs = buildSchema(`
    type Profile {
        _id: ID!
        username: String!
        password: String!
        fullName: String!
        email: String!
        about: String
        profilePicture: String
    }

    input ProfileInput {
        username: String!
        password: String!
    }

    type Query {
        users: [Profile]
    }

    schema {
        query: Query
    }
`);

module.exports = typeDefs;