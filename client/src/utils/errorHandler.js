/**
 * A higher-order function to handle errors in asynchronous functions.
 *
 * @param {Function} func - The async function to wrap.
 * @returns {Function} - A wrapped function with enhanced error handling.
 */
export const ErrorHandler = (func) => {
  return async (...args) => {
    try {
      // Call the original function with arguments and return its result
      return await func(...args);
    } catch (error) {
      // Normalize the error message
      let errorMessage = 'An unexpected error occurred. Please try again later.';
      if (error.response) {
        // Server responded with a status other than 2xx
        errorMessage = error.response?.data?.message || 'An unknown error occured'; 
      } else if (error.request) {
        // Request was made but no response was received
        errorMessage = 'No response from the server. Please check your network connection.';
      } else {
        // Something went wrong in setting up the request
        errorMessage = 'Session token has expired, pls login';
      }

      // Return the error in a consistent format
      return {
        status: error.response?.data?.status ||'error',
        message: errorMessage,
      };
    }
  };
};

