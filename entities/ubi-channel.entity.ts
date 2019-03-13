import { UbiChannelFields } from "./ubi-channel-fields.entity";
import { UbiChannelFieldDef } from "./ubi-channel-field-def.entity";

export abstract class UbiChannel {
    channel_id?:      string;
    field1?:          string;
    field2?:          string;
    field3?:          string;
    field4?:          string;
    field5?:          string;
    field6?:          string;
    field7?:          string;
    field8?:          string;
    field9?:          string;
    field10?:         string;
    latitude?:        string;
    longitude?:       string;
    name?:            string;
    public_flag?:     string;
    tags?:            any;
    url?:             string;
    metadata?:        string;
    description?:     string;
    traffic_out?:     string;
    traffic_in?:      string;
    status?:          string;
    created_at?:      string;
    updated_at?:      string;
    usage?:           string;
    last_entry_id?:   string;
    last_entry_date?: string;
    product_id?:      string;
    device_id?:       string;
    channel_icon?:    string;
    last_ip?:         string;
    attached_at?:     string;
    firmware?:        string;
    full_dump?:       string;
    activated_at?:    string;
    serial?:          string;
    full_dump_limit?: string;
    cali?:            string;
    size_out?:        string;
    size_storage?:    string;
    plan_code?:       string;
    plan_start?:      string;
    plan_end?:        string;
    bill_start?:      string;
    bill_end?:        string;
    last_values?:     string;
    vconfig?:         string;
    battery?:         number;
    net?:             string;
    c_icon_base?:     string;
    full_serial?:     string;


    [key: string]: any;
}


export class UbiChannelImpl extends UbiChannel {
    constructor(channel: UbiChannel) {
        super();

        Object.setPrototypeOf(this, UbiChannelImpl.prototype);
        Object.assign(this, channel);
    }

    getFields(): UbiChannelFields<UbiChannelFieldDef> {
        return UbiChannelFields.ConvertFromChannel(this);
    }
}
