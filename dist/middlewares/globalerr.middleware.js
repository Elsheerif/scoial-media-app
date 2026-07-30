function globalerrorhandling(err, req, res, next) {
    const errorResponse = {
        message: err.message,
        error: err.name,
    };
    if (err.cause?.errors) {
        errorResponse.errors = err.cause.errors;
    }
    res.status(err.statusCode || 500).json(errorResponse);
}
export default globalerrorhandling;
