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

/**
 * 耗电量常数类
 *
 * @export
 * @class UbiProductPowerConstant
 */
export class UbiProductPowerConstant {
    private _c1: number;
    get c1(): number { return this._c1; }

    private _c2: number;
    get c2(): number { return this._c2; }

    private _c3: number;
    get c3(): number { return this._c3; }

    private _c4: number;
    get c4(): number { return this._c4; }

    constructor(c1: number, c2: number, c3: number, c4: number) {
        this._c1 = c1;
        this._c2 = c2;
        this._c3 = c3;
        this._c4 = c4;
    }
}
