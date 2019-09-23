import { Pipe, PipeTransform } from '@angular/core';


/**
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

    transform(...args: any[]): any {
        return args;
    }

}
