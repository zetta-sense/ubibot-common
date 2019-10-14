import { UbiChannelVConfig, VConfigItemHidden } from "./ubi-channel-vconfig.entity";

export enum UbiChannelFieldDefScaleType {
    // vconfig值, 值域一般为1, 3, 4, 5, 6, 7, 8, 9

    /**
     * 温度
     */
    TEMPERATURE = '1',

    /**
     * 湿度
     */
    HUMIDITY = '3',

    /**
     * 亮度
     */
    BRIGHTNESS = '4',

    /**
     * 电压
     */
    VOLTAGE = '5',

    /**
     * 信号
     */
    DBM = '6',

    /**
     * 震动
     */
    SHOCK = '7',

    /**
     * 敲击
     */
    KNOCK = '8',

    /**
     * 门磁
     */
    MAGNETIC = '9',

    /**
     * 土壤绝对湿度
     */
    ABSOLUTE_HUMIDITY = '10',

    /**
     * GSM信号强度
     */
    GSM = '11',

    /**
     * RS485外接探头温度
     */
    RS485_EXT_TEMPERATURE = '12',

    /**
     * RS485外接探头湿度
     */
    RS485_EXT_HUMIDITY = '13',

    /**
     * DS18B20外接探头温度
     */
    DS18B20_EXT_TEMPERATURE = '14',
}

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
     * 即vconfig的h值以及fieldxx是否有定义
     *
     * @type {boolean}
     * @memberof UbiChannelFieldDef
     */
    enabled: boolean = true;

    /**
     *  计量类型，如 “1”=温度（摄氏），“3”=湿度
     * 即vconfig的u值
     *
     * @type {UbiChannelFieldDefScaleType}
     * @memberof UbiChannelFieldDef
     */
    scaleType: UbiChannelFieldDefScaleType;

    constructor() {

    }

    static IsFieldPrefix(fieldKey: string) {
        return /^field\d+$/i.test(fieldKey);
    }

}
