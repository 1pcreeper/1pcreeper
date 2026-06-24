export class LoginRequiredError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'LoginRequiredError';
    }
}

export class APIRequestError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'APIRequestError';
    }
}