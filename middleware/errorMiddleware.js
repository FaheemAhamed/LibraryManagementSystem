const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    
    // In case statusCode is 200 (Express default when res.statusCode is not set on error throw)
    if (res.statusCode && res.statusCode !== 200 && !err.statusCode) {
        statusCode = res.statusCode;
    }

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
};

module.exports = errorHandler;
