const Book = require("../models/bookModel");
const BorrowRecord = require("../models/BorrowRecord");

const addBook = async (req, res) => {
    try {
        const { title, author, isbn, category, quantity } = req.body;

        // Check if isbn already exists
        const bookExists = await Book.findOne({ isbn });
        if (bookExists) {
            return res.status(400).json({ message: "Book with this ISBN already exists" });
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
        res.status(500).json({ message: error.message });
    }
};

const updateBook = async (req, res) => {
    try {
        const { title, author, isbn, category, quantity } = req.body;
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (isbn && isbn !== book.isbn) {
            const isbnExists = await Book.findOne({ isbn });
            if (isbnExists) {
                return res.status(400).json({ message: "Book with this ISBN already exists" });
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
                return res.status(400).json({ message: "Cannot reduce quantity because some copies are currently borrowed" });
            }

            book.quantity = newQty;
            book.availableQuantity = newAvailable;
        }

        await book.save();
        res.json({ message: "Book updated successfully", book });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Check if there are active borrows for this book
        const activeBorrows = await BorrowRecord.findOne({ bookId: book._id, status: "borrowed" });
        if (activeBorrows) {
            return res.status(400).json({ message: "Cannot delete book while some copies are borrowed" });
        }

        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAllBooks = async (req, res) => {
    try {
        const books = await Book.find({});
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const searchBooks = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: "Query parameter 'q' is required" });
        }

        const regex = new RegExp(q, 'i');
        const books = await Book.find({
            $or: [
                { title: regex },
                { author: regex },
                { category: regex },
                { isbn: regex }
            ]
        });

        res.json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const borrowBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        if (book.availableQuantity <= 0) {
            return res.status(400).json({ message: "No copies of this book are currently available" });
        }

        // Check if this member has already borrowed this book and hasn't returned it yet
        const alreadyBorrowed = await BorrowRecord.findOne({
            memberId: req.user.id,
            bookId: book._id,
            status: "borrowed"
        });

        if (alreadyBorrowed) {
            return res.status(400).json({ message: "You have already borrowed a copy of this book" });
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
        res.status(500).json({ message: error.message });
    }
};

const returnBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Find active borrow record
        const record = await BorrowRecord.findOne({
            memberId: req.user.id,
            bookId: book._id,
            status: "borrowed"
        });

        if (!record) {
            return res.status(400).json({ message: "No active borrow record found for this book and user" });
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
        res.status(500).json({ message: error.message });
    }
};

const getMyBorrowedBooks = async (req, res) => {
    try {
        const records = await BorrowRecord.find({
            memberId: req.user.id,
            status: "borrowed"
        }).populate("bookId");

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addBook,
    updateBook,
    deleteBook,
    getBookById,
    getAllBooks,
    searchBooks,
    borrowBook,
    returnBook,
    getMyBorrowedBooks
};