import { UbiChannelFields } from "./ubi-channel-fields.entity";
import { UbiChannelFieldDef } from "./ubi-channel-field-def.entity";
import { UbiChannelLastValues, UbiChannelLastValuesItem } from "./ubi-channel-last-values.entity";
import * as _ from 'lodash';

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

        this.update(channel);
    }

    update(channel: UbiChannel) {
        Object.setPrototypeOf(this, UbiChannelDAO.prototype);
        Object.assign(this, channel);

        this.extra = {
            fields: this.__extractFields(),
            lastValues: this.__extractLastValues()
        };
    }

    getFields(): UbiChannelFields<UbiChannelFieldDef> {
        return this.extra.fields;
    }

    private __extractFields(): UbiChannelFields<UbiChannelFieldDef> {
        return UbiChannelFields.ConvertFromChannel(this);
    }

    getLastValues(): UbiChannelLastValues<UbiChannelLastValuesItem> {
        return this.extra.lastValues;
    }

    private __extractLastValues(): UbiChannelLastValues<UbiChannelLastValuesItem> {
        return UbiChannelLastValues.ConvertFromChannel(this);
    }

    getLastFieldValueDAO(fieldKey: string): UbiChannelFieldValueDAO {
        const fieldDef: UbiChannelFieldDef = _.find(this.extra.fields, { key: fieldKey });

        if (fieldDef) {
            const fieldValue = this.extra.lastValues[fieldKey];
            const fieldDAO = new UbiChannelFieldValueDAO(fieldDef, fieldValue);
            return fieldDAO;
        }

        return null;
    }
}

interface UbiChannelFeildExtra {
    fields: UbiChannelFields<UbiChannelFieldDef>;
    lastValues: UbiChannelLastValues<UbiChannelLastValuesItem>;
}

export class UbiChannelFieldValueDAO {

    /**
     * Represents the field column. Not null always.
     *
     * @type {UbiChannelFieldDef}
     * @memberof UbiChannelFieldValueDAO
     */
    fieldDef: UbiChannelFieldDef;

    /**
     * Represents the value item. Nullable.
     *
     * @type {UbiChannelLastValuesItem}
     * @memberof UbiChannelFieldValueDAO
     */
    valueItem: UbiChannelLastValuesItem;

    /**
     * Creates an instance of UbiChannelFieldValueDAO.
     * 可能存在没有valueItem的情况，此时valueItem将返回null
     *
     * @param {UbiChannelFieldDef} fieldDef
     * @param {UbiChannelLastValuesItem} [valueItem=<UbiChannelLastValuesItem>{}]
     * @memberof UbiChannelFieldValueDAO
     */
    constructor(fieldDef: UbiChannelFieldDef, valueItem: UbiChannelLastValuesItem) {
        this.fieldDef = fieldDef;
        this.valueItem = valueItem;
    }

    getValue(): number {
        return this.valueItem && this.valueItem.value;
    }

    isOnline(): boolean {
        return this.valueItem && this.valueItem.net != '0';
    }

    isOffline(): boolean {
        return !this.isOnline();
    }


}

