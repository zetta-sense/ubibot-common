
interface VConfigItem {
    u?: string; //
    h?: VConfigItemHidden; // "0" or "1"
}

export enum VConfigItemHidden {
    Yes = '1',
    No = '0'
}


/**
 * Field 1 ~ N with {VConfigItem}
 *
 * @export
 * @class UbiChannelVConfig
 */
export class UbiChannelVConfig {

    [fieldX: string]: VConfigItem;;

    static FromString(rawStr: string): UbiChannelVConfig {

        let ret = new UbiChannelVConfig();

        try {
            const parsed = JSON.parse(rawStr);
            Object.assign(ret, parsed);
        } catch (e) {
            // console.warn('VConfig parsing error.');
        }

        return ret;
    }
}
