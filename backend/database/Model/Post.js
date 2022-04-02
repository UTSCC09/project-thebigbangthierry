const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    poster: {
        type: Schema.Types.ObjectId,
        ref: 'Profile'
    },
    posterUsername: {
        type: String
    },
    textContent: {
        type: String
    },
    image: {
        type: String
    },
    likes: [{
        liker: {type: Schema.Types.ObjectId, ref: 'Profile'},
    }],
    dislikes: [{
        disliker: {type: Schema.Types.ObjectId, ref: 'Profile'}
    }],
    comments: [{
        commentContent: {type: String, required: true},
        commentDate: {type: Date, default: Date.now},
        commenter: {type: String}
    }]
}, {timestamps: true});

module.exports = Post = mongoose.model('posts', PostSchema);