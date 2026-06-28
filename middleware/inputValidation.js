const { body, query, validationResult } = require('express-validator');
const { ValidationError } = require('../utils/appError');

const validationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const errorsList = errors.array();
        const missingFields = errorsList.filter((error) => error.msg.includes('required'));
        const statusCode = missingFields.length > 0 ? 400 : 422;
        return next(new ValidationError(errorsList[0].msg, statusCode));
    }
    next();
};

const validateLogin = [
    body('username')
    .exists()
    .withMessage('Username is required')
    .escape()
    .isString()
    .withMessage('Username must be a string')
    .isLength({ min: 4 })
    .withMessage('Username must be at least 4 characters long')
    .notEmpty()
    .withMessage('Username cannot be empty'),

    body('password')
    .exists()
    .withMessage('Password is required')
    .escape()
    .isString()
    .withMessage('Password must be a string')
    .isLength({ min: 8, max: 64 })
    .withMessage('Password must be between 8 and 64 characters long'),

    validationErrors
];

const validateBookmark = [
    body('url')
    .exists()
    .withMessage('URL is required')
    .isURL()
    .isString()
    .withMessage('URL must be a string')
    .notEmpty()
    .withMessage('URL cannot be empty'),

    body('tag')
    .exists()
    .withMessage('Tag is required')
    .escape()
    .isString()
    .withMessage('Tag must be a string')
    .notEmpty()
    .withMessage('Tag cannot be empty'),

    validationErrors
];

const validateFilter = [
    query('tag')
    .exists()
    .withMessage('Tag is required')
    .escape()
    .isString()
    .withMessage('Tag must be a string')
    .notEmpty()
    .withMessage('Tag cannot be empty'),

    validationErrors
];

module.exports = {
    validateLogin,
    validateBookmark,
    validateFilter
};