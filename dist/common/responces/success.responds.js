function successResponse({ res }, statusCode, message, data) {
    return res.status(statusCode).json({
        message,
        result: data
    });
}
export default successResponse;
