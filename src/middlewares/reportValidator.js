import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Validator to ensure a valid MongoDB ID
export const validateId = (req, res, next) => {
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid ID format')
    .run(req)
    .then(() => next())
    .catch((err) => next(err));
};

// Validator for creating a report
export const validateReportBody = (req, res, next) => {
  Promise.all([
    body('userId')
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid userId format')
      .run(req),

    body('type')
      .isIn(['publication', 'itinerary'])
      .withMessage('Type must be either "publication" or "itinerary"')
      .run(req),

    body('reason')
      .isString()
      .notEmpty()
      .withMessage('Reason must be a non-empty string')
      .run(req),
  ])
    .then(() => next()) // If all validations pass, continue to the next middleware
    .catch((err) => next(err)); // If there is an error, pass it to the error-handling middleware
};

// Validator for query filters (optional userId filter)
export const validateFilters = (req, res, next) => {
  Promise.all([
    query('userId')
      .optional()
      .custom((value) => mongoose.Types.ObjectId.isValid(value))
      .withMessage('Invalid userId format')
      .run(req),
  ])
    .then(() => next()) // If all validations pass, continue to the next middleware
    .catch((err) => next(err)); // If there is an error, pass it to the error-handling middleware
};

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};