import { UbiChannel } from "./ubi-channel.entity";

export interface UbiRuleExtra {
    channel: UbiChannel;
}

export enum UbiRuleType {
    NO_DATA_CHECK = 'no_data_check',
    NUMERIC = 'numeric',
    STATUS_FIELD = 'status_field',
}

export enum UbiRuleStatus {
    ENABLED = 'enabled',
    DISABELD = 'disabled',
}

export enum UbiRuleActionFrequency {
    CHANGE_ONLY = 'change_only',
    ALWAYS = 'always',
    CHANGE_ONLY_DELAYED = 'change_only_delayed',
    ALWAYS_DELAYED = 'always_delayed',
}

export enum UbiRuleCriteria {
    EQ = "==",
    GE = ">=",
    GT = ">",
    LT = "<",
    LE = "<=",
    NE = "!=",
}

export class UbiRule {
    action_frequency?: UbiRuleActionFrequency;
    action_sub_value?: any;
    action_sub_value2?: any;
    action_sub_value3?: any;
    action_sub_value4?: any;
    action_sub_value5?: any;
    action_type?: any;
    action_type2?: any;
    action_type3?: any;
    action_type4?: any;
    action_type5?: any;
    action_value?: any;
    action_value2?: any;
    action_value3?: any;
    action_value4?: any;
    action_value5?: any;
    batch_id?: any;
    channel_id?: any;
    created_at?: any;
    criteria?: UbiRuleCriteria;
    field?: any;
    field_name?: any;
    frequency?: any;
    frequency_value?: any;
    last_result?: any;
    last_result_time?: any;
    latitude?: any;
    longitude?: any;
    r_end?: any;
    r_start?: any;
    recover_action?: any;
    rule_condition?: any;
    rule_id?: any;
    rule_name?: any;
    rule_status?: UbiRuleStatus;
    rule_type?: UbiRuleType;
    updated_at?: any;
    user_id?: any;


    // for extra info
    // [key: string]: any;

    private extra: UbiRuleExtra;


    constructor(raw: any = {}, channel) {
        Object.setPrototypeOf(this, UbiRule.prototype);
        Object.assign(this, raw);

        // attach channel to rule
        this.extra = {
            channel: channel
        };
    }

    merge(data: any) {
        Object.assign(this, data);
    }


    /**
     * 是否默认rule，默认rule只能修改/toggle，不能删除
     *
     * @returns
     * @memberof UbiRule
     */
    isDefaultRule() {
        return this.frequency === 'device_dp';
    }

    getChannel() {
        return this.extra.channel;
    }


    /**
     * 是否当前版本已定义的rule类型
     *
     * @returns
     * @memberof UbiRule
     */
    isRecognizedType() {
        switch (this.rule_type) {
            case UbiRuleType.NO_DATA_CHECK:
            case UbiRuleType.NUMERIC:
            case UbiRuleType.STATUS_FIELD:
                return true;
            default:
                return false;
        }
    }


    /**
     * 是否已激活恢复时报警
     *
     * @returns
     * @memberof UbiRule
     */
    isRecoverActionEnabled() {
        return this.recover_action === 'enabled';
    }

    isEnabled() {
        return this.rule_status === UbiRuleStatus.ENABLED;
    }
}


