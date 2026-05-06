import { AppError } from './errors.js';

// Express-compatible response helpers (res is an Express response object)
export function sendSuccess(res, data, status = 200) {
  return res.status(status).json({ success: true, data });
}

export function sendError(res, error) {
  let status = 500;
  let message = 'Internal Server Error';
  let details;

  if (error instanceof AppError) {
    status = error.statusCode;
    message = error.message;
    if ('details' in error) details = error.details;
  } else if (error instanceof Error) {
    message = error.message;
  }

  const body = { success: false, error: message };
  if (details !== undefined) body.details = details;
  if (error.alternatives !== undefined) body.alternatives = error.alternatives;
  return res.status(status).json(body);
}
