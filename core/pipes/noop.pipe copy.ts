import { Pipe, PipeTransform } from '@angular/core';


/**
 * 如果是空字符串或null或undefined，则返回指定值
 *
 * @export
 * @class EmptyPipe
 * @implements {PipeTransform}
 */
@Pipe({
    name: 'empty'
})
export class EmptyPipe implements PipeTransform {

    transform(input: any, empty: string = ''): any {
        // args仅用于触发变动，不输出
        if (input === null || input === undefined || input === '') {
            return empty;
        }
        return input;
    }

}
