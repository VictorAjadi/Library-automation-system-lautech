const mongoose = require('mongoose');
const { applyCacheToQueries } = require('../config/cache');

const StudentBookSchema = new mongoose.Schema({
    type:{
       type: String,
       required: true,
       enum: ['READ','BORROW']
    },
    book:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookStore',
        required: true
    },
    status:{
        type: String,
        required: true,
        enum: ['COMPLETED','READING','RETURNED']
    },
    barcode:{
        type: String
    },
    student:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{timestamps: true})
StudentBookSchema.index({'book.title': 'text','book.author': 'text'});
// Apply cache middleware to the schema
applyCacheToQueries(StudentBookSchema);
const StudentBooks = mongoose.model("StudentBook", StudentBookSchema);
module.exports = StudentBooks;