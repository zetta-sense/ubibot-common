import { UbiChannel } from "./ubi-channel.entity";


export enum UbiSchedulerType {
    Schedule = 'schedule',
    CountDown = 'count_down',
    Loop = 'loop',
}

export enum UbiSchedulerWeekDay {
    Once = 'once',

    Monday = 1,
    Tuesday = 2,
    Wednesday = 3,
    Thursday = 4,
    Friday = 5,
    Saturday = 6,
    Sundasy = 7,
}

export enum UbiSchedulerActionAction {
    Command = 'command',
}

export enum UbiSchedulerActionSetState {
    On = 1,
    Off = 0,
}

export interface UbiSchedulerExtra {
    channel: UbiChannel;
}

export interface UbiSchedulerAction {
    action?: UbiSchedulerActionAction;
    set_state?: UbiSchedulerActionSetState;
    s_port?: string;
}

export class UbiScheduler {

    s_id: string;
    s_type: string;
    s_repeat: string;
    s_port: string;

    action_1: string; // "{"action":"command","set_state":0,"channel_id":"8383","s_port":"port1"}"
    action_1_at: string; // "0"
    action_1_exe: string; // null
    action_1_duration: string; // "15"
    action_2: string; // "{"action":"command","set_state":1,"channel_id":"8383","s_port":"port1"}"
    action_2_at: string; // "1439"
    action_2_exe: string; // null
    action_2_duration: string; // "10"
    user_id: string; // "D1E393E3-853F-40B2-94B1-A5AB66E53650"
    channel_id: string; // "8383"

    s_status: string; // "enabled"

    created_at: string; // "2020-03-25T07:14:17Z"
    updated_at: string; // "2020-04-03T02:58:57Z"
    timezone: null
    counter: string; // "0"
    counter_max: string; // "5"
    final_action: string; // "{"action":"command","set_state":1}"
    final_action_at: string; // null


    // for extra info
    // [key: string]: any;

    private extra: UbiSchedulerExtra;
    private parsedAction1: UbiSchedulerAction;
    private parsedAction2: UbiSchedulerAction;


    constructor(raw: any = {}, channel) {
        Object.setPrototypeOf(this, UbiScheduler.prototype);
        Object.assign(this, raw);

        // attach channel to rule
        this.extra = {
            channel: channel
        };

        try {
            this.parsedAction1 = JSON.parse(this.action_1);
        } catch (e) {
            this.parsedAction1 = {};
        }


        try {
            this.parsedAction2 = JSON.parse(this.action_2);
        } catch (e) {
            this.parsedAction2 = {};
        }
    }

    merge(data: any) {
        Object.assign(this, data);
    }

    getParsedAction1(): UbiSchedulerAction {
        return this.parsedAction1;
    }

    getParsedAction2(): UbiSchedulerAction {
        return this.parsedAction2;
    }

    getChannel(): UbiChannel {
        return this.extra.channel;
    }

    // isEnabled() {
    //     return this.rule_status === UbiRuleStatus.ENABLED;
    // }

    toPersistentObject(): any {
        let obj = Object.assign({}, this);
        delete obj.user_id;
        delete obj.channel_id;
        delete obj.s_id;
        delete obj.extra;
        delete obj.parsedAction1;
        delete obj.parsedAction2;

        return obj;
    }
}


