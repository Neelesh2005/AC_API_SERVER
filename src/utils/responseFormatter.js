/**
 * Standardized API response formatter
 * @param {string} status - Response status
 * @param {string} message - Response message
 * @param {object} data - Optional data payload
 * @param {object} meta - Optional metadata
 * @returns {object} Formatted response object
 */
export const formatResponse = (status, message, data = null, meta = null) => {
  const response = {
    status,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (meta !== null && meta !== undefined) {
    response.meta = meta;
  }

  return response;
};

/**
 * Success response helper
 */
export const successResponse = (message, data = null, meta = null) => {
  return formatResponse('success', message, data, meta);
};

/**
 * Error response helper
 */
export const errorResponse = (message, data = null, meta = null) => {
  return formatResponse('error', message, data, meta);
};

/**
 * Validation error response helper
 */
export const validationErrorResponse = (message, errors = []) => {
  return formatResponse('validation_error', message, null, { errors });
};

/**
 * Paginated response helper
 */
export const paginatedResponse = (message, data, pagination) => {
  return formatResponse('success', message, data, {
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || 0,
      pages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
    }
  });
};

// Default export for backward compatibility
export default formatResponse;