// Central error handling middleware
// Any route/controller can call next(error) to reach here
function errorHandler(err, req, res, next) {
  console.error('Error:', err); // Helpful for debugging in development

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err && err.message ? err.message : 'Internal server error',
    // Only show stack trace in non-production environments
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

export default errorHandler;
