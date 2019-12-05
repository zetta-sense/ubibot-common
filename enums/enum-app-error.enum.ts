export enum EnumAppError {
    UNDEFINED_ERROR = '-1',

    DEVICE_COMMUNICATE_EXCEPTION = '100', // communicate error
    DEVICE_RESPONSE_PARSING_ERROR = '101', // response parsing error
    MALFORMED_JSON = '501', // malformed JSON
    FILE_NOT_EXIST = '502', // file not exist
    MALFORMED_XML = '503', // malformed XML
    WRITE_FILE_FAILED = '504', // write to file failed
    DEVICE_RETURN_ERROR = '505', // device return error
    DEVICE_RETURN_ERROR_INVAILD_WIFI = '506', // device return error - invalid wifi
    DEVICE_NETWORK_TIMEOUT = '507', // 一般为链接设备ap后发送命令超时导致
    DEVICE_NETWORK_READ_TIMEOUT = '508',
    DEVICE_NETWORK_WRITE_TIMEOUT = '509',
    DEVICE_FIRST_CONTACT_TIMEOUT = '510',
    DEVICE_NETWORK_ECONNREFUSED = '511',
    DEVICE_RETURN_ERROR_INVALID_PASSWORD = '512',
    DEVICE_RETURN_ERROR_MALFORMED_FORMAT = '513',
    NETWORK_ERROR = '600', // network error
    GEO_LOCATE_ERROR = '601', // geo-locate error
    INTERRUPTED_BY_USER = '801', // interrupted coz user aborted
    NO_USB_PORTS_FOUND = '903', // ERROR: No device USB ports were found
    USB_TIMEOUT = '904', // ERROR: Usb communicate timeout, 与907区别这是一种静态timeout
    USB_MAX_RETRY = '905', // ERROR: Usb max retry
    USB_LIB_SERVICE_NOT_AVAILABLE = '906', // ERROR: Usb lib hang or serial port driver not available
    USB_INTERVAL_TIMEOUT = '907', // ERROR: every on data event of read data timeout, 与904区别这是一种动态timeout,譬如接收了部分数据后长时间没有收到结束标志则会产生

    USER_CANCELED = '1000',

    SERVER_FORCED_LOGOUT = '1400',

    USERNAME_OR_PASSWORD_ERROR = '1401',
    DEVICE_ATTACHED_BY_OTHERS = '1411',
    INVALID_ACTIVATION_CODE = '1412',
    USERNAME_EXISTED = '1413',
    EMAIL_EXISTED = '1414',
    SEND_SMS_CODE_COOLDOWN = '1415',
    INVALID_SMS_CODE = '1416',
    MOBILE_EXISTED = '1417',
    INVALID_SHARE_SELF = '1418',
    DEVICE_SHARE_ID_NOT_FOUND = '1420',

    SERVER_ACCESS_TIMEOUT = '1480',
    SERVER_DATA_SYNC_ERROR = '1481',
    RETRIEVE_USER_PREFERENCE_ERROR = '1482',

    SERVICE_NOT_AVAILABLE = '2000', // 一般内部使用，不需要翻译
    UNKNOWN_TYPE = '2001', // 一般内部使用，不需要翻译
    EXCEED_MAX_STACK_DEPTH = '2002',  // 一般内部使用，不需要翻译
    UNDEFINED_ACTION = '2003', // 一般内部使用，不需要翻译，一般为无法决定流的下一步
    UNDEFINED_ACTION_FLOW = '2004', // 一般为不能获取对应的操作流，通常是新的产品在未更新的app上使用时产生
    CANNOT_DETERMINE_CURRENT_STEP = '2005', // 一般内部使用，不需要翻译，一般为无法决定流的当前步
    NAVIGATION_FAILED = '2006',
    EMBED_PAGE_NOT_AVAILABLE = '2007', // iframe指定了未定义的页面
    EXTERNAL_LIB_LOAD_FAILED = '2008', // 加载外部库失败

    EXCEED_MIN_MAX_RULE_LIMIT = '3001',

    FCM_NOT_UNUSABLE = '8908',
    PUSH_SERVICE_NOT_SUPPORTED_BY_UBIBOT = '8909', // 推送服务无法绑定，通常是ubibot服务器bind接口调用失败
    LOCATION_SERVICE_NOT_AVAILABLE = '8910',
    JPUSH_NOT_UNUSABLE = '8911',
    NO_MESSAGE_PUSH_SERVICE_AVAILABLE = '8912',
    BLE_SERVICE_NOT_AVAILABLE = '8920',
    BLE_CONNECT_TIMEOUT = '8921',
    BLE_CONNECTED_BUT_NO_PERIPHERALS_FOUND = '8922',
    BLE_CONNECT_FAILED = '8923',
    BLE_SCAN_DEVICE_NOT_FOUND = '8924',
    BLE_SEND_COMMAND_TIMEOUT = '8925',
    BLE_COMMAND_UNDEFINED = '8926', // ble_command 为空
    BLE_COMMAND_UNSUPPORT = '8927', // ble_command 值不在支持的范围
    BLE_COMMAND_BAD_PARAMETERS = '8928', // ble_command 参数不足


    // minus error means acceptable errors
    USB_NO_RECV_DATA_BUT_WOULD_WAIT_NEXT = '-500',
    SERVER_NO_RECV_DATA_BUT_WOULD_WAIT_NEXT = '-501',
}
