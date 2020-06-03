/* tslint:disable */

// ref: rxjs TimeoutError
// interface UbiError extends Error {
// }
//
// interface UbiErrorCtor {
//     new(msg?:string): UbiError;
// }
//
// function UbiErrorImpl(this: any, msg?: string) {
//     Error.call(this);
//     this.message = msg;
//     this.name = 'UbiError';
//     return this;
// }
//
// UbiErrorImpl.prototype = Object.create(Error.prototype);
//
// export const UbiError: UbiErrorCtor = UbiErrorImpl as any;


// ref: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
export class UbiError extends Error {
    params;

    constructor(message?: string, params?: any) {
        super(message); // 'Error' breaks prototype chain here
        this.params = params;
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}
