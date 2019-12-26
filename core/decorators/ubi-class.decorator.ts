import { UbiError } from "../../errors/UbiError";
import { Unsubscribable } from "rxjs";
import 'reflect-metadata';

/**
 * An Ubi decorator class for automator.
 *
 * 在使用任意ubi decorator功能时，一般都需要先声明这个
 *
 * @export
 * @returns
 */
export function UbiClass(_params?) {

    return function (target) {
        _params = {
            destroyFunc: 'ngOnDestroy',
            initFunc: 'ngOnInit',
            ..._params,
        };

        // console.log(`========================>this:`, this);

        initHandleSubscription(target, _params);
    };


    /**
     * Initializer of subscription handle.
     *
     * @param {*} target
     * @param {*} params
     * @returns
     */
    function initHandleSubscription(target, params) {

        if (typeof target.prototype[params.destroyFunc] !== 'function') {
            throw new Error(`${target.prototype.constructor.name} must implement ${params.destroyFunc}() lifecycle hook`);
        }

        // tag: 通过UbiSubscription定义的subscribers列表
        const subscribers: string[] = Reflect.getMetadata('subscription:name', target.prototype) || []; // 注意如果没有UbiSubscription，则getMetadata返回空

        // override ngOnDestroy
        target.prototype[params.destroyFunc] = ngOnDestroyDecorator(target.prototype[params.destroyFunc]);

        // tag: 注意这里必须使用function而不是arrow function，这样这里的this就是作为caller的instance
        function ngOnDestroyDecorator(f) {
            return function () {
                subscribers.forEach((subscriberFuncName) => {
                    // console.log(`unsubscribing ${subscriberFuncName}...`);

                    if (this[subscriberFuncName] && typeof this[subscriberFuncName].unsubscribe === 'function') {
                        this[subscriberFuncName].unsubscribe();
                        // console.log(`done`);
                    }
                });
                return f.apply(this, arguments);
            };
        }

        return target;
    }
}


/**
 * An Rx subscription automator subscribe/unsubscribe decorator.
 *
 * 声明这个将使变量在ngOnDestroy时自动执行unsubscribe()
 *
 * ref: https://dev.to/2muchcoffeecom/trick-or-unsubscribe-in-rxjs-a-custom-angular-decorator-545a
 *
 * @export
 * @param {*} [params]
 * @returns
 */
export function UbiSubscription(params?) {
    return function (target, propertyKey: string | symbol) {

        let subscribers: any[] = Reflect.getMetadata('subscription:name', target);
        if (!subscribers) {
            subscribers = [];
            Reflect.defineMetadata('subscription:name', subscribers, target);
        }

        // console.log(subscribers);
        // Reflect.defineMetadata('subscription:name', propertyKey, target, 'subscriber');

        subscribers.push(propertyKey);
    };
}
