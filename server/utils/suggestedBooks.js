const BookStore = require("../models/BookStore");
module.exports = async() =>{
    const books = await BookStore.find().select('author title');
    let suggest=[]
    for(each of books){
        suggest=[...suggest, each.author,each.title]
    }
    return suggest
}