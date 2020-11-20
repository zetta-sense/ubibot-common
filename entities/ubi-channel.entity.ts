import { UbiChannelFields } from "./ubi-channel-fields.entity";
import { UbiChannelFieldDef, UbiChannelFieldDefScaleType } from "./ubi-channel-field-def.entity";
import { UbiChannelLastValues, UbiChannelLastValuesItem } from "./ubi-channel-last-values.entity";
import * as _ from 'lodash';
import { UbiExtraPreferenceTempScale } from "./ubi-extra-preference.entity";
import { EnumBasicProductId } from "../enums/enum-basic-product-id.enum";
import { Subject } from "rxjs";
import { UbiChannelVConfig } from "./ubi-channel-vconfig.entity";
import { UbiChannelVPref, UbiChannelVPrefFieldProperties } from "./ubi-channel-vpref.entity";
import { UbiChannelCalibrate } from "./ubi-channel-calibrate.entity";
import { UbiSensorsMapping } from "./ubi-sensors-mapping.entity";

export interface UbiValueOptions {
    tempScale?: UbiExtraPreferenceTempScale,
}

export class UbiChannelMetadata {
    fn_dp: number;

    fn_th: number;
    fn_light: number;
    fn_ext_t: number;
    fn_battery: number;

    fn_485_th: number;
    fn_485_sth: number;

    net_mode: number;
    wifi_mode: number;
    no_net_fn: number;
    cg_data_led: number;

    fn_acc_act: number;
    fn_acc_tap1: number;
    fn_acc_tap2: number;
    thres_acc_min: number;

    fn_mag: number;
    fn_mag_int: number;

    fn_bt: number;

    [key: string]: any;

    constructor(raw: UbiChannelMetadata | any) {
        Object.assign(this, raw);
        Object.setPrototypeOf(this, UbiChannelMetadata.prototype);
    }

    toJSONString() {
        return JSON.stringify(this);
    }
}

export interface UbiChannelTriggeringRule {
    channel_id: string, // "5369"
    rule_id: string, // "13937"

    /**
     * eg. 'numeric'
     *
     * @type {string}
     * @memberof UbiChannelTriggeringRule
     */
    rule_type: string, // "numeric"

    /**
     * @type {string} eg. 'true'
     * @memberof UbiChannelTriggeringRule
     */
    last_result: string, // "true"

    /**
     * eg. '2019-12-26T10:06:03Z'
     *
     * @type {string}
     * @memberof UbiChannelTriggeringRule
     */
    last_result_time: string, // "2019-12-26T10:06:03Z"

    rule_name: string,
}

export interface UbiChannelVirtualFieldLike {
    channel_id?: string,
    created_at?: string,
    field_label?: string,
    field_name?: string,
    field_status?: string,
    field_unit?: string,
    source_function?: string,
    updated_at?: string,
    user_id?: string,
    virtual_id?: string,
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
    cali?: string; // 校准值, in json string
    size_out?: string;
    size_storage?: string;
    plan_code?: string;
    plan_start?: string;
    plan_end?: string;
    bill_start?: string;
    bill_end?: string;
    last_values?: string;
    vconfig?: string;
    vpref?: string;
    sensors?: string;
    sensors_mapping?: string;
    battery?: number;
    net?: string;
    c_icon_base?: string;
    full_serial?: string;
    mac_address?: string;
    timezone?: string;

    triggering_rules?: UbiChannelTriggeringRule[]; // 最近触发的rules

    /*
    todo: 处理最近一次预警

    triggering_rules: [{ channel_id: "5369", rule_id: "13937", rule_type: "numeric", last_result: "true", … }]

    0: { channel_id: "5369", rule_id: "13937", rule_type: "numeric", last_result: "true", … }

    channel_id: "5369"
    rule_id: "13937"
    rule_type: "numeric"
    last_result: "true"
    last_result_time: "2019-12-26T10:06:03Z"
    */

    [key: string]: any;

    virtualFields: UbiChannelVirtualFieldLike[] = [];

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


    public mergeVirtualFieldsData(channelVirtualField: UbiChannelVirtualFieldLike): void {
        const virtualFieldCopy = Object.assign({}, channelVirtualField);
        const existed = this.virtualFields.find((vf) => {
            return vf.virtual_id == virtualFieldCopy.virtual_id;
        });


        if (existed) {
            // merge if existed
            Object.assign(existed, virtualFieldCopy);
        } else {
            this.virtualFields.push(virtualFieldCopy);
        }
    }

