const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

const UserProfileSchema = new Schema({
    username: {
        type: String,
        unique: true,
        trim: true,
        required: true
    },
    password: {
        type: String,
        minlength: 8,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        // Need to add match regex for utoronto mail
        required: true
    },
    about: {
        type: String
    },
    profilePicture: {
        type: String,
        default: ""
    },
    friendsList: [{
        username: {
            type: String
        },
        profilePicture: {
            type: String
        }
    }]
});

UserProfileSchema.plugin(uniqueValidator);

module.exports = Profile = mongoose.model('profiles', UserProfileSchema);