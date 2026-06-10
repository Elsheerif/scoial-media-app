import customerr from "./custom.error.js";
export class badrequestexception extends customerr {
    constructor(message: string="bad request", cause?: unknown) {
        super(message, 400, { cause });
        this.name = 'badrequestexception';
    }
}

export class unauthorizedrequestexception extends customerr {
    constructor(message: string="unauthorized", cause?: unknown) {
        super(message, 401, { cause });
        this.name = 'unauthorizedrequestexception';
    }
}
export class notfoundexception extends customerr {
    constructor(message: string="not found", cause?: unknown) {
        super(message, 404, { cause });
        this.name = 'notfoundexception';
    }
}

export class ConflictException extends customerr {
    constructor(message: string="conflict", cause?: unknown) {
        super(message, 409, { cause });
        this.name = 'ConflictException';
    }
}


