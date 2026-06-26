const isLibrarian = (req, res, next) => {
    if (!req.user || req.user.role !== "librarian") {
        return res.status(403).json({ message: "Access denied. Librarians only." });
    }
    next();
};

module.exports = { isLibrarian };