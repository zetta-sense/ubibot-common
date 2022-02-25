import { UbiEntity, UbiPersistent } from "../core/decorators/ubi-entity.decorator";
import { UbiAlexaConfig } from './ubi-alexa-config.entity';

export interface UbiChannelVPref {
    v: number; // 版本
    fields: UbiChannelVPrefFieldProperties[];
    // [key: string]: any;
    alexa: UbiAlexaConfig,
}

/**
 * 作为key的用户自定义channel列表view属性
 *
 * @export
 * @interface UbiChannelVPrefProperties
 */
export interface UbiChannelVPrefFieldProperties {
    key: string;
    index: number; // 排序，数值可以非连续，asc
    visible: boolean; // 用户自定义，默认应为true
}

export const CURRENT_VPREF_VERSION = 2;

/**
 * Field 1 ~ N with {VConfigItem}
 *
 * @export
 * @class UbiChannelVConfig
 */
@UbiEntity()
export class UbiChannelVPref {

    @UbiPersistent() v: number; // 版本
    @UbiPersistent() fields: UbiChannelVPrefFieldProperties[];
    @UbiPersistent() alexa: UbiAlexaConfig;

    static FromString(rawStr: string): UbiChannelVPref {

        let ret = new UbiChannelVPref();

        // 尝试从string转换
        try {
            const parsed = JSON.parse(rawStr);
            Object.assign(ret, parsed);

            if (!(ret.v >= CURRENT_VPREF_VERSION)) {
                // 低版本的vpref如有需要，转换为高ver
                const propList: string[] = this['props'];

                Object.keys(ret).forEach((k) => {
                    if (propList.indexOf(k) == -1) {
                        delete ret[k];
                    }
                });
            }

            if (ret.fields == null) {
                ret.fields = [];
            }
        } catch (e) {
            // console.warn('VConfig parsing error.');
        }

        ret.v = CURRENT_VPREF_VERSION;

        return ret;
    }

    toString(): string {
        // console.log(this);
        const ret = JSON.stringify(this);
        return ret;
    }

}
