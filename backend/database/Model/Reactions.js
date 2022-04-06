const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReactionSchema = new Schema({
    reactEmoji: {
        type: String
    },
    messageId: {
        type: Schema.Types.ObjectId,
        ref: 'Messages'
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Profile'
    }
});

module.exports = Reactions = mongoose.model('reactions', ReactionSchema);