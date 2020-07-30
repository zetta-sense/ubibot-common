
/**
 * observable的过程型output，默认message为string
 *
 * @export
 * @class UbiObservableProgressOutput
 * @template T
 */
export class UbiObservableProgressOutput<T = string> {
    message: T;

    data?: any;

    /**
     *Creates an instance of UbiObservableProgressOutput.

     * observable的过程型output，默认message为string
     *
     * @param {T} message
     * @param {*} [data]
     * @memberof UbiObservableProgressOutput
     */
    constructor(message: T, data?: any) {
        this.message = message;
        this.data = data;
    }
}

