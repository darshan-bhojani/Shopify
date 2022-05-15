const mongoose = require('mongoose');
const e = require('express');

mongoose.connect(process.env.MONGODB_URI, (err) => {
    if (!err) { console.log('MongoDB connection succeeded.'); }
    else { console.log(err); }
});

require('./item');