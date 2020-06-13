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

export class UbiSensorsMapping {
    private sensors: { [sensorKey: string]: number };

    constructor(raw: any) {
        this.sensors = Object.assign({}, raw);
    }

    getFieldIndexBySensorKey(sensorKey: EnumSensorKey): number {
        return this.sensors[sensorKey];
    }

    getSensorKeyByFieldIndex(fieldIndex: number): EnumSensorKey {
        let sensorKeys = Object.keys(this.sensors);
        let foundKey = sensorKeys.find(k => this.sensors[k] == fieldIndex);
        return foundKey == null ? null : foundKey as EnumSensorKey;
    }
}
