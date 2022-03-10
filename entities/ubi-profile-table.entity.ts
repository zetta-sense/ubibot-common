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

import { UbiProductProfile } from "./ubi-product-profile.entity";
import { EnumBasicProductId } from "../enums/enum-basic-product-id.enum";
import { UbiSensorProfile } from "./ubi-sensor-profile.entity";

export class UbiProfileTable {
    private payloadVersion: number;
    private mqttEndpoint: string;
    private productProfiles: { [key: string]: UbiProductProfile };
    private sensorProfiles: { [key: string]: UbiSensorProfile };

    /**
     *Creates an instance of UbiProfileTable.

     必须是resp的raw data

     * @param {*} raw
     * @memberof UbiProfileTable
     */
    constructor(raw: any) {

        this.payloadVersion = raw['payload-version'];
        this.mqttEndpoint = raw['mqtt-endpoint'];

        // init product profiles
        this.productProfiles = {};
        try {
            let productProfileKeys = Object.keys(raw['product-profiles']);
            productProfileKeys.forEach(k => {
                let productId = k as EnumBasicProductId;
                let profileRaw = raw['product-profiles'][productId];
                this.productProfiles[productId] = new UbiProductProfile(productId, profileRaw);
            });
        } catch (e) { }

        // init sensor profiles
        this.sensorProfiles = {};
        try {
            let sensorProfileKeys = Object.keys(raw['sensor-profiles']);
            sensorProfileKeys.forEach(k => {
                let sensorKey = k;
                let sensorRaw = raw['sensor-profiles'][sensorKey];
                this.sensorProfiles[sensorKey] = new UbiSensorProfile(sensorKey, sensorRaw);
            });
        } catch (e) { }
    }

    /**
     * 获取对应的product profile，如果不存在则return null
     *
     * @param {EnumBasicProductId} productId
     * @returns {UbiProductProfile}
     * @memberof UbiProfileTable
     */
    getProductProfile(productId: EnumBasicProductId): UbiProductProfile {
        return this.productProfiles[productId];
    }

    /**
     * 获取对应的sensor profile，如果不存在则return null
     *
     * @param {string} sensorKey
     * @returns {UbiSensorProfile}
     * @memberof UbiProfileTable
     */
    getSensorProfile(sensorKey: string): UbiSensorProfile {
        return this.sensorProfiles[sensorKey];
    }

    getAllSensorProfiles(): UbiSensorProfile[] {
        return Object.values(this.sensorProfiles);
    }

    getVersion(): number {
        return this.payloadVersion;
    }

    getMqttEndpoint(): string {
        return this.mqttEndpoint;
    }

}
