const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
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
    reaction: [{
        type: Schema.Types.ObjectId,
        ref: 'Reactions'
    }]
    
}, {timestamps: true});

module.exports = Messages = mongoose.model('messages', MessageSchema);