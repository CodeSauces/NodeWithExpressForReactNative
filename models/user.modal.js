const mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
    name:{
        type:String 
    }
})

mongoose.model('user', userSchema)