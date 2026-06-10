class customerr extends Error {
    statusCode;
    constructor(message, statusCode, erroroptions) {
        super(message, erroroptions);
        this.statusCode = statusCode;
        this.name = 'customerr';
    }
}
export default customerr;
