

/**
 * 用于测量执行时间
 *
 * ref: https://fireship.io/lessons/ts-decorators-by-example/
 *
 * @export
 * @returns
 */
export function UbiElapsed() {
    return function (target: Object, key: string | symbol, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        descriptor.value = function (...args: any[]) {
            let elapsed = Date.now();

            const result: any = original.apply(this, args);

            elapsed = Date.now() - elapsed;
            console.log(`UbiElapsed: ${elapsed} ms`);

            return result;
        };

        return descriptor;
    };
}