    /**
     * 是否有USB供电功能
     *
     * @returns {boolean}
     * @memberof UbiChannel
     */
    isUsbSupported(): boolean {
        // 无论usb的值是什么，只要有这个key就认为support
        return this.getStaus().usb !== undefined;
    }

    /**
     * 是否正在使用usb供电
     *
     * @returns {boolean}
     * @memberof UbiChannel
     */
    isUsbWorking(): boolean {
        return this.getStaus().usb === '1';
    }

    /**
     * sim入网
     *
     * @static
     * @param {string} productId
     * @returns {boolean}
     * @memberof UbiChannel
     */
    static IsSimSupported(productId: string): boolean {
        if (productId === EnumBasicProductId.WS1P
            // 不含ws1p wifi版
            || productId === EnumBasicProductId.WS1P2G
            || productId === EnumBasicProductId.WS1P4G
            // 不含gs1 wifi/eth版
            || productId === EnumBasicProductId.GS1_AL2G1RS
            || productId === EnumBasicProductId.GS1_AL4G1RS
            || productId === EnumBasicProductId.GS1_PL4G1RS
            // gs2
            || productId === EnumBasicProductId.GS2_EL2G
            || productId === EnumBasicProductId.GS2_EL4G
            // sp1
            || productId === EnumBasicProductId.SP1_4G) {
            return true;
        }
        return false;
    }

    isSimSupported() {
        return UbiChannel.IsSimSupported(this.product_id);
    }

    /**
     * sim 自动入网
     *
     * @static
     * @param {string} productId
     * @returns {boolean}
     * @memberof UbiChannel
     */
    static IsSimAutoSupported(productId: string): boolean {
        const simSupported = UbiChannel.IsSimSupported(productId);
        if (this.IsFamilySP1(productId)) {
            return false;
        };
        return simSupported;
        // return false;
    }

    /**
     *
     * 是否支持震动传感
     *
     * @static
     * @param {string} productId
     * @returns {boolean}
     * @memberof UbiChannel
     */
    static IsAccSupported(productId: string): boolean {
        if (UbiChannel.IsFamilyWS1(productId)) {
            return true;
        }
        return false;
    }

    isAccSupported() {
        return UbiChannel.IsAccSupported(this.product_id);
    }

    static IsEthSupported(productId: string): boolean {
        if (productId === EnumBasicProductId.GS1_AETH1RS
            || productId === EnumBasicProductId.MS1
            || productId === EnumBasicProductId.MS1P) {
            return true;
        }
        return false;
    }

    isEthSupported() {
        return UbiChannel.IsEthSupported(this.product_id);
    }

    /**
     * wifi入网
     *
     * @static
     * @param {string} productId
     * @returns {boolean}
     * @memberof UbiChannel
     */
    static IsWifiSupported(productId: string): boolean {
        // return productId !== EnumBasicProductId.SP1;
        return true;
    }

    /**
     * 判断是否为urban的产品
     *
     * 不放在channel类的原因是可能有扫码时就需要判断，这时候就需要直接调用utils
     *
     * @static
     * @param {string} productId
     * @returns {boolean}
     * @memberof UbiChannel
     */
    static IsFamilyUrban(productId: string): boolean {
        try {
            let uniformed = productId.toLowerCase();
            if (/^intlite-/.test(uniformed)) {
                return true;
            }
        } catch (e) { }

        return false;
    }

    isFamilyUrban(): boolean {
        return UbiChannel.IsFamilyUrban(this.product_id);
    }

    /**
     * 凡是ubibot-开头的都返回true
     *
     * @static
     * @param {string} productId
     * @returns {boolean}
     * @memberof UbiChannel
     */
    static IsFamilyUbibot(productId: string): boolean {
        try {
            let uniformed = productId.toLowerCase();
            if (/^ubibot-/.test(uniformed)) {
                return true;
            }
        } catch (e) { }

        return false;
    }

    isFamilyUbibot(): boolean {
        return UbiChannel.IsFamilyUbibot(this.product_id);
    }

    isWifiSupported() {
        return UbiChannel.IsWifiSupported(this.product_id);
    }

