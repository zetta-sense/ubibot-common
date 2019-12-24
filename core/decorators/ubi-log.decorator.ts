

/**
 * An Ubi aspect logger for function member of class.
 *
 * @export
 * @returns
 */
export function UbiLog(msg?: string) {
    return function (target: any, key: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;

        // console.log(target, key, descriptor);

        descriptor.value = function (...args: any[]) {
            // 注意这里必须是function，而不能是arrow function，这样this才会是caller（=instance）
            console.log(`${target.constructor.name} (${key}): ${msg}...`);

            const result: any = original.apply(this, args);

            return result;
        };

        return descriptor;
    };
}
