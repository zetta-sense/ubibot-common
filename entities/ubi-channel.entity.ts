import { UbiChannelFields } from "./ubi-channel-fields.entity";
import { UbiChannelFieldDef } from "./ubi-channel-field-def.entity";
import { UbiChannelLastValues, UbiChannelLastValuesItem } from "./ubi-channel-last-values.entity";
import * as _ from 'lodash';
import { UbiExtraPreferenceTempScale } from "./ubi-extra-preference.entity";
import { EnumBasicProductId } from "../enums/enum-basic-product-id.enum";

export interface UbiValueOptions {
    tempScale?: UbiExtraPreferenceTempScale,
}

/**
 * 用于接收到的channel raw数据
 *
 * @export
 * @abstract
 * @class UbiChannel
 */
export abstract class UbiChannel {
    channel_id?: string;
    field1?: string;
    field2?: string;
    field3?: string;
    field4?: string;
    field5?: string;
    field6?: string;
    field7?: string;
    field8?: string;
    field9?: string;
    field10?: string;
    latitude?: string;
    longitude?: string;
    name?: string;
    public_flag?: string;
    tags?: any;
    url?: string;
    metadata?: string;
    description?: string;
    traffic_out?: string;
    traffic_in?: string;
    status?: string;
    created_at?: string;
    updated_at?: string;
    usage?: string;
    last_entry_id?: string;
    last_entry_date?: string;
    product_id?: string;
    device_id?: string;
    channel_icon?: string;
    last_ip?: string;
    attached_at?: string;
    firmware?: string;
    full_dump?: string;
    activated_at?: string;
    serial?: string;
    full_dump_limit?: string;
    cali?: string;
    size_out?: string;
    size_storage?: string;
    plan_code?: string;
    plan_start?: string;
    plan_end?: string;
    bill_start?: string;
    bill_end?: string;
    last_values?: string;
    vconfig?: string;
    battery?: number;
    net?: string;
    c_icon_base?: string;
    full_serial?: string;


    [key: string]: any;

    private getStaus(): any {
        let ret = {};
        try {
            // eg.
            // "{"ssid":"Baby Ting","status":"ssid=Baby Ting,usb=0","usb":"0"}"
            ret = JSON.parse(this.status) || {};
        } catch (e) { }

        return ret;
    }

    // tag: 不需要复杂parse的getter直接放entity里


    /**
     * 是否提供USB供电
     *
     * @returns {boolean}
     * @memberof UbiChannel
     */
    isUsbSupport(): boolean {
        // 无论usb的值是什么，只要有这个key就认为support
        return this.getStaus().usb !== undefined;
    }

    static IsSimSupported(productId: string): boolean {
        if (productId === EnumBasicProductId.WS1P) {
            return true;
        }
        return false;
    }

    isSimSupported() {
        return UbiChannel.IsSimSupported(this.product_id);
    }

    hasSSID(): boolean {
        return this.getStaus().ssid !== undefined;
    }

    getSSID(): string {
        return this.getStaus().ssid;
    }

    hasICCID(): boolean {
        return this.getStaus().ICCID !== undefined;
    }

    getICCID(): string {
        return this.getStaus().ICCID;
    }

    /**
     * 根据net判断，仅当net="1"时为true，其它false
     * net可能的值域 "-1", "0", "1"
     *
     * @returns {boolean}
     * @memberof UbiChannelDAO
     */
    isOnline(): boolean {
        return this.net === "1";
    }

    /**
     * 是否支持设备报警
     *
     * @returns {boolean}
     * @memberof UbiChannel
     */
    isSupportRuleCommand(): boolean {
        const pattern = new RegExp(_.escapeRegExp(EnumBasicProductId.WS1P), 'i');
        return pattern.test(this.product_id);
    }

}


/**
 * A DAO object to access parsed info by extra field.
 * If a channel entity should be updated, call update() method instead.
 *
 * @export
 * @class UbiChannelDAO
 * @extends {UbiChannel}
 */
export class UbiChannelDAO extends UbiChannel {

    private extra: UbiChannelFeildExtra;

    constructor(channel: UbiChannel) {
        super();

        Object.setPrototypeOf(this, UbiChannelDAO.prototype);

        this.merge(channel);
    }

    /**
     * Merge new channel data instead of old.
     *
     * @param {UbiChannel} channel
     * @memberof UbiChannelDAO
     */
    merge(channel: UbiChannel) {
        // 记录上次的值
        const oldValues = (this.extra && this.extra.lastValues) || {};

        Object.assign(this, channel);

        // 生成新的extra信息对象
        this.extra = {
            fields: this.__extractFields(),
            lastValues: this.__extractLastValues(),
            fieldDAOs: <UbiChannelFieldValueDAOsMap>{},

            oldValues: oldValues,
            // oldValues: {field1: { value: 23, created_at: '2019-05-16T18:10:27Z', net: '1'}}
        };

        // 构建每个field的DAO，用于关联field与value
        this.getFields().forEach((field: UbiChannelFieldDef) => {
            const fieldDef: UbiChannelFieldDef = _.find(this.extra.fields, { key: field.key });

            if (fieldDef) {
                const fieldValue = this.extra.lastValues[field.key];
                const oldFieldValue = this.extra.oldValues[field.key];

                const fieldDAO = new UbiChannelFieldValueDAO(fieldDef, fieldValue, oldFieldValue);
                this.extra.fieldDAOs[field.key] = fieldDAO;
            }
        });
    }

    getFields(): UbiChannelFields<UbiChannelFieldDef> {
        return this.extra.fields;
    }

    private __extractFields(): UbiChannelFields<UbiChannelFieldDef> {
        return UbiChannelFields.ConvertFromChannel(this);
    }


