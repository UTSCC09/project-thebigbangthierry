const Users = require('../../database/Model/Users');

module.exports = {
    Query: {
        users: async () => {
            return await Users.find({})
                .then(user => {
                    console.log(user);
                    return [user];
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                })
        }
    }
};