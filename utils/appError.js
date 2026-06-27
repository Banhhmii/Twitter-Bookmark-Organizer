class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  constructor(message, statusCode = 400) {
    super(message, statusCode);
    this.name = 'ValidationError';
  }
}

class AuthError extends AppError {
  constructor(message, statusCode = 401) {
    super(message, statusCode);
    this.name = 'AuthError';
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

module.exports = { ValidationError, AuthError, NotFoundError };
