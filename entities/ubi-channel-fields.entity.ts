import { UbiChannel } from "./ubi-channel.entity";
import { UbiChannelFieldDef } from "./ubi-channel-field-def.entity";
import { UbiChannelVConfig, VConfigItemHidden } from "./ubi-channel-vconfig.entity";

/**
 * A fields collector class.
 *
 * ref: https://stackoverflow.com/a/32569711
 * ref: https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#fixed-length-tuples
 *
 * @export
 * @class UbiChannelFields
 * @extends {Array<T>}
 * @template T
 */
export class UbiChannelFields<T extends UbiChannelFieldDef> extends Array<T> {

    [indexer: number]: T;

    constructor(...params: T[]) {
        super(...params);
        Object.setPrototypeOf(this, UbiChannelFields.prototype);
    }


    /**
     * Get all enabled fields.
     *
     * Important:
     * This method will generate new array every time. DO NOT use it in binding way.
     *
     * @returns {UbiChannelFieldDef[]}
     * @memberof UbiChannelFields
     */
    getEnabledFieldDefs(): UbiChannelFieldDef[] {
        const ret = [];
        this.forEach((item) => {
            if (item.enabled) {
                ret.push(item);
            }
        });
        return ret;
    }

    getField(fieldKey: string): T {
        for (let i = 0; i < this.length; i++) {
            const field = this[i];
            if(field.key === fieldKey) {
                return field;
            }
        }
        return null;
    }

    static ConvertFromChannel(channel: UbiChannel): UbiChannelFields<UbiChannelFieldDef> {
        const ret: UbiChannelFields<UbiChannelFieldDef> = new UbiChannelFields();

        // console.log(`Converting channel ${channel.channel_id}...`);
        const vconfig: UbiChannelVConfig = UbiChannelVConfig.FromString(channel.vconfig);

        Object.keys(channel).forEach((key) => {
            if (UbiChannelFieldDef.IsFieldPrefix(key)) {
                const fieldDef: UbiChannelFieldDef = new UbiChannelFieldDef();
                fieldDef.key = key;
                fieldDef.label = channel[key];

                const configItem = vconfig[key] || {}; // 可能存在没有定义vconfig的field，如rs485
                if (!fieldDef.label || configItem.h == VConfigItemHidden.Yes) {
                    fieldDef.enabled = false;
                }

                fieldDef.scaleType = configItem.u;

                ret.push(fieldDef);
            }
        });

        return ret;
        // return <any>[{
        //     key: 'test',
        //     label: 'label',
        // }];
    }


}
