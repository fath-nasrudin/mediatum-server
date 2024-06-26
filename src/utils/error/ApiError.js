class ApiError extends Error {
  constructor(statusCode, message, additionalProperties = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.message = message;
    this.additionalProperties = additionalProperties;
  }
}

module.exports = ApiError;