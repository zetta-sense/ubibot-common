

export enum UbiExtraPreferenceDateTimeFormat {
    /**
     * 一般用于亚洲以及cn
     */
    STYLE_1 = 'yyyy-MM-dd HH:mm:ss',

    /**
     * 一般用于io
     */
    STYLE_2 = 'MM/dd/yyyy HH:mm:ss',


    /**
     * 英国
     */
    STYLE_3 = 'dd/MM/yyyy HH:mm:ss',

}

/**
 * 用于决定组模式时哪个field应该显示(true)/隐藏(false)
 * eg. {field1: true, field2: false, ...}
 *
 * @export
 * @interface UbiExtraPreferenceGroupChartsFieldsState
 */
export interface UbiExtraPreferenceGroupChartsFieldsState {
    [key: string]: boolean;
}


/**
 * 发票信息
 *
 * @export
 * @interface UbiExtraPreferenceInvoiceInfo
 */
export interface UbiExtraPreferenceInvoiceInfo {
    einvoice_form?: string;
    einvoice_type?: string;
    subtype?: string;
    tax_ref?: string;
    title?: string;
}


/**
 * 温标
 *
 * @export
 * @enum {number}
 */
export enum UbiExtraPreferenceTempScale {
    Celsius = 'celsius',
    Fahrenheit = 'fahrenheit',
}

export enum UbiExtraPreferenceChannelsListStyle {
    Text = 'text',
    Icon = 'icon',
}

export enum UbiExtraPreferenceTimezoneSource {
    Account = 'account',
    Local = 'local',
}

/**
 * 以channelId作为key的用户自定义channel列表view属性
 * value为一个properties数组
 *
 * @depreacated from v4, replaced by channel's vpref
 * @export
 * @interface UbiExtraPreferenceChannelsListItemCustomize
 */
// export interface UbiExtraPreferenceChannelsListItemCustomize {
//     [channelId: string]: UbiExtraPreferenceChannelsListItemCustomizeProperties[];
// }
// export interface UbiExtraPreferenceChannelsListItemCustomizeProperties {
//     key: string;
//     index: number; // 排序
//     visible: boolean; // 用户自定义，默认应为true
// }


export class UbiExtraPreference {

    v: number; // 版本

    datetime_format: UbiExtraPreferenceDateTimeFormat;
    group_charts_fields_state: { [groupId: number]: UbiExtraPreferenceGroupChartsFieldsState };
    invoice_info: UbiExtraPreferenceInvoiceInfo;
    temp_scale: UbiExtraPreferenceTempScale;

    channels_list_style: UbiExtraPreferenceChannelsListStyle;

    decimal_place: number;
    timezone_source: UbiExtraPreferenceTimezoneSource;

    /**
     * 移除无效的属性
     *
     * @memberof UbiExtraPreference
     */
    normalize(): void {
        const propsList: string[] = [
            'v',
            'datetime_format', 'group_charts_fields_state',
            'invoice_info', 'temp_scale',
            'channels_list_style',
            'decimal_place',
            'timezone_source',
        ]; // todo: 以后用decorator处理这个问题

        const props = Object.keys(this);
        props.forEach((k) => {
            if (propsList.indexOf(k) == -1) { // invalid or deprecated prop
                delete this[k];
            }
        });
        // console.log(this);
    }

    /**
     *
     * @depreacated from v4, replaced by channel's vpref
     * @type {UbiExtraPreferenceChannelsListItemCustomize}
     * @memberof UbiExtraPreference
     */
    // channels_list_item_customize: UbiExtraPreferenceChannelsListItemCustomize;

    // tag: 未定义，可能于将来定义新的
    // [key: string]: any;

    constructor(data?: string | UbiExtraPreference) {
        try {
            if (typeof data == 'string') {
                const obj = JSON.parse(data);
                Object.assign(this, obj);
            } else if (data) {
                Object.assign(this, data);
            }
        } catch (e) { }
    }

    toString(): string {
        const ret = Object.assign({}, this);
        // const props = Object.getOwnPropertyNames(this);
        // console.log('props=', props, ret);
        return JSON.stringify(ret);
    }
}
