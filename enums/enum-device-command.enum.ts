export enum EnumDeviceCommand {

    ReadProduct     = 'ReadProduct',
    CheckSensors    = 'CheckSensors',
    CheckModule     = 'CheckModule',
    SetupProduct    = 'SetupProduct',
    ScanNetwork     = 'ScanWifiList',
    SetupWifi       = 'SetupWifi',
    SetupEthernet   = 'SetupEthernet',
    DeviceActivate  = 'DeviceActivate',
    SetMetadata     = 'SetMetaData',
    GetLastError    = 'GetLastError',
    ClearData       = 'ClearData',
    ReadWifi        = 'ReadWifi',
    ReadMetaData    = 'ReadMetaData',
    ReadData        = 'ReadData',

    // added for v2
    CheckProtocol = 'CheckProtocol',


    // urban 命令
    SetupConfig = 'SetupConfig',
    SetupConfigCalculation = 'SetupConfigCalculation',
    SetupConfigSwitch = 'SetupConfigSwitch',
}
