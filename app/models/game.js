const mongoose = require('mongoose');

const gameSchema = mongoose.Schema({
    playerWhite: String,
    playerBlack: String,
    moves: [
        [String]
    ]

}, {
    timestamps: true
});

module.exports = mongoose.model('Game', gameSchema);