
interface VConfigItem {
    u?: string; //
    h?: VConfigItemHidden; // "0" or "1"
}

export enum VConfigItemHidden {
    Yes = '1',
    No = '0'
}

export class UbiChannelVConfig {
    field1?: VConfigItem;
    field2?: VConfigItem;
    field3?: VConfigItem;
    field4?: VConfigItem;
    field5?: VConfigItem;
    field6?: VConfigItem;
    field7?: VConfigItem;
    field8?: VConfigItem;
    field9?: VConfigItem;
    field10?: VConfigItem;
    field11?: VConfigItem;
    field12?: VConfigItem;

    [fieldX: string]: VConfigItem;;

    static FromString(rawVConfigStr: string): UbiChannelVConfig {

        let ret = new UbiChannelVConfig();

        try {
            const parsed = JSON.parse(rawVConfigStr);
            Object.assign(ret, parsed);
        } catch (e) {
            console.warn('VConfig parsing error. Raw:', rawVConfigStr);
        }

        return ret;
    }

}
