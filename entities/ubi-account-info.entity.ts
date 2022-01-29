
/**
 * 只是一个interface，用于声明properties
 *
 * @export
 * @interface UbiAccountInfo
 */
export interface UbiAccountInfo {
    account_key: string;
    address: string;
    agency_id: any;
    avatar: string;
    avatar_base: string;
    backup_ip: string;
    balance: string;
    bio: string;
    city: string;
    country: string;
    created_at: string;
    current_token: string;
    developer_type: any;
    email: string;
    email_status: string; // live,pending
    ext_ids: any;
    firstname: string;
    landline: any;
    last_login_ip: string;
    last_login_time: string;
    lastname: string;
    mobile: string;
    mobile_status: string; // live,pending
    num_channels: number;
    num_devices: number;
    num_shared_to_me: number;
    num_shared_to_others: number;
    openid_wechat: string;
    public_flag: any;
    state: any;
    status: any;
    timezone: string;
    updated_at: string;
    usage: string;
    user_id: string;
    user_type: string;
    username: string;
    website: string;
}


