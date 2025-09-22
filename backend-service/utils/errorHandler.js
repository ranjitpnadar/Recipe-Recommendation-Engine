// utils/errorHandler.js
const errorHandler = (res, error, statusCode = 500) => {
    console.error('Error:', error.message);
    res.status(statusCode).json({
        message: error.message || 'An unexpected error occurred.',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
};

module.exports = errorHandler;