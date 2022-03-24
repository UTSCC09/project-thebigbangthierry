const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    uuid: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    fromUsername: {
        type: String,
        required: true,
        trim: true
    },
    toUsername: {
        type: String,
        required: true,
        trim: true
    },
    
}, {timestamps: true});

module.exports = Messages = mongoose.model('messages', MessageSchema);