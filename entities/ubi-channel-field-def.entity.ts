import { UbiChannelVConfig, VConfigItemHidden } from "./ubi-channel-vconfig.entity";

export class UbiChannelFieldDef {

    /**
     * 例如 field1
     *
     * @type {string}
     * @memberof UbiChannelFieldDef
     */
    key: string;

    /**
     * 服务器赋予的名称，同时视情况可能会用作i18n的key
     *
     * @type {string}
     * @memberof UbiChannelFieldDef
     */
    label: string;

    /**
     * 此field对产品是否有效，一般由UbiChannelFields初始化
     *
     * @type {boolean}
     * @memberof UbiChannelFieldDef
     */
    enabled: boolean = true;

    /**
     *  计量类型，如 “1”=温度（摄氏），“3”=湿度
     * 即vconfig的u值
     *
     * @type {string}
     * @memberof UbiChannelFieldDef
     */
    scaleType: string;

    constructor() {

    }

    static IsFieldPrefix(fieldKey: string) {
        return /^field\d+$/i.test(fieldKey);
    }

}
