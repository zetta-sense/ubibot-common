import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'ubiObjectFilter'
})
export class UbiObjectFilterPipe implements PipeTransform {

    transform(items: any[], pattern: string, property?: string): any[] {

        if (!pattern) {
            return items;
        }

        if (!Array.isArray(items)) {
            return items;
        }

        const regexp: string = _.escapeRegExp(`${pattern}`);
        // const tester: RegExp = new RegExp(`^${regexp}`, 'i'); // ignore case, starts with pattern, but end with any
        const tester: RegExp = new RegExp(`${regexp}`, 'ig'); // ignore case, global

        const ret = items.filter((item) => {
            if (property) {
                return tester.test(item[property]);
            } else if (typeof item === 'string') {
                return tester.test(item);
            } else {
                const str = JSON.stringify(item);
                return tester.test(str);
            }
        });

        return ret;
    }


}
