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



    // urban 命令
    SetupConfig = 'SetupConfig',
    SetupConfigCalculation = 'SetupConfigCalculation',
    SetupConfigSwitch = 'SetupConfigSwitch',
}
