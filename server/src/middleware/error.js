/**
 * مدیریت خطاهای سراسری
 */
export function errorHandler(err, req, res, next) {
  console.error('[error]', err.message);
  if (err.stack) console.error(err.stack);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'خطای داخلی سرور';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

/**
 * 404
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'مسیر یافت نشد',
    path: req.path,
    method: req.method,
  });
}

/**
 * Async wrapper (جلوگیری از try/catch تکراری)
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
