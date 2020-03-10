import { UbiError } from "../../errors/UbiError";
import { Unsubscribable } from "rxjs";
import 'reflect-metadata';

/**
 * 用于声明哪些props需要持久化
 *
 * 与 UbiPersistent 连用
 *
 * @export
 * @returns
 */
export function UbiEntity(_params?) {

    return function (target) {
        _params = {
            ..._params,
        };

        // console.log(`========================>this:`, this);

        initHandlePersistent(target, _params);
    };


    /**
     * Initializer of subscription handle.
     *
     * @param {*} target
     * @param {*} params
     * @returns
     */
    function initHandlePersistent(target, params) {

        const props: string[] = Reflect.getMetadata('persistent:name', target.prototype) || []; // 注意如果没有UbiPersistent，则getMetadata返回空

        // override ngOnDestroy
        target.prototype['_props'] = props; // todo: 日后考虑improve这个

        return target;
    }
}


/**
 * 使用 this['_props'] to retrieve persistent list.
 *
 * @export
 * @param {*} [params]
 * @returns
 */
export function UbiPersistent(params?) {
    return function (target, propertyKey: string | symbol) {

        let persistents: any[] = Reflect.getMetadata('persistent:name', target);
        if (!persistents) {
            persistents = [];
            Reflect.defineMetadata('persistent:name', persistents, target);
        }

        // console.log(subscribers);
        // Reflect.defineMetadata('persistent:name', propertyKey, target, 'subscriber');

        persistents.push(propertyKey);
    };
}