    /**
     * 判断是否为ws1系列（包括cn结尾）
     *
     * @static
     * @param {string} productId
     * @returns {boolean}
     * @memberof UbiChannel
     */
    static IsFamilyWS1(productId: string): boolean {
        if (productId === EnumBasicProductId.WS1 || productId === EnumBasicProductId.WS1_CN) {
            return true;
        }
        return false;
    }

    isFamilyWS1(): boolean {
        return UbiChannel.IsFamilyWS1(this.product_id);
    }


    /**
     * 判断是否为ws1p系列
     *
     * @static
     * @param {string} productId
     * @returns {boolean}
     * @memberof UbiChannel
     */
    static IsFamilyWS1P(productId: string): boolean {
        if (productId === EnumBasicProductId.WS1P ||
            productId === EnumBasicProductId.WS1PA ||
            productId === EnumBasicProductId.WS1P2G ||
            productId === EnumBasicProductId.WS1P4G) {
            return true;
        }
        return false;
    }

    isFamilyWS1P(): boolean {
        return UbiChannel.IsFamilyWS1P(this.product_id);
    }


    /**
     * 判断是否为gs1系列
     *
     * @static
     * @param {string} productId
     * @returns {boolean}
     * @memberof UbiChannel
     */
    static IsFamilyGS1(productId: string): boolean {
        if (productId === EnumBasicProductId.GS1_A ||
            productId === EnumBasicProductId.GS1_AETH1RS ||
            productId === EnumBasicProductId.GS1_AL2G1RS ||
            productId === EnumBasicProductId.GS1_AL4G1RS ||
            productId === EnumBasicProductId.GS1_PL4G1RS) {
            return true;
        }
        return false;
    }

    isFamilyGS1(): boolean {
        return UbiChannel.IsFamilyGS1(this.product_id);
    }

    /**
     * 判断是否为gs2系列
     *
     * @static
     * @param {string} productId
     * @returns {boolean}
     * @memberof UbiChannel
     */
    static IsFamilyGS2(productId: string): boolean {
        if (productId === EnumBasicProductId.GS2_EL ||
            productId === EnumBasicProductId.GS2_EL2G ||
            productId === EnumBasicProductId.GS2_EL4G) {
            return true;
        }
        return false;
    }

    isFamilyGS2(): boolean {
        return UbiChannel.IsFamilyGS2(this.product_id);
    }


    /**
     * 判断是否为sp1系列
     *
     * @static
     * @param {string} productId
     * @returns {boolean}
     * @memberof UbiChannel
     */
    static IsFamilySP1(productId: string): boolean {
        if (productId === EnumBasicProductId.SP1
            || productId === EnumBasicProductId.SP1_4G) {
            return true;
        }
        return false;
    }

    isFamilySP1(): boolean {
        return UbiChannel.IsFamilySP1(this.product_id);
    }

    /**
     * ubibot人感ms1
     *
     * @static
     * @param {string} productId
     * @returns {boolean}
     * @memberof UbiChannel
     */
    static IsFamilyMS1(productId: string): boolean {
        if (productId === EnumBasicProductId.MS1) {
            return true;
        }
        return false;
    }

    isFamilyMS1(): boolean {
        return UbiChannel.IsFamilyMS1(this.product_id);
    }

    /**
     * ubibot人感ms1p
     *
     * @static
     * @param {string} productId
     * @returns {boolean}
     * @memberof UbiChannel
     */
    static IsFamilyMS1P(productId: string): boolean {
        if (productId === EnumBasicProductId.MS1P) {
            return true;
        }
        return false;
    }

    isFamilyMS1P(): boolean {
        return UbiChannel.IsFamilyMS1P(this.product_id);
    }

