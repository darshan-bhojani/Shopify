const mongoose = require('mongoose');

var itemSchema = new mongoose.Schema({
    code: {
        type: String
    },
    name: {
        type: String
    },
    category: {
        type: String
    },
    photo: {
        data: Buffer,
        contentType: String
    },
    price: {
        type: Number
    },
    total_available: {
        type: Number
    },
    remaining: {
        type: Number
    },
    added_on: {
        type: Date
    },
    is_deleted: {
        type: Boolean,
        default: false
    },
    delete_comment: {
        type: String
    }
}, { collection: 'item' });


mongoose.model('item', itemSchema);