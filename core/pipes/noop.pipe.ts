import { Pipe, PipeTransform } from '@angular/core';


/**
 * @deprecated
 *
 * Noop Pipe, 仅用于触发额外参数值变动
 * 应只放在pipe链的最后
 *
 * @export
 * @class NoopPipe
 * @implements {PipeTransform}
 */
@Pipe({
    name: 'noop'
})
export class NoopPipe implements PipeTransform {

    transform(input: any, ...args: any[]): any {
        // args仅用于触发变动，不输出
        return input;
    }

}
