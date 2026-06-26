const Book = require("../models/bookModel");
const BorrowRecord = require("../models/BorrowRecord");

const addBook = async (req, res, next) => {
    try {
        const { title, author, isbn, category, quantity } = req.body;

        // Check if isbn already exists
        const bookExists = await Book.findOne({ isbn });
        if (bookExists) {
            const err = new Error("Book with this ISBN already exists");
            err.statusCode = 400;
            return next(err);
        }

        const qty = Number(quantity) || 1;
        const book = await Book.create({
            title,
            author,
            isbn,
            category,
            quantity: qty,
            availableQuantity: qty
        });

        res.status(201).json(book);
    } catch (error) {
        next(error);
    }
};

const updateBook = async (req, res, next) => {
    try {
        if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
            const err = new Error("Invalid Book ID format");
            err.statusCode = 400;
            return next(err);
        }

        const { title, author, isbn, category, quantity } = req.body;
        const book = await Book.findById(req.params.id);

        if (!book) {
            const err = new Error("Book not found");
            err.statusCode = 404;
            return next(err);
        }

        if (isbn && isbn !== book.isbn) {
            const isbnExists = await Book.findOne({ isbn });
            if (isbnExists) {
                const err = new Error("Book with this ISBN already exists");
                err.statusCode = 400;
                return next(err);
            }
            book.isbn = isbn;
        }

        if (title) book.title = title;
        if (author) book.author = author;
        if (category) book.category = category;

        if (quantity !== undefined) {
            const newQty = Number(quantity);
            const diff = newQty - book.quantity;
            const newAvailable = book.availableQuantity + diff;

            if (newAvailable < 0) {
                const err = new Error("Cannot reduce quantity because some copies are currently borrowed");
                err.statusCode = 400;
                return next(err);
            }

            book.quantity = newQty;
            book.availableQuantity = newAvailable;
        }

        await book.save();
        res.json({ message: "Book updated successfully", book });
    } catch (error) {
        next(error);
    }
};

const deleteBook = async (req, res, next) => {
    try {
        if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
            const err = new Error("Invalid Book ID format");
            err.statusCode = 400;
            return next(err);
        }

        const book = await Book.findById(req.params.id);
        if (!book) {
            const err = new Error("Book not found");
            err.statusCode = 404;
            return next(err);
        }

        // Check if there are active borrows for this book
        const activeBorrows = await BorrowRecord.findOne({ bookId: book._id, status: "borrowed" });
        if (activeBorrows) {
            const err = new Error("Cannot delete book while some copies are borrowed");
            err.statusCode = 400;
            return next(err);
        }

        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        next(error);
    }
};

const getBookById = async (req, res, next) => {
    try {
        if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
            const err = new Error("Invalid Book ID format");
            err.statusCode = 400;
            return next(err);
        }
        const book = await Book.findById(req.params.id);
        if (!book) {
            const err = new Error("Book not found");
            err.statusCode = 404;
            return next(err);
        }
        res.json(book);
    } catch (error) {
        next(error);
    }
};

const getAllBooks = async (req, res, next) => {
    try {
        const books = await Book.find({});
        res.json(books);
    } catch (error) {
        next(error);
    }
};

const borrowBook = async (req, res, next) => {
    try {
        if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
            const err = new Error("Invalid Book ID format");
            err.statusCode = 400;
            return next(err);
        }
        const book = await Book.findById(req.params.id);

        if (!book) {
            const err = new Error("Book not found");
            err.statusCode = 404;
            return next(err);
        }

        if (book.availableQuantity <= 0) {
            const err = new Error("Book is currently unavailable");
            err.statusCode = 400;
            return next(err);
        }

        // Check if this member has already borrowed this book and hasn't returned it yet
        const alreadyBorrowed = await BorrowRecord.findOne({
            memberId: req.user.id,
            bookId: book._id,
            status: "borrowed"
        });

        if (alreadyBorrowed) {
            const err = new Error("You have already borrowed a copy of this book");
            err.statusCode = 400;
            return next(err);
        }

        // Update book availability
        book.availableQuantity -= 1;
        await book.save();

        // Create borrow record
        const record = await BorrowRecord.create({
            memberId: req.user.id,
            bookId: book._id,
            status: "borrowed"
        });

        res.json({ message: "Book borrowed successfully", borrowRecord: record, book });

    } catch (error) {
        next(error);
    }
};

const returnBook = async (req, res, next) => {
    try {
        if (!require('mongoose').Types.ObjectId.isValid(req.params.id)) {
            const err = new Error("Invalid Book ID format");
            err.statusCode = 400;
            return next(err);
        }
        const book = await Book.findById(req.params.id);

        if (!book) {
            const err = new Error("Book not found");
            err.statusCode = 404;
            return next(err);
        }

        // Find active borrow record
        const record = await BorrowRecord.findOne({
            memberId: req.user.id,
            bookId: book._id,
            status: "borrowed"
        });

        if (!record) {
            const err = new Error("No active borrow record found for this book and user");
            err.statusCode = 400;
            return next(err);
        }

        // Update borrow record
        record.status = "returned";
        record.returnDate = new Date();
        await record.save();

        // Update book availability
        book.availableQuantity += 1;
        await book.save();

        res.json({ message: "Book returned successfully", borrowRecord: record, book });

    } catch (error) {
        next(error);
    }
};

const getMyBorrowedBooks = async (req, res, next) => {
    try {
        const records = await BorrowRecord.find({
            memberId: req.user.id,
            status: "borrowed"
        }).populate("bookId");

        res.json(records);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    addBook,
    updateBook,
    deleteBook,
    getBookById,
    getAllBooks,
    borrowBook,
    returnBook,
    getMyBorrowedBooks
};