export enum EnumAppConstant {
    EVENT_CONNECTED_DEVICE_CHANGED = 'ubi::connected_device_changed',
    EVENT_EXCHANGE_CHART_DATA = 'ubi::exchange_chart_data',

    EVENT_UBI_RULES_UPDATED = 'ubi::ubi_rules_updated',
    EVENT_UBI_MY_CHANNELS_UPDATED = 'ubi::ubi_my_channels_updated',
    EVENT_UBI_OTHERS_CHANNELS_UPDATED = 'ubi::ubi_others_channels_updated',
    EVENT_UBI_CHANNEL_SHARE_INFO_UPDATED = 'ubi::ubi_channel_info_updated',
    EVENT_UBI_UNREAD_MESSAGES_COUNT_UPDATED = 'ubi::ubi_unread_messages_count_updated',

    EVENT_UBI_ACTIVATE_MAP_MODE = 'ubi::ubi_activate_map_mode', // FIXME: 以后移除

    EVENT_UBI_CHANGE_LANGUAGE = 'ubi::ubi_change_language',

    EVENT_UBI_RESET_VIRTUAL_SCROLL = 'ubi::ubi_reset_virtual_scroll',

    EVENT_UBI_CHART_UPDATE_CURRENT_VALUE = 'ubi::ubi_chart_update_current_value',

    EVENT_UBI_AVATAR_UPDATED = 'ubi::ubi_avatar_updated',

    DIALOG_LOADING_SINGLETON_ID = 'ubi_dialog_loading_singleton',

    RESET_LOGIN_PAGE = 'ubi::reset_login_page',

    DIALOG_CUSTOM_LIST_VIEW_SINGLETON_ID = 'ubi_dialog_custom_list_view_singleton',

    STORAGE_APP_EXECUTED = 'ubi_app_executed',

    /**
     * 上次打印使用的字符集
     */
    STORAGE_BLE_PRINTER_LAST_CHARSET = 'ubi_ble_printer_last_charset',

    /**
     * 上次使用的打印机id
     */
    STORAGE_BLE_LAST_PRINTER = 'ubi_ble_last_printer',
}

export enum EnumAppIntroKey {
    CHANNEL_INFO = 'channel_info',
    ACCOUNT_SETTINGS = 'account_settings',
}



