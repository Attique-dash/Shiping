import { body, param, validationResult } from 'express-validator';
import { NextResponse } from 'next/server';

// Reusable validation rules
export const validateShipment = [
  // Sender validation
  body('sender.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Sender name must be between 2 and 100 characters'),
    
  body('sender.email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid sender email')
    .normalizeEmail(),
    
  body('sender.phone')
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
    .withMessage('Please provide a valid phone number'),
    
  body('sender.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Sender address must be between 5 and 200 characters'),

  // Receiver validation
  body('receiver.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Receiver name must be between 2 and 100 characters'),
    
  body('receiver.email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid receiver email')
    .normalizeEmail(),
    
  body('receiver.phone')
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
    .withMessage('Please provide a valid phone number'),
    
  body('receiver.address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Receiver address must be between 5 and 200 characters'),

  // Package details
  body('package.description')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Package description must be between 5 and 500 characters'),
    
  body('package.weight')
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Weight must be between 0.1kg and 1000kg'),
    
  body('package.dimensions.length')
    .optional()
    .isFloat({ min: 1, max: 300 })
    .withMessage('Length must be between 1cm and 300cm'),
    
  body('package.dimensions.width')
    .optional()
    .isFloat({ min: 1, max: 300 })
    .withMessage('Width must be between 1cm and 300cm'),
    
  body('package.dimensions.height')
    .optional()
    .isFloat({ min: 1, max: 300 })
    .withMessage('Height must be between 1cm and 300cm'),
    
  body('package.value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Value must be a positive number'),

  // Shipping options
  body('shipping.service')
    .isIn(['standard', 'express', 'overnight'])
    .withMessage('Invalid shipping service selected'),
    
  body('shipping.insurance')
    .optional()
    .isBoolean()
    .withMessage('Insurance must be a boolean value'),
    
  body('shipping.signatureRequired')
    .optional()
    .isBoolean()
    .withMessage('Signature requirement must be a boolean value')
];

export const validateTrackingNumber = [
  param('trackingNumber')
    .matches(/^[A-Z0-9]{10,20}$/)
    .withMessage('Invalid tracking number format')
];

export const validateAdminLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
    
  body('password')
    .isLength({ min: 12 })
    .withMessage('Password must be at least 12 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character')
];

// Custom validation for status updates
export const validateStatusUpdate = [
  body('status')
    .isIn(['pending', 'in_transit', 'out_for_delivery', 'delivered', 'exception'])
    .withMessage('Invalid status provided'),
    
  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
    
  body('notes')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
];

// Middleware to handle validation errors
export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    
    // Format errors for API response
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param || err.type]: err.msg }));
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Validation failed',
        errors: extractedErrors 
      },
      { status: 422 }
    );
  };
};

// Middleware for Next.js API routes
export const validateRequest = (validations) => {
  return async (req, res) => {
    await Promise.all(validations.map(validation => validation.run({ body: req.body, params: req.query })));
    
    const errors = validationResult({ body: req.body, params: req.query });
    if (!errors.isEmpty()) {
      const extractedErrors = [];
      errors.array().map(err => extractedErrors.push({ 
        field: err.param,
        message: err.msg 
      }));
      
      return NextResponse.json(
        { 
          success: false,
          message: 'Validation failed',
          errors: extractedErrors 
        },
        { status: 422 }
      );
    }
    
    return null; // No errors, continue with the request
  };
};
