import { UbiExtraPreferenceTempScale } from "./ubi-extra-preference.entity";
import { UbiValueOptions, ConvertValue, UbiChannel, UbiChannelDAO } from "./ubi-channel.entity";

export class UbiTriggerLog {

    channel: UbiChannelDAO;

    action_frequency: string;
    channel_id: string;
    created_at: string;
    finished_at: string;
    full_log: string;
    log: string;
    rule_id: string;
    rule_name: string;
    rule_type: string;
    status: string;
    t_action_frequency: string;
    t_rule_name: string;
    t_rule_type: string;
    trigger_field: string;
    trigger_id: string;
    trigger_type: string;
    user_id: string;
    value: any; // 据观察，服务器一般返回string

    // 追加parse后的
    parsedFullLog: any;
    parsedLog: any;

    constructor(raw: any, channel: UbiChannel) {
        Object.assign(this, raw);
        this.channel = new UbiChannelDAO(channel);
        // Object.setPrototypeOf(this, UbiTriggerLog.prototype);

        this.parsedFullLog = this.getParsedFullLog();
        this.parsedLog = this.getParsedLog();
    }

    getParsedFullLog(): any {
        let ret = null;
        try {
            ret = JSON.parse(this.full_log);
        } catch (e) { }
        return ret;
    }

    getParsedLog(): any {
        let ret = null;
        try {
            ret = JSON.parse(this.log);
        } catch (e) { }
        return ret;
    }

    getValue(opts?: UbiValueOptions): number {
        let ret = this.value;

        let fieldKey: string = this.parseFieldKey(this.trigger_field);
        const fieldDef = this.channel.getFields().getField(fieldKey);

        if (ret != null && fieldDef) {
            ret = ConvertValue(ret, fieldDef, opts);
        }
        return ret;
    }

    getScaleType(): string {
        let fieldKey: string = this.parseFieldKey(this.trigger_field);
        const fieldDef = this.channel.getFields().getField(fieldKey);

        return fieldDef ? fieldDef.scaleType : null;
    }

    private parseFieldKey(input: string): string {
        let fieldKey: string = input;
        try {
            fieldKey = fieldKey.split(' ')[0]; // 一般上来说这里的trigger_field如果是field则由两部分组成，eg. field1 (温度) 或者 usb
        } catch (e) { }
        return fieldKey;
    }
}