    /**
     * 目前除ws1p外的能支持rs的型号都应该能自动检测
     *
     * 2019-11-05 取消gs1系列的auto
     * http://jira.cloudforce.cn:9000/browse/UBIAPP2-15
     *
     * @returns
     * @memberof UbiChannel
     */
    isRS485AutoDetectSupported() {
        return false;
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
     * 根据triggering_rules判断是否正在触发预警
     *
     * @returns {boolean}
     * @memberof UbiChannel
     */
    isTriggeringRule(): boolean {
        const triggeringRules = this.triggering_rules;
        if (triggeringRules && triggeringRules.length) {
            for (let i = 0; i < triggeringRules.length; i++) {
                const trigerringRule = triggeringRules[i];
                if (trigerringRule.last_result == 'true') {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 是否支持设备报警
     *
     * @returns {boolean}
     * @memberof UbiChannel
     */
    isSupportRuleCommand(): boolean {
        return this.isFamilyWS1P() || this.isFamilyGS1();
    }

    /**
     * 根据user_id判断是否为此channel的owner
     *
     * @param {string} user_id
     * @returns {boolean}
     * @memberof UbiChannel
     */
    isOwnerOf(user_id: string): boolean {
        return this.user_id === user_id;
    }

}


/**
 * 分享API返回的形式
 *
 * @export
 * @class UbiSharedChannel
 * @extends {UbiChannel}
 */
export class UbiSharedChannel extends UbiChannel {
    share_from: string;
    share_id: string;
    share_to: string;

    // Ths following paramsters are of account shared to, NOT owner.
    username: string;
    email: string;
    email_status: string;
    mobile: string;
    mobile_status: string;
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

    private onChanged$: Subject<UbiChannelDAO> = new Subject();

    private vconfigParsed: UbiChannelVConfig;

    private vprefParsed: UbiChannelVPref;

    private sensorsParsed: UbiSensorsMapping;

    private sensorsMappingParsed: UbiSensorsMapping;

    private caliParsed: UbiChannelCalibrate;

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

                const fieldDAO = new UbiChannelFieldValueDAO(channel, fieldDef, fieldValue, oldFieldValue);
                this.extra.fieldDAOs[field.key] = fieldDAO;
            }
        });

        // 构建vconfigParsed
        const vconfig: UbiChannelVConfig = UbiChannelVConfig.FromString(this.vconfig);
        this.vconfigParsed = vconfig;

        // 构建vprefParsed
        const vpref: UbiChannelVPref = UbiChannelVPref.FromString(this.vpref);
        this.vprefParsed = vpref;

        // 构建sensors
        const sensors: UbiSensorsMapping = new UbiSensorsMapping(this.sensors);
        // const sensors: UbiSensorsMapping = new UbiSensorsMapping(''); // debug
        this.sensorsParsed = sensors;

        // 构建sensors mapping
        const sensorsMapping: UbiSensorsMapping = new UbiSensorsMapping(this.sensors_mapping);
        // const sensorsMapping: UbiSensorsMapping = new UbiSensorsMapping(''); // debug
        this.sensorsMappingParsed = sensorsMapping;

        // 构建caliParsed
        const cali: UbiChannelCalibrate = UbiChannelCalibrate.FromString(this.cali);
        this.caliParsed = cali;

        this.onChanged$.next(this);
    }

    onChanged() {
        return this.onChanged$;
    }

    getFields(): UbiChannelFields<UbiChannelFieldDef> {
        return this.extra.fields;
    }

    private __extractFields(): UbiChannelFields<UbiChannelFieldDef> {
        return UbiChannelFields.ConvertFromChannel(this);
    }

    /**
     * 返回一个稳定的vconfig parsed
     *
     * @returns {UbiChannelVConfig}
     * @memberof UbiChannelDAO
     */
    getParsedVConfig(): UbiChannelVConfig {
        return this.vconfigParsed;
    }

    getParsedVPref(): UbiChannelVPref {
        return this.vprefParsed;
    }

    getParsedSensors(): UbiSensorsMapping {
        return this.sensorsParsed;
    }

    getParsedSensorsMapping(): UbiSensorsMapping {
        return this.sensorsMappingParsed;
    }

    getParsedCali(): UbiChannelCalibrate {
        return this.caliParsed;
    }

    getUserPreferredFields(): UbiChannelVPrefFieldProperties[] {
        const vpref = this.getParsedVPref();
        return vpref.fields;
    }

    setUserPreferredFields(newPreferredFields: UbiChannelVPrefFieldProperties[]): void {
        const vpref = this.getParsedVPref();
        vpref.fields = newPreferredFields;
    }

    isSensorsSyncFinished(): boolean {
        let expectedSensors = this.getParsedSensorsMapping();
        let currentSensors = this.getParsedSensors();
        return _.isEqual(currentSensors, expectedSensors);
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
     * 返回一个不稳定的metadata
     *
     * @returns {UbiChannelMetadata}
     * @memberof UbiChannelDAO
     */
    getParsedMetadata(): UbiChannelMetadata {
        return this.__extractMetadata();
    }

    private __extractMetadata(): UbiChannelMetadata {
        // eg.
        // "{"fn_th":300,"fn_light":300,"fn_ext_t":300,"fn_battery":10800,"fn_485_th":0,"fn_485_sth":0,"fn_dp":900,"net_mode":0,"no_net_fn":1,"cg_data_led":1}"
        try {
            const raw = JSON.parse(this.metadata);
            const metadata = new UbiChannelMetadata(raw);
            return metadata;
        } catch (e) {
            console.warn(e);
        }
        return new UbiChannelMetadata({});
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
     * 所属的channel
     *
     * @private
     * @type {UbiChannel}
     * @memberof UbiChannelFieldValueDAO
     */
    private channel: UbiChannel;

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
        channel: UbiChannel,
        fieldDef: UbiChannelFieldDef,
        valueItem: UbiChannelLastValuesItem,
        oldValueItem: UbiChannelLastValuesItem,
    ) {
        this.channel = channel;
        this.fieldDef = fieldDef;
        this.valueItem = valueItem;
        this.oldValueItem = oldValueItem;
    }

    /**
     * 获取该field的值，可以传入tempscale参数自动将温度field变换为相应温标下的值
     * 不传入tempscale时为系统标准值
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

    getValueItem(): UbiChannelLastValuesItem {
        return Object.assign({}, this.valueItem);
    }

    getChannel(): UbiChannel {
        return this.channel;
    }

    getOldValue(opts?: UbiValueOptions): number {
        let ret = this.oldValueItem && this.oldValueItem.value;
        if (ret != null) {
            ret = ConvertValue(ret, this.fieldDef, opts);
        }
        return ret;
    }

    setOldValueItem(oldValueItem: UbiChannelLastValuesItem): void {
        this.oldValueItem = Object.assign({}, oldValueItem);
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

    clone(): UbiChannelFieldValueDAO {
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
 * @param {UbiChannelFieldDef} fieldDef 若null则返回原值
 * @param {UbiValueOptions} [opts] 用户偏好的选项，一般从UbiUserPrefference获得
 * @returns {number}
 */
export function ConvertValue(value: number, fieldDef: UbiChannelFieldDef, opts: UbiValueOptions = {}): number {
    if (fieldDef == null) {
        return value;
    }

    // 仅当为温度时，且偏好非celsius则转换值
    if (!UseCelsius(opts.tempScale) && value != null && (
        fieldDef.scaleType === UbiChannelFieldDefScaleType.TEMPERATURE ||
        fieldDef.scaleType === UbiChannelFieldDefScaleType.ABSOLUTE_TEMPERATURE ||
        fieldDef.scaleType === UbiChannelFieldDefScaleType.RS485_EXT_TEMPERATURE ||
        fieldDef.scaleType === UbiChannelFieldDefScaleType.DS18B20_EXT_TEMPERATURE ||
        fieldDef.scaleType === UbiChannelFieldDefScaleType.RS485_PROBE_TEMPERATURE ||
        fieldDef.scaleType === UbiChannelFieldDefScaleType.RS485_CO2_PROBE_TEMPERATURE
    )) {
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
 * @param {UbiChannelFieldDef} fieldDef 若null则返回原值
 * @param {UbiValueOptions} [opts={}]
 * @returns {number}
 */
export function ConvertValueReverse(value: number, fieldDef: UbiChannelFieldDef, opts: UbiValueOptions = {}): number {
    if (fieldDef == null) {
        return value;
    }

    // 仅当为温度时，且偏好非celsius则转换值
    if (!UseCelsius(opts.tempScale) && value != null && (
        fieldDef.scaleType === UbiChannelFieldDefScaleType.TEMPERATURE ||
        fieldDef.scaleType === UbiChannelFieldDefScaleType.ABSOLUTE_TEMPERATURE ||
        fieldDef.scaleType === UbiChannelFieldDefScaleType.RS485_EXT_TEMPERATURE ||
        fieldDef.scaleType === UbiChannelFieldDefScaleType.DS18B20_EXT_TEMPERATURE ||
        fieldDef.scaleType === UbiChannelFieldDefScaleType.RS485_PROBE_TEMPERATURE ||
        fieldDef.scaleType === UbiChannelFieldDefScaleType.RS485_CO2_PROBE_TEMPERATURE
    )) {
        value = (value - 32) * 5 / 9;
        value = parseFloat(value.toFixed(5));
    }
    return value;
}
