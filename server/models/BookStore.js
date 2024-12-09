const mongoose = require('mongoose');
const { applyCacheToQueries } = require('../config/cache');

const BookStoreSchema = new mongoose.Schema({
    title:{
       type: String,
       required: [true, "Please enter the book title"]
    },
    author:{
        type: String,
        required: [true, "Please enter the book author"]
    },
    category:{
        type: String,
        required: [true, "enter a book catalogue eg. business"],
        enum: ['business','art-design','engineering','science','health','fantasy','history','music','programming','food-cooking','sport','technology']
    },
    uploadedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverImg:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        required: true
    }
},{timestamps: true})
BookStoreSchema.index({title: 'text',author: 'text','uploadedBy.name': 'text'});
// Apply cache middleware to the schema
applyCacheToQueries(BookStoreSchema);
const BookStore = mongoose.model("BookStore", BookStoreSchema);
module.exports = BookStore;