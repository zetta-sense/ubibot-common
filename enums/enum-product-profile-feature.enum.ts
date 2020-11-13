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

export enum EnumProductProfileFeature {
    ExMqtt = 'ex:mqtt',

    SyncTH = 'sync:th',
    SyncLight = 'sync:light',
    SyncAcc = 'sync:acc',
    SyncExt_T = 'sync:ext_t',
    SyncRS485_TH = 'sync:rs485_th',
    SyncRS485_STH = 'sync:rs485_sth',
    SyncBattery = 'sync:battery',
    SyncRS485_T = 'sync:rs485_t',
    SyncRS485_LT = 'sync:rs485_lt',
    SyncRS485_WS = 'sync:rs485_ws',
    SyncRS485_CO2 = 'sync:rs485_co2',

    SyncPH = 'sync:ph',
    SyncEC = 'sync:ec',
    SyncGPS = 'sync:gps',


    ModNoNet = 'mod:no_net',
    ModWifiMode = 'mod:wifi_mode',
    ModDataLed = 'mod:data_led',
    ModNetMode = 'mod:net_mode',

    // patch 2020-11-13
    SyncSW_E = 'sync:sw_e',
    SyncSW_PC = 'sync:sw_pc',
    SyncSW_ON = 'sync:sw_on',
    SyncSenCycle = 'sync:sen_cycle',
    SyncSenRes = 'sync:sen_res',
    SyncSenSta = 'sync:sen_sta',

    ModSen = 'mod:sen',
    ModDE_SW_S = 'mod:de_sw_s',

}
