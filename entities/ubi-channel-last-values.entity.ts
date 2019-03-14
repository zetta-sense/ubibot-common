import { UbiChannel } from "./ubi-channel.entity";

export interface UbiChannelLastValuesItem {
    value?: number;
    created_at?: string;
    net?: string; // 在线状态 '0' or '1'
}

export class UbiChannelLastValues<T extends UbiChannelLastValuesItem> {

    entry_id?: T; // 有些有有些没有
    [fieldKey: string]: T; // fieldN

    constructor() {
        Object.setPrototypeOf(this, UbiChannelLastValues.prototype);
    }

    static ConvertFromChannel(channel: UbiChannel): UbiChannelLastValues<UbiChannelLastValuesItem> {
        return this.FromString(channel.last_values);
    }

    static FromString(rawStr: string): UbiChannelLastValues<UbiChannelLastValuesItem> {

        let ret = new UbiChannelLastValues();

        try {
            const parsed = JSON.parse(rawStr);
            Object.assign(ret, parsed);
        } catch (e) {
            console.warn('Last value parsing error.');
        }

        return ret;
    }
}
