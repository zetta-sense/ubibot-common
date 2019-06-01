import { UbiChannel } from "./ubi-channel.entity";

export class UbiGroup {
    channels: string[]; //  channels ids
    group_id: string;
    group_name: string;
    total_channels: number;

    constructor(raw: any) {
        Object.assign(this, raw);
        Object.setPrototypeOf(this, UbiGroup.prototype);
    }
}


