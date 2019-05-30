import { UbiChannel } from "./ubi-channel.entity";

export class UbiGroup {
    channels: string[]; //  channels ids
    group_id: string;
    group_name: string;
    total_channels: number;
}


