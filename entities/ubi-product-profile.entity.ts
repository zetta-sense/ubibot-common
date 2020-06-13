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

interface UbiProductProfileRaw {
    "slots-available": string[];
    "slots-alterable": string[];
    "slots-supported": string[];
    "features": string[];
    "sensors-mapping": { [key: string]: number };
    "power-constants": { [key: string]: number };
}

export class UbiProductProfile {
    private _productId: EnumBasicProductId; // 使用具体的product id，例如 ubibot-sp1-4g
    get productId(): EnumBasicProductId { return this._productId; }

    private _slotsAvailable: string[]; // 可用的fields
    get slotsAvailable(): string[] { return Object.assign([], this._slotsAvailable); }

    private _slotsAlterable: string[]; // 可修改sensor的fields
    get slotsAlterable(): string[] { return Object.assign([], this._slotsAlterable); }

    private _slotsSupported: string[]; // 可修改sensor的fields所支持的sensor
    get slotsSupported(): string[] { return Object.assign([], this._slotsSupported); }

    private _features: EnumProductProfileFeature[]; // 特性，影响可设置项
    get features(): EnumProductProfileFeature[] { return Object.assign([], this._features); }

    private _sensorsMapping: UbiSensorsMapping; // 默认sensors与field对应关系
    get sensorsMapping(): UbiSensorsMapping { return this._sensorsMapping; }

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
      "slots-supported": ["sw_s", "sw_v"],
      "sensors-mapping": {"sw_s": 1, "sw_v": 2}
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
        this._slotsSupported = Object.assign([], raw["slots-supported"]);

        this._features = Object.assign([], raw.features);

        this._sensorsMapping = new UbiSensorsMapping(raw["sensors-mapping"]);

        let powerConstantsRaw = raw["power-constants"];
        this._powerConstants = new UbiProductPowerConstant(
            powerConstantsRaw.c1,
            powerConstantsRaw.c2,
            powerConstantsRaw.c3,
            powerConstantsRaw.c4,
        );
    }

}
