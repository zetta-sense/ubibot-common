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


    /**
     * 土壤温度
     */
    ABSOLUTE_TEMPERATURE = '15',


    // tag: The following is updated according to UBIAPP2-58

    /**
     * 智能开关功率状态
     */
    SWITCH_STATE = '16',

    /**
     * 智能开关功率电流
     */
    SWITCH_FLOW = '17',

    /**
     * 智能开关功率
     */
    SWITCH_POWER = '18',

    /**
     * 智能开关功率累计用电量
     */
    SWITCH_ACCUMULATED_CONSUMPTION = '19',

    /**
     * CO2外接
     */
    CO2_EXT = '20',

    /**
     * 风速
     */
    WIND_VELOCITY = '21',

    /**
     * 人感变动
     */
    HUMAN_DETECTION_PULSE = '22',

    /**
     * 人感状态
     */
    HUMAN_DETECTION = '30',

}

export enum UbiChannelFieldDefScaleTypeGroup {
    Temperature = 1,
    Humidity = 2,
    Signal = 3,
    Switch = 4,
    Misc = 100,
}

export declare type UbiChannelFieldDefScaleTypeGroupMap = { [groupKey: string]: string[] };


/**
 * Generate scale type groups according to scale type keys input.
 *
 * @export
 * @param {string[]} scaleTypeKeys
 * @returns {UbiChannelFieldDefScaleTypeGroupMap} {groupKey: [scaleTypeKey, string, string, ...]}
 */
export function GenerateScaleTypeGroupMap(scaleTypeKeys: string[]): UbiChannelFieldDefScaleTypeGroupMap {
    if (!scaleTypeKeys) return {};

    const map: UbiChannelFieldDefScaleTypeGroupMap = {};
    scaleTypeKeys.forEach((typeKey: string) => {
        const groupKey = WhichGroupOfScaleType(typeKey);
        map[groupKey] = map[groupKey] || [];
        map[groupKey].push(typeKey);
        // map[groupKey].push(UbiChannelFieldDefScaleType[typeKey]);
    });

    return map;
}

export function FilterTwoDimensionScaleTypes(scaleTypeKeys: string[]): string[] {
    return scaleTypeKeys.filter((scaleTypeKey) => {
        switch (UbiChannelFieldDefScaleType[scaleTypeKey]) {
            case UbiChannelFieldDefScaleType.SWITCH_STATE:
            case UbiChannelFieldDefScaleType.HUMAN_DETECTION:
                return false;
        }
        return true;
    });
}

export function FindScaleTypeKeyByValue(value: UbiChannelFieldDefScaleType): string {
    const scaleTypeKeys = Object.keys(UbiChannelFieldDefScaleType);
    for (let i = 0; i < scaleTypeKeys.length; i++) {
        const key = scaleTypeKeys[i];
        if (UbiChannelFieldDefScaleType[key] == value) {
            return key;
        }
    }
    return null;
}


/**
 * Classify scale type to group via scale type key input.
 *
 * @export
 * @param {string} scaleTypeKey
 * @returns {UbiChannelFieldDefScaleTypeGroup}
 */
export function WhichGroupOfScaleType(scaleTypeKey: string): UbiChannelFieldDefScaleTypeGroup {
    let ret: UbiChannelFieldDefScaleTypeGroup;

    switch (UbiChannelFieldDefScaleType[scaleTypeKey]) {
        case UbiChannelFieldDefScaleType.TEMPERATURE:
        case UbiChannelFieldDefScaleType.ABSOLUTE_TEMPERATURE:
        case UbiChannelFieldDefScaleType.RS485_EXT_TEMPERATURE:
        case UbiChannelFieldDefScaleType.DS18B20_EXT_TEMPERATURE:
            ret = UbiChannelFieldDefScaleTypeGroup.Temperature;
            break;
        case UbiChannelFieldDefScaleType.HUMIDITY:
        case UbiChannelFieldDefScaleType.ABSOLUTE_HUMIDITY:
        case UbiChannelFieldDefScaleType.RS485_EXT_HUMIDITY:
            ret = UbiChannelFieldDefScaleTypeGroup.Humidity;
            break;
        case UbiChannelFieldDefScaleType.DBM:
        case UbiChannelFieldDefScaleType.GSM:
            ret = UbiChannelFieldDefScaleTypeGroup.Signal;
            break;
        case UbiChannelFieldDefScaleType.SWITCH_STATE:
        case UbiChannelFieldDefScaleType.SWITCH_FLOW:
        case UbiChannelFieldDefScaleType.SWITCH_POWER:
        case UbiChannelFieldDefScaleType.SWITCH_ACCUMULATED_CONSUMPTION:
            ret = UbiChannelFieldDefScaleTypeGroup.Switch;
            break;
        default:
            ret = UbiChannelFieldDefScaleTypeGroup.Misc;
            break;
    }

    return ret;
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
