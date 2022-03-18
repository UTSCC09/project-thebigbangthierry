const Users = require('../../database/model/Users');

const resolvers = {
    Query: {
        users: async () => {
            const users = await Users.find();
            return users;
        }
    }
};

module.exports = resolvers;