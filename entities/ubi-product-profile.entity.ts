// Copyright 2020 gorebill
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { UbiProductPowerConstant } from "./ubi-product-power-constant.entity";
import { EnumProductProfileFeature } from "../enums/enum-product-profile-feature.enum";
import { EnumBasicProductId } from "../enums/enum-basic-product-id.enum";
import { UbiSensorsMapping } from "./ubi-sensors-mapping.entity";
import * as _ from 'lodash';

interface UbiProductProfileRaw {
    "slots-available": string[];
    "slots-alterable": string[];
    "features": string[];
    "power-constants": { [key: string]: number };
}

export class UbiProductProfile {

    static EMPTY = (productId) => {
        return new UbiProductProfile(productId, {
            'slots-available': [],
            'slots-alterable': [],
            'features': [],
            'power-constants': {},
        });
    };

    private _productId: EnumBasicProductId; // 使用具体的product id，例如 ubibot-sp1-4g
    get productId(): EnumBasicProductId { return this._productId; }

    private _slotsAvailable: string[]; // 可用的fields
    get slotsAvailable(): string[] { return Object.assign([], this._slotsAvailable); }

    private _slotsAlterable: string[]; // 可修改sensor的fields
    get slotsAlterable(): string[] { return Object.assign([], this._slotsAlterable); }

    private _features: EnumProductProfileFeature[]; // 特性，影响可设置项
    get features(): EnumProductProfileFeature[] { return Object.assign([], this._features); }

    private _powerConstants: UbiProductPowerConstant; // 耗电量常数
    get powerConstants(): UbiProductPowerConstant { return this._powerConstants; }

    /**
     *Creates an instance of UbiProductProfile.
     * @param {UbiProductProfileRaw} raw
     *
     * raw example:
     *
     * {
      "slots-available": ["field1", "field2", "field3", "field4", "field5"],
      "slots-alterable": ["field5"],
      "features": ["noNetFn", "fnBattery"],
      "power-constants": {
        "c1": 1,
        "c2": 2,
        "c3": 3,
        "c4": 4
      }
     }
     *
     * @memberof UbiProductProfile
     */
    constructor(productId: EnumBasicProductId, raw: UbiProductProfileRaw) {
        this._productId = productId;

        this._slotsAvailable = Object.assign([], raw["slots-available"]);
        this._slotsAlterable = Object.assign([], raw["slots-alterable"]);

        this._features = Object.assign([], raw.features);

        let powerConstantsRaw = raw["power-constants"] || {};
        this._powerConstants = new UbiProductPowerConstant(
            powerConstantsRaw.c1,
            powerConstantsRaw.c2,
            powerConstantsRaw.c3,
            powerConstantsRaw.c4,
        );
    }

    /**
     * whether this slot alterable (listed in slots-alterable)
     *
     * @param {string} slotKey eg. field1, ...
     * @returns {boolean}
     * @memberof UbiProductProfile
     */
    isSlotAlterable(slotKey: string): boolean {
        if (this.slotsAvailable) {
            return !!this.slotsAlterable.filter(x => x == slotKey).length;
        }
        return false;
    }

    /**
     * wheter this slot available (listed in slots-available)
     *
     * @param {string} slotKey eg. field1, ...
     * @returns {boolean}
     * @memberof UbiProductProfile
     */
    isSlotAvailable(slotKey: string): boolean {
        if (this.slotsAvailable) {
            return !!this.slotsAvailable.filter(x => x == slotKey).length;
        }
        return false;
    }

    /**
     * whether this product contains specified feature
     *
     * @param {EnumProductProfileFeature} featureKey
     * @returns {boolean}
     * @memberof UbiProductProfile
     */
    hasFeature(featureKey: EnumProductProfileFeature): boolean {
        return this.features.indexOf(featureKey) >= 0;
    }

    /**
     * 是否存在 mod: 开头的feature
     *
     * @returns {boolean}
     * @memberof UbiProductProfile
     */
    existsAdvanceFeature(): boolean {
        return this.features.filter(featureKey => {
            return /^mod:.+/.test(featureKey);
        }).length > 0;
    }

    /**
     * 返回不能更改的slots
     *
     * @returns {string[]}
     * @memberof UbiProductProfile
     */
    getFixedSlots(): string[] {
        let ret = _.difference(this.slotsAvailable, this.slotsAlterable);
        return ret;
    }

}
