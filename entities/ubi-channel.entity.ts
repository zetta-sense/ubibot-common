import { UbiChannelFields } from "./ubi-channel-fields.entity";
import { UbiChannelFieldDef } from "./ubi-channel-field-def.entity";
import { UbiChannelLastValues, UbiChannelLastValuesItem } from "./ubi-channel-last-values.entity";
import * as _ from 'lodash';
import { UbiExtraPreferenceTempScale } from "./ubi-extra-preference.entity";


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

        this.merge(channel);
    }

    /**
     * Merge new channel data instead of old.
     *
     * @param {UbiChannel} channel
     * @memberof UbiChannelDAO
     */
    merge(channel: UbiChannel) {
        Object.setPrototypeOf(this, UbiChannelDAO.prototype);
        Object.assign(this, channel);

        // 记录上次的值
        const oldValues = (this.extra && this.extra.lastValues) || {};

        // 生成新的extra信息对象
        this.extra = {
            fields: this.__extractFields(),
            lastValues: this.__extractLastValues(),
            fieldDAOs: <UbiChannelFieldValueDAOsMap>{},

            oldValues: oldValues,
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
}

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
    constructor(fieldDef: UbiChannelFieldDef,
        valueItem: UbiChannelLastValuesItem,
        oldValueItem: UbiChannelLastValuesItem
    ) {
        this.fieldDef = fieldDef;
        this.valueItem = valueItem;
        this.oldValueItem = oldValueItem;
    }

    /**
     * 获取该field的值，可以传入tempscale参数自动将温度field变换为相应温标下的值
     *
     * @param {UbiExtraPreferenceTempScale} [tempScale]
     * @returns {number}
     * @memberof UbiChannelFieldValueDAO
     */
    getValue(tempScale?: UbiExtraPreferenceTempScale): number {
        let ret = this.valueItem && this.valueItem.value;
        if (this.fieldDef.scaleType === '1' && tempScale === UbiExtraPreferenceTempScale.Fahrenheit && ret != null) {
            ret = ret * 9 / 5 + 32;
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


}

