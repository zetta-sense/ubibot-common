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

import { EnumSensorKey } from "../enums/enum-sensor-key.enum";
import * as _ from 'lodash';

/**
 * 当设备的sensors或sensors_mapping为null，则视作空obj，可以用isEmpty判断
 *
 * @export
 * @class UbiSensorsMapping
 */
export class UbiSensorsMapping {
    private sensors: { [sensorKey: string]: number };

    /**
     *Creates an instance of UbiSensorsMapping.
     * @param {(string | any)} raw 如果raw为null，为无法parse，则sensors视作空obj
     * @memberof UbiSensorsMapping
     */
    constructor(raw: string | any) {
        if (typeof raw == 'string') {
            try {
                let obj = JSON.parse(raw);
                this.sensors = Object.assign({}, obj);
            } catch (e) {
                this.sensors = {};
            }
        } else {
            this.sensors = Object.assign({}, raw);
        }
    }

    getFieldIndexBySensorKey(sensorKey: EnumSensorKey): number {
        return this.sensors[sensorKey];
    }

    getSensorKeyByFieldIndex(fieldIndex: number): EnumSensorKey {
        let sensorKeys = Object.keys(this.sensors);
        let foundKey = sensorKeys.find(k => this.sensors[k] == fieldIndex);
        return foundKey == null ? null : foundKey as EnumSensorKey;
    }

    getSensorKeyByFieldKey(fieldKey: string): EnumSensorKey {
        let fieldIndex = parseInt(fieldKey.replace(/field/ig, ''));
        let sensorKeys = Object.keys(this.sensors);
        let foundKey = sensorKeys.find(k => this.sensors[k] == fieldIndex);
        return foundKey == null ? null : foundKey as EnumSensorKey;
    }

    getAvailableSensors(): string[] {
        let sensorKeys = Object.keys(this.sensors);
        return sensorKeys;
    }

    isEmpty(): boolean {
        return _.isEmpty(this.sensors);
    }

    /**
     * 交换两个sensor key对应的field值
     *
     * @param {EnumSensorKey} sensorKey1
     * @param {EnumSensorKey} sensorKey2
     * @returns {boolean} indicate if swapping success
     * @memberof UbiSensorsMapping
     */
    swap(sensorKey1: EnumSensorKey, sensorKey2: EnumSensorKey): boolean {
        try {
            let fieldIndex1 = this.sensors[sensorKey1];
            let fieldIndex2 = this.sensors[sensorKey2];

            this.sensors[sensorKey1] = fieldIndex2;
            this.sensors[sensorKey2] = fieldIndex1;

            return true;
        } catch (e) {
            return false;
        }
    }

    clone(): UbiSensorsMapping {
        let copy = new UbiSensorsMapping(this);
        copy.sensors = Object.assign({}, this.sensors);
        // console.log('copy=', copy);
        return copy;
    }

    toJSONString(): string {
        return JSON.stringify(this.sensors);
    }
}
