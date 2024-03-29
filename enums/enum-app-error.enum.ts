export enum EnumAppError {
    UNDEFINED_ERROR = '-1',

    DEVICE_COMMUNICATE_EXCEPTION = '100', // communicate error
    DEVICE_RESPONSE_PARSING_ERROR = '101', // response parsing error
    AP_MODE_NETWORK_CHANGED = '102', // 移动设备与设备ap连接在中途产生了变更
    AP_MODE_NETWORK_PING_FAILED = '103', // 一般只有ios出现，就是local network permission，这个必须通过局域网的out traffic触发，（如果能联网即使是out triffic到路由器的网关也无法触发）
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
    DEVICE_RETURN_ERROR_AP_NOT_FOUND = '514',
    DEVICE_RETURN_ERROR_AP_AUTH_FAILED = '515',
    DEVICE_RETURN_ERROR_AP_CONN_FAILED = '516',
    DEVICE_RETURN_ERROR_CELLULAR_SIM_CHECK_FAILED = '517',
    DEVICE_RETURN_ERROR_ETH_CABLE_FAILED = '518',
    DEVICE_RETURN_ERROR_ETH_IP_FAILED = '519',
    DEVICE_RETURN_ERROR_SEARCHING_MOBILE_NETWORK = '520',
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
    TOO_MANY_REQUESTS = '1415', // 由于验证码发送频繁和操作频繁的errorCode/desp一样，所以共用
    INVALID_SMS_CODE = '1416', // 手机验证码
    MOBILE_EXISTED = '1417',
    INVALID_SHARE_SELF = '1418',
    DEVICE_SHARE_ID_NOT_FOUND = '1420',
    INVALID_EMAIL_CODE = '1421', // 邮箱验证码
    SOMETHING_WRONG_WITH_MOBILE = '1422',
    INVALID_PHONE_FORMAT = '1423', // 电话格式错误，目前由页面直接处理错误信息，不交由parseError处理
    INVALID_SERIAL_FORMAT = '1424',
    REQUIRE_BIND_EMAIL = '1425',
    INVALID_BETWEEN_DATE = '1426', // 通常是begin/end之间 end > begin时
    EXCEED_MAX_RECURSIVE_COUNT = '1427', // 一般用于recursive observable load data时，如连续读取feeds，每次根据之前的end作为下次的begin
    INVALID_EMPTY_DATA = '1428', // 通用空数据错误
    VFIELD_INDEX_EXCEEDS_LIMIT = '1429',
    VFIELD_PER_CHANNEL_EXCEEDS_LIMIT = '1430',

    SERVER_ACCESS_TIMEOUT = '1480',
    SERVER_DATA_SYNC_ERROR = '1481',
    RETRIEVE_USER_PREFERENCE_ERROR = '1482',
    CHANNEL_NOT_RESOLVED = '1483',
    MQTT_INIT_FAILED = '1484',
    GROUP_NOT_RESOLVED = '1485',
    RULE_NOT_RESOLVED = '1486',
    SCHEDULER_NOT_RESOLVED = '1487',
    PRODUCT_PROFILES_NOT_RESOLVED = '1488',
    SERVER_ERROR_429 = '1489', // too many requests

    SERVICE_NOT_AVAILABLE = '2000', // 一般内部使用，不需要翻译
    UNKNOWN_TYPE = '2001', // 一般内部使用，不需要翻译
    EXCEED_MAX_STACK_DEPTH = '2002',  // 一般内部使用，不需要翻译
    UNDEFINED_ACTION = '2003', // 一般内部使用，不需要翻译，一般为无法决定流的下一步
    UNDEFINED_ACTION_FLOW = '2004', // 一般为不能获取对应的操作流，通常是新的产品在未更新的app上使用时产生
    CANNOT_DETERMINE_CURRENT_STEP = '2005', // 一般内部使用，不需要翻译，一般为无法决定流的当前步
    NAVIGATION_FAILED = '2006',
    EMBED_PAGE_NOT_AVAILABLE = '2007', // iframe指定了未定义的页面
    EXTERNAL_LIB_LOAD_FAILED = '2008', // 加载外部库失败
    TIMEZONE_NOT_SUPPORTED = '2009',
    PERIODS_CONVERT_FAILED = '2010',

    EXCEED_MIN_MAX_RULE_LIMIT = '3001',
    SPECIFIED_FIELD_NOT_DEFINED_IN_DEVICE_SENSORS = '3002',

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
    BLE_MTU_FAILED = '8929', // request MTU failed
    BLE_DEVICE_EXPECTED_SERVICE_NOT_FOUND = '8931', // 该蓝牙设备未发现期望的可用服务，例如蓝牙打印机没有暴露预定的服务uuid
    BLE_DEVICE_UNKNOWN_ERROR = '8932', // ble返回未知的错误
    BLE_PRINTER_RESPONSE_TIMEOUT = '8933', // ble printer响应超时
    BLE_LEGACY_UNSUPPORT_MULTI_CMDS = '8934', // legacy协议不支持发送多于一个命令
    BLE_EMPTY_RESPONSE = '8940', // empty response
    BLE_EMPTY_REQUEST = '8941', // empty request
    BLE_CHECK_PROTOCOL_TIMEOUT = '8942', // check protocol 超时

    PARAMETER_SCHEDULER_S_REPEAT_EMPTY = '12001',

    // minus error means acceptable errors
    USB_NO_RECV_DATA_BUT_WOULD_WAIT_NEXT = '-500',
    SERVER_NO_RECV_DATA_BUT_WOULD_WAIT_NEXT = '-501',
}
