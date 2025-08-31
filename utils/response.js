export const sendResponse = (res, statusCode = 200, success = true, message = "Success", data = null, error = null) => {
  const response = {
    success,
    message,
  };

  if (data !== null) response.data = data;
  if (error !== null) response.error = error;

  return res.status(statusCode).json(response);
};

export const successResponse = (res, data = {}, message = "Success", statusCode = 200) => {
  return sendResponse(res, statusCode, true, message, data);
};

export const errorResponse = (res, message = "Server Error", statusCode = 500, error = null) => {
  return sendResponse(res, statusCode, false, message, null, error);
};

export const badRequest = (res, message = "Bad Request") => {
  return sendResponse(res, 400, false, message);
};

export const unauthorized = (res, message = "Unauthorized") => {
  return sendResponse(res, 401, false, message);
};

export const forbidden = (res, message = "Forbidden") => {
  return sendResponse(res, 403, false, message);
};

export const notFound = (res, message = "Not Found") => {
  return sendResponse(res, 404, false, message);
};

export const conflict = (res, message = "Conflict") => {
  return sendResponse(res, 409, false, message);
};

export const unprocessableEntity = (res, message = "Unprocessable Entity") => {
  return sendResponse(res, 422, false, message);
};

export const serverError = (res, message = "Internal Server Error", error = null) => {
  return sendResponse(res, 500, false, message, null, error);
};
