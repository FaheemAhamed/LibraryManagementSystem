const isLibrarian = (req, res, next) => {
    if (!req.user || req.user.role !== "librarian") {
        const err = new Error("Access denied. Librarians only.");
        err.statusCode = 403;
        return next(err);
    }
    next();
};

module.exports = { isLibrarian };