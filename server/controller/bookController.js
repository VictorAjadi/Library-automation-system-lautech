const asyncErrorHandler = require("../utils/asyncErrorHandler");
const { empty } = require("../utils/notFoundInModel");
const BookStore = require('../models/BookStore');
const StudentBooks = require('../models/StudentBooks');
const {isCheckedInToday} = require('../utils/daychecker');
const { generateQRCode } = require("../utils/barcodeGenerator");
const customError = require("../utils/customError");
const Media = require("../models/Media");
const { imgCleanUp } = require("../utils/imageCleaner");
const fs = require('fs').promises
const Features = require('../utils/apiFeatures');
const { removeUndefined } = require("../utils/undefinedRemoval");

exports.setOfBooks = asyncErrorHandler(async (req, res, next) => {
    // Define filters based on query parameters
    const filters = {};
    if (req.query.studentId) filters.student = req.query.studentId;
    if (req.query.status) filters.status = req.query.status.toUpperCase();
    else if (req.query.type) filters.type = req.query.type.toUpperCase();
    // Fetch filtered books
    const bookData = await setOfBooksWithFilter(req, filters);
    return res.status(200).json({
        status: "success",
        data:  bookData 
    });
});
const setOfBooksWithFilter = async (req, filterObj) => {
    ['studentId','type','status'].forEach(field => delete req.query[field]);
    const count = await StudentBooks.countDocuments(filterObj);
    let booksQuery = new Features(
        StudentBooks.find(filterObj)
            .setOptions({ skipMiddleware: true })
            .populate({
                path: 'book',
                options: { skipMiddleware: true },
                populate:{
                    path: 'author',
                    options: { skipMiddleware: true }
                },
                populate:{
                    path: 'coverImg'
                }
            })
            .populate({
                path: 'student',
                options: { skipMiddleware: true },
                populate:{
                    path: 'profileImg'
                }
            }),
        req.query,
        count
    );

    // Apply search if present in query
    if (req.query.search) {
        booksQuery = await booksQuery.search(req.query.search, ['book.author.name', 'book.title']);
    }

    // Apply filtering, sorting, field limiting, and pagination
    booksQuery = booksQuery.filter(['status', 'type']).sort().fields().paginate(10);

    const books = await booksQuery.queryObject;
    return {
        books,
        count
    };
};
exports.getBooks = asyncErrorHandler(async (req, res, next) => {
    // Fetch filtered books
    const bookData = await getBooksWithFilter(req);
    return res.status(200).json({
        status: "success",
        data:  bookData 
    });
});
const getBooksWithFilter = async (req) => {
    const count = await BookStore.countDocuments({});
    let booksQuery = new Features(
        BookStore.find({}).populate({
                    path: 'uploadedBy',
                    options: { skipMiddleware: true },
                    populate:{
                        path: 'profileImg',
                        options: { skipMiddleware: true }
                    }
                }).populate('coverImg'),
                req.query,
                count
        );
    // Apply search if present in query
    if (req.query.search) {
        booksQuery = await booksQuery.search(req.query.search, ['author', 'title', 'uploadedBy.name']);
    }
    // Apply filtering, sorting, field limiting, and pagination
    booksQuery = booksQuery.filter(['category', 'author', '_id']).sort().fields().paginate(10);
    const books = await booksQuery.queryObject;
    return {
        books,
        count
    };
};
exports.addNewBook = asyncErrorHandler(async (req, res, next) => {
    if (!req.file) return next(new customError('Please upload cover image for the book.', 400));
    const validImageFormats = ['image/jpeg', 'image/png', 'image/jpg'];
    if (req.file) {
        if (!validImageFormats.includes(req.file.mimetype)) {
            await imgCleanUp(req,'coverImg')
            return next(new customError('Invalid image format...', 400));
        }
        const formattedPath = req.file.path.replace(/\\/g, '/');
        // Create and save the new profile image
        const coverImgMedia = await new Media({
            filename: req.file.filename,
            path: formattedPath,
            url: `${req.protocol}://${req.get('host')}/${formattedPath}`,
            format: req.file.mimetype
        }).save();
        if(!coverImgMedia){
            await imgCleanUp(req,'coverImg',coverImgMedia._id)
            return next(new customError('An unknown error occured while saving cover image',500))
        };
        const newBook = await BookStore.create({
            ...req.body,
            coverImg: coverImgMedia._id,
            uploadedBy: req.user._id
        });
        if(!newBook){
            await imgCleanUp(req,'coverImg',coverImgMedia._id)
            return next(new customError('Error occurred while creating new library book',500))
        };
        return res.status(200).json({
            status: "success",
            message: "New book added to collection...",
        });
    }
});
exports.editBook = asyncErrorHandler(async (req, res, next) => {
    const {bookId} = req.params;
    const validImageFormats = ['image/jpeg', 'image/png', 'image/jpg'];
    let updateCoverImg='';
    //validate id
    const book = await BookStore.findById(bookId)
    if(!book){
        await imgCleanUp(req,'coverImg');
        return next(new customError('Invalid book ID',400));
    }
    if (req.file) {
        if (!validImageFormats.includes(req.file.mimetype)) {
            await imgCleanUp(req,'coverImg')
            return next(new customError('Invalid image format...', 400));
        }
        // Delete previous image if it exists
        const mediaImage = await Media.findById(book.coverImg);
        if (mediaImage) {
            try {
                await fs.unlink(mediaImage.path);
                await mediaImage.deleteOne();
            } catch (error) {
                return next(new customError('An error occurred while deleting previous cover image...', 500));
            }
        }
        const formattedPath = req.file.path.replace(/\\/g, '/');
        // Create and save the new profile image
        updateCoverImg = await new Media({
            filename: req.file.filename,
            path: formattedPath,
            url: `${req.protocol}://${req.get('host')}/${formattedPath}`,
            format: req.file.mimetype
        }).save();
        if(!updateCoverImg){
            await imgCleanUp(req,'coverImg',updateCoverImg._id)
            return next(new customError('An unknown error occured while saving cover image',500))
        };
    }
    const newBook = await book.updateOne({
        $set: { 
            ...removeUndefined(req.body), 
            ...(updateCoverImg && { coverImg: updateCoverImg?._id }) 
        }
    });
    if(!newBook){
        await imgCleanUp(req,'coverImg',updateCoverImg?._id)
        return next(new customError('An error occurred while editing this book',500))
    };
    return res.status(200).json({
        status: "success",
        message: "Changes have been to this book...",
    });
});
exports.readBook = asyncErrorHandler(async (req, res, next) => {
    empty(req.params.bookId, 'Book ID not found', 400, next);
    const partialModel = req.user;
    //check if user is checked in
    if (!isCheckedInToday(partialModel?.checkIn.at())) return next(new customError('User must be checked in to gain permission...', 400));
    // Check if book exists
    if (!(await BookStore.findById(req.params.bookId))) return next(new customError('Book does not exist: Invalid Book ID...', 404));
    // Check if the book has been borrowed
    const book = await StudentBooks.find({ book: req.params.bookId, modifiedBy: req.query.userId, type: 'borrow' });
    if (!book) return next(new customError('This Book already exist in your read book collection...', 401));
    let barcodeImage = await generateQRCode(req.user?._id);
    empty(barcodeImage,'An error occured; while generating book code',500)
    // Return the book
    const newBook = await StudentBooks.create({
        type: 'READ',
        book: req.params.bookId,
        status: 'READING',
        barcode: barcodeImage,
        student: req.user?._id
    })
    empty(newBook, "An unknown error occurred; while adding a read collection", 500, next);
    return res.status(200).json({
        status: "success",
        message: "Action was successful...",
    });
});
exports.borrowBook = asyncErrorHandler(async (req, res, next) => {
    empty(req.params.bookId, 'Book ID not found', 400, next);
    const partialModel = req.user;
    //check if user is checked in
    if (!isCheckedInToday(partialModel?.checkIn.at())) return next(new customError('User must be checked in to gain permission...', 400));
    // Check if book exists
    if (!(await BookStore.findById(req.params.bookId))) return next(new customError('Book does not exist: Invalid Book ID...', 404));
    // Check if the book has been borrowed
    const book = await StudentBooks.find({ book: req.params.bookId, modifiedBy: req.query.userId, type: 'borrow' });
    if (!book) return next(new customError('This Book already exist in your borrowed book collection...', 401));
    let barcodeImage = await generateQRCode(`${req.user?._id}:${req.params.bookId}`);
    empty(barcodeImage,'An error occured while generating book code',500)
    // Return the book
    const newBook = await StudentBooks.create({
        type: 'BORROW',
        book: req.params.bookId,
        status: 'READING',
        barcode: barcodeImage,
        student: req.user?._id
    })
    empty(newBook, "An unknown error occurred; while adding a borrow collection", 500, next);
    return res.status(200).json({
        status: "success",
        message: "Action was successful...",
    });
});
exports.completeBook = asyncErrorHandler(async (req, res, next) => {
    empty(req.params.bookId, 'Book ID not found', 400, next);
    const partialModel = req.user;
    //check if user is checked in
    if (!isCheckedInToday(partialModel?.checkIn.at())) return next(new customError('User must be checked in to gain permission...', 400));
    const book = await StudentBooks.findById(req.params.bookId)
    if (!book) return next(new customError('Book does not exist: Invalid Book ID...', 404));
   //check book existence
    if (!(await BookStore.findById(book.book))) return next(new customError('Book does not exist: Invalid Book ID...', 404));
    //add to completed collection
    const completeBook = await book.updateOne({$set: {status: 'COMPLETED', type: 'READ'}});
    if (!completeBook) return next(new customError('Error occurred while adding this book to your completed book collection...', 400));
    return res.status(200).json({
        status: "success",
        message: "Book added to completed book collection...",
    });
});
exports.returnBook = asyncErrorHandler(async (req, res, next) => {
    empty(req.params.bookId, 'Book ID not found', 400);
    empty(req.query.userId, 'User ID not found', 400);
    // Check if book exists
    if (!(await BookStore.findById(req.params.bookId))) return next(new customError('Book does not exist: Invalid Book ID...', 404));
    // Check if the book has been borrowed
    const book = await StudentBooks.findOne({ book: req.params.bookId, student: req.query.userId, type: 'BORROW' });
    if (!book) return next(new customError('This user has not borrowed this book...', 401));
    // Return the book
    const modifiedBook = await book.updateOne({$set: { status: 'RETURNED', type: 'READ' }})
    empty(modifiedBook, "An error occurred while returning this borrowed collection", 500);
    return res.status(200).json({
        status: "success",
        message: "Borrowed book returned...",
    });
});