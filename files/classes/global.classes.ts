export class UserNotFoundError extends Error{
    msg: string
    constructor(msg : string) {
        super(msg)
        this.msg = msg;
    }
}

export class NoScraperConfigFoundError extends Error{
    msg: string
    constructor(msg : string) {
        super(msg)
        this.msg = msg;
    }
}