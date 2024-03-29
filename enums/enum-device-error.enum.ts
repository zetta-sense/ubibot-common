

/**
 * 设备返回的错误代码
 *
 * ref: http://jira.cloudforce.cn:9000/browse/UBIAPP2-43
 *
 * @export
 * @enum {number}
 */
export enum UbiDeviceErrorCode {
    // 50x
    ETH_CABLE_FAILED = '501', // 网线
    ETH_IP_FAILED = '502', // ip

    // 40x
    CELLULAR_MODULE_NO_RESPONSE = '401', // 模块无响应
    CELLULAR_SIM_CHECK_FAILED = '402', // SIM 卡检测失败
    CELLULAR_QICSGP_FAILED = '403', // QICSGP开启失败
    CELLULAR_CGATT_FAILED = '404', // CGATT 开启失败
    CELLULAR_QIACT_FAILED = '405', // QIACT 开启失败

    SEARCHING_MOBILE_NETWORK = '4100', // 正在入网

    // 30x
    ACTIVATE_FAILED = '301',

    ACTIVATE_DATA_ERROR = '302',

    WIFI_REASON_AUTH_LEAVE = '303',

    WIFI_REASON_ASSOC_EXPIRE = '304',

    WIFI_REASON_ASSOC_TOOMANY = '305',

    WIFI_REASON_NOT_AUTHED = '306',

    WIFI_REASON_NOT_ASSOCED = '307',

    WIFI_REASON_ASSOC_LEAVE = '308',

    WIFI_REASON_ASSOC_NOT_AUTHED = '309',

    WIFI_REASON_DISASSOC_PWRCAP_BAD = '310',

    WIFI_REASON_DISASSOC_SUPCHAN_BAD = '311',

    WIFI_REASON_IE_INVALID = '313',

    WIFI_REASON_MIC_FAILURE = '314',

    WIFI_REASON_4WAY_HANDSHAKE_TIMEOUT = '315',

    WIFI_REASON_GROUP_KEY_UPDATE_TIMEOUT = '316',

    WIFI_REASON_IE_IN_4WAY_DIFFERS = '317',

    WIFI_REASON_GROUP_CIPHER_INVALID = '318',

    WIFI_REASON_PAIRWISE_CIPHER_INVALID = '319',

    WIFI_REASON_AKMP_INVALID = '320',

    WIFI_REASON_UNSUPP_RSN_IE_VERSION = '321',

    WIFI_REASON_INVALID_RSN_IE_CAP = '322',

    WIFI_REASON_802_1X_AUTH_FAILED = '323',

    WIFI_REASON_CIPHER_SUITE_REJECTED = '324',

    // 20x
    WIFI_REASON_BEACON_TIMEOUT = '200',

    WIFI_REASON_NO_AP_FOUND = '201',

    WIFI_REASON_AUTH_FAIL = '202',

    WIFI_REASON_ASSOC_FAIL = '203',

    WIFI_REASON_HANDSHAKE_TIMEOUT = '204',

    WIFI_REASON_CONNECTION_FAIL = '205',

}
