const express=require('express')
const {protectRoutes, protectAdmins, protectVerified} = require('../authentication/protect')
const {returnBook, borrowBook, readBook, editBook, setOfBooks, getBooks, completeBook, addNewBook} = require('../controller/bookController')
const multer = require("multer")
const { generateFilename } = require('../utils/filenameGenerator');
const storage = multer.diskStorage({
  destination: (_, file, cb) =>{
    if(file.mimetype.startsWith('image/')){
      cb(null, 'uploads/book-images')
    }else {
      cb (new Error('Unsupported file type'), null)
    }
  },
  filename: generateFilename // Use the function for unique filenames
})
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 } //2mb limitation
  }).single('coverImg');
const Router=express.Router();
// Error handling middleware for Multer
Router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
  } else if (err) {
      return res.status(400).json({ error: err.message });
  }
  next();
});
Router.route("/sets").get(protectRoutes,setOfBooks); // get student books @/api/book/sets ?status ?type ?studentId
Router.route("/").get(protectRoutes, getBooks); // get all book @/api/book/
Router.route("/").post(protectRoutes, protectAdmins,upload, addNewBook); // add new book @/api/book
Router.route("/:bookId").patch(protectRoutes, protectAdmins,upload, editBook); // edit book @/api/book/:bookId
Router.route("/read/:bookId").patch(protectRoutes, protectVerified,readBook); // read book @/api/book/read/:bookId
Router.route("/borrow/:bookId").patch(protectRoutes, protectVerified,borrowBook); // borrow book @/api/book/borrow/:bookId
Router.route("/complete/:bookId").patch(protectRoutes, protectVerified,completeBook); // complete book @/api/book/complete/:bookId
Router.route("/return/:bookId").patch(protectRoutes, protectAdmins, returnBook); // return book @/api/book/return/:bookId?userId=sdjhebrebjh
module.exports = Router;