import customerr from "./custom.error.js";
export class badrequestexception extends customerr {
    constructor(message = "bad request", cause) {
        super(message, 400, { cause });
        this.name = 'badrequestexception';
    }
}
export class unauthorizedrequestexception extends customerr {
    constructor(message = "unauthorized", cause) {
        super(message, 401, { cause });
        this.name = 'unauthorizedrequestexception';
    }
}
export class notfoundexception extends customerr {
    constructor(message = "not found", cause) {
        super(message, 404, { cause });
        this.name = 'notfoundexception';
    }
}
export class ConflictException extends customerr {
    constructor(message = "conflict", cause) {
        super(message, 409, { cause });
        this.name = 'ConflictException';
    }
}
