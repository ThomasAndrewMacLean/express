const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
    user: String,
    message: Number,

}, {
    timestamps: true
});



module.exports = mongoose.model('Message', messageSchema);