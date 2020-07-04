import { Pipe, PipeTransform } from '@angular/core';
import { UbiChannelDAO } from '../../entities/ubi-channel.entity';
import * as _ from 'lodash';

/**
 * 用于channels列表页面搜索channel
 *
 * @export
 * @class UbiChannelDaosFilterPipe
 * @implements {PipeTransform}
 */
@Pipe({
    name: 'ubiChannelDaosFilter',
    // 不考虑使用pure: false, 因为这里应该有controller进行iterableDiffer确保
    // pure: false,
})
export class UbiChannelDaosFilterPipe implements PipeTransform {

    transform(items: UbiChannelDAO[], pattern: string): UbiChannelDAO[] {

        if (!pattern) {
            return items;
        }

        if (!Array.isArray(items)) {
            return items;
        }

        const ret = items.filter((channelDao: UbiChannelDAO) => {
            const channelName = channelDao.name;
            const channelSerial = channelDao.full_serial;
            const channelId = channelDao.channel_id;
            const productId = channelDao.product_id;

            const regexp: string = _.escapeRegExp(`${pattern}`);
            // const tester: RegExp = new RegExp(`^${regexp}`, 'i'); // ignore case, starts with pattern, but end with any
            const tester: RegExp = new RegExp(`${regexp}`, 'ig'); // ignore case, global

            return tester.test(channelName) ||
                tester.test(channelSerial) ||
                tester.test(channelId) ||
                tester.test(productId);
        });

        return ret;
    }

}