    /**
     * 返回一个稳定的UbiChannelLastValues实例，仅当有新数据时(merge)，会产生新的实例
     *
     * @returns {UbiChannelLastValues<UbiChannelLastValuesItem>}
     * @memberof UbiChannelDAO
     */
    getLastValues(): UbiChannelLastValues<UbiChannelLastValuesItem> {
        return this.extra.lastValues;
    }

    private __extractLastValues(): UbiChannelLastValues<UbiChannelLastValuesItem> {
        return UbiChannelLastValues.ConvertFromChannel(this);
    }


    /**
     * 返回一个稳定的UbiChannelFieldValueDAO实例，仅当有新数据时(merge)，会产生新的实例
     *
     * @param {string} fieldKey
     * @returns {UbiChannelFieldValueDAO}
     * @memberof UbiChannelDAO
     */
    getLastFieldValueDAO(fieldKey: string): UbiChannelFieldValueDAO {
        return this.extra.fieldDAOs[fieldKey];
    }

    clone(): UbiChannelDAO {
        return _.clone(this);
    }
}


/**
 * 用于转换每个field相关信息
 *
 * @interface UbiChannelFeildExtra
 */
interface UbiChannelFeildExtra {
    fields: UbiChannelFields<UbiChannelFieldDef>;
    lastValues: UbiChannelLastValues<UbiChannelLastValuesItem>;
    fieldDAOs: UbiChannelFieldValueDAOsMap;

    oldValues?: UbiChannelLastValues<UbiChannelLastValuesItem>;
}

interface UbiChannelFieldValueDAOsMap {
    [key: string]: UbiChannelFieldValueDAO;
}

export class UbiChannelFieldValueDAO {

    /**
     * Represents the field column. Not null always.
     *
     * @type {UbiChannelFieldDef}
     * @memberof UbiChannelFieldValueDAO
     */
    private fieldDef: UbiChannelFieldDef;

    /**
     * Represents the value item. Nullable.
     *
     * @type {UbiChannelLastValuesItem}
     * @memberof UbiChannelFieldValueDAO
     */
    private valueItem: UbiChannelLastValuesItem;

    /**
     * Represents the old value. Nullable.
     *
     * @type {UbiChannelLastValuesItem}
     * @memberof UbiChannelFieldValueDAO
     */
    private oldValueItem: UbiChannelLastValuesItem;

    /**
     * Creates an instance of UbiChannelFieldValueDAO.
     * 可能存在没有valueItem的情况，此时valueItem将返回null
     *
     * @param {UbiChannelFieldDef} fieldDef
     * @param {UbiChannelLastValuesItem} [valueItem=<UbiChannelLastValuesItem>{}]
     * @memberof UbiChannelFieldValueDAO
     */
    constructor(
        fieldDef: UbiChannelFieldDef,
        valueItem: UbiChannelLastValuesItem,
        oldValueItem: UbiChannelLastValuesItem,
    ) {
        this.fieldDef = fieldDef;
        this.valueItem = valueItem;
        this.oldValueItem = oldValueItem;
    }

    /**
     * 获取该field的值，可以传入tempscale参数自动将温度field变换为相应温标下的值
     *
     * @param {UbiValueOptions} eg. {tempScale: 'celsius'}
     * @returns {number}
     * @memberof UbiChannelFieldValueDAO
     */
    getValue(opts?: UbiValueOptions): number {
        let ret = this.valueItem && this.valueItem.value;
        if (ret != null) {
            ret = ConvertValue(ret, this.fieldDef, opts);
        }
        return ret;
    }

    getOldValue(): number {
        return this.oldValueItem && this.oldValueItem.value;
    }

    getFieldDef(): UbiChannelFieldDef {
        return this.fieldDef;
    }

    isOnline(): boolean {
        return this.valueItem && this.valueItem.net != '0';
    }

    isOffline(): boolean {
        return !this.isOnline();
    }

    clone(): UbiChannelFieldValueDAO  {
        return _.clone(this);
    }
}


/**
 * 用于统一判断应使用的单位，特别是保留于没有明确指定温标的情况
 *
 * @export
 * @param {UbiExtraPreferenceTempScale} tempScale
 * @returns {boolean}
 */
export function UseCelsius(tempScale: UbiExtraPreferenceTempScale): boolean {
    return !(tempScale === UbiExtraPreferenceTempScale.Fahrenheit);
}


/**
 * 用于统一自动转换对应field的值
 * 由 数据库值 -> view值
 *
 * @export
 * @param {number} value
 * @param {UbiChannelFieldDef} fieldDef
 * @param {UbiValueOptions} [opts] 用户偏好的选项，一般从UbiUserPrefference获得
 * @returns
 */
export function ConvertValue(value: number, fieldDef: UbiChannelFieldDef, opts: UbiValueOptions = {}) {
    // 仅当为温度时，且偏好非celsius则转换值
    if (fieldDef.scaleType === '1' && !UseCelsius(opts.tempScale) && value != null) {
        value = value * 9 / 5 + 32;
        value = parseFloat(value.toFixed(5));
    }
    return value;
}

/**
 * 用于统一自动转换对应field的值
 * 由 view值 -> 数据库值
 *
 * @export
 * @param {number} value
 * @param {UbiChannelFieldDef} fieldDef
 * @param {UbiValueOptions} [opts={}]
 * @returns
 */
export function ConvertValueReverse(value: number, fieldDef: UbiChannelFieldDef, opts: UbiValueOptions = {}) {
    // 仅当为温度时，且偏好非celsius则转换值
    if (fieldDef.scaleType === '1' && !UseCelsius(opts.tempScale) && value != null) {
        value = (value - 32) * 5 / 9;
        value = parseFloat(value.toFixed(5));
    }
    return value;
}
