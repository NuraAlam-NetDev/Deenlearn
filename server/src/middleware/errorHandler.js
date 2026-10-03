export function notFound(req, res, _next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Server error';

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 409;
    message = 'Duplicate value';
  } else if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      status = 413;
      message = `File is too large (max ${process.env.MAX_FILE_MB || 10} MB)`;
    } else {
      status = 400;
      message =
        err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Send exactly one file in the form field "file"'
          : err.message;
    }
  }

  if (status >= 500) console.error(err);
  res.status(status).json({
    message,
    ...(process.env.NODE_ENV !== 'production' && status >= 500 && { stack: err.stack }),
  });
}
