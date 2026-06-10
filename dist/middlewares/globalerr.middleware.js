function globalerrorhandling(err, req, res, next) {
    res.status(err.statusCode || 500).json({
        message: err.message, stack: err.stack, error: err.name
    });
}
export default globalerrorhandling;
