


class customerr extends Error {
        constructor(message: string,public statusCode: number, erroroptions?: ErrorOptions) {
            super(message, erroroptions);
            this.name = 'customerr';
        }}

        export default customerr;