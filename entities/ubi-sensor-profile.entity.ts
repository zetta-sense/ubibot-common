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

import { UbiSensorCategory } from "../enums/enum-sensor-category.enum";

interface UbiSensorProfileRaw {
    u: number;
    name: string;
    category: string;
}

export class UbiSensorProfile {

    private _sensorKey: string;
    get sensorKey(): string { return this._sensorKey; }

    /**
     * 对应的vconfig的u值
     *
     * @private
     * @type {number}
     * @memberof UbiSensorProfile
     */
    private _u: number;
    get u(): number { return this._u; }


    /**
     * sensor名，用于更换sensor时的显示默认值
     *
     * @private
     * @type {string}
     * @memberof UbiSensorProfile
     */
    private _name: string;
    get name(): string { return this._name; }

    private _category: UbiSensorCategory;
    get category(): UbiSensorCategory { return this._category; }

    constructor(sensorKey: string, raw: UbiSensorProfileRaw) {
        this._sensorKey = sensorKey;

        this._u = raw.u;
        this._name = raw.name;
        this._category = raw.category as UbiSensorCategory;
    }
}
