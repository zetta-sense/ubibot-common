import { UbiChannel, UbiChannelDAO } from "./ubi-channel.entity";

export class UbiAccessLog {

    channel: UbiChannelDAO;

    // todo: 暂时没仔细写类型，只是根据服务器返回的类型
    access_id: string;
    access_type: string;
    channel_id: string;
    created_at: string;
    size: string;
    sub_type: string;
    voltage: string;

    constructor(raw: any, channel: UbiChannel) {
        Object.assign(this, raw);
        this.channel = new UbiChannelDAO(channel);
        // Object.setPrototypeOf(this, UbiLogItemAccess.prototype);
    }

}
