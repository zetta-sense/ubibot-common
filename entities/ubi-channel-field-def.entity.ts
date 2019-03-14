import { UbiChannelVConfig, VConfigItemHidden } from "./ubi-channel-vconfig.entity";

export class UbiChannelFieldDef {
    key: string; // 例如 field1
    label: string; // 名称
    enabled: boolean = true; // 此field对产品是否有效

    constructor() {

    }

    static IsFieldPrefix(fieldKey: string) {
        return /^field\d+$/i.test(fieldKey);
    }

}
