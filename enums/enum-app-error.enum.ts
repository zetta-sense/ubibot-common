export enum EnumAppError {
    DEVICE_COMMUNICATE_EXCEPTION = '100', // communicate error
    DEVICE_RESPONSE_PARSING_ERROR = '101', // response parsing error
    MALFORMED_JSON = '501', // malformed JSON
    FILE_NOT_EXIST = '502', // file not exist
    MALFORMED_XML = '503', // malformed XML
    WRITE_FILE_FAILED = '504', // write to file failed
    DEVICE_RETURN_ERROR = '505', // device return error
    DEVICE_RETURN_ERROR_INVAILD_WIFI = '506', // device return error - invalid wifi
    NETWORK_ERROR = '600', // network error
    INTERRUPTED_BY_USER = '801', // interrupted coz user aborted
    NO_USB_PORTS_FOUND = '903', // ERROR: No device USB ports were found
    USB_TIMEOUT = '904', // ERROR: Usb communicate timeout, 与907区别这是一种静态timeout
    USB_MAX_RETRY = '905', // ERROR: Usb max retry
    USB_LIB_SERVICE_NOT_AVAILABLE = '906', // ERROR: Usb lib hang or serial port driver not available
    USB_INTERVAL_TIMEOUT = '907', // ERROR: every on data event of read data timeout, 与904区别这是一种动态timeout,譬如接收了部分数据后长时间没有收到结束标志则会产生

    USER_CANCELED = '1000',

    SERVER_FORCED_LOGOUT = '1400',
    SERVER_ACCESS_TIMEOUT = '1480',
    USERNAME_OR_PASSWORD_ERROR = '1401',
    DEVICE_ATTACHED_BY_OTHERS = '1411',

    SERVICE_NOT_AVAILABLE = '2000', // 一般内部使用，不需要翻译
    UNKNOWN_TYPE = '2001', // 一般内部使用，不需要翻译

    EXCEED_MIN_MAX_RULE_LIMIT = '3001',

    FCM_NOT_UNUSABLE = '8908',
    FCM_NOT_SUPPORTED_BY_UBIBOT = '8909',


    // minus error means acceptable errors
    USB_NO_RECV_DATA_BUT_WOULD_WAIT_NEXT = '-500',
}
