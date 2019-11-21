import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, from, combineLatest, race } from 'rxjs';
import { map, switchMap, mergeAll, combineAll, concatMap, tap, zipAll, withLatestFrom, take, takeLast, share } from 'rxjs/operators';
import { UbiChannelDAO, UbiChannel } from '../entities/ubi-channel.entity';
import { UbiError } from '../errors/UbiError';
import { UbiRule, UbiRuleStatus } from '../entities/ubi-rule.entity';
import * as _ from 'lodash';
import { DatePipe } from '@angular/common';

export interface UbiCheckDeviceReponse {
    device: {
        activated_at: string;
        activated_status: '0' | '1';
        attached_at: string;
        channel_id: string;
        created_at: string;
        note: string;
        product_id: string;
        serial: string;
        updated_at: string;
    };

    result: string;
}

export interface UbiFeedsResponse {
    channel: UbiChannel,

    feeds: UbiFeedsItem[];

    start: string;
    end: string;
    timezone: string;
    is_truncated: boolean;
    num_records: number;
    results: number;
}

export interface UbiFeedsItem {
    created_at: string;

    field1?: number;
    field2?: number;
    field3?: number;
    field4?: number;
    field5?: number;
    field6?: number;
    field7?: number;
    field8?: number;
    field9?: number;
    field10?: number;
    field11?: number;
    field12?: number;
}

export enum UbiFeedType {
    Sampling = 'sampling',
    Average = 'average',
}

/**
 * A client service for remote channel service.
 *
 * @export
 * @class RemoteChannelService
 * @author gorebill
 */
@Injectable()
export class RemoteChannelService {

    constructor(
        private http: HttpClient,
        private datePipe: DatePipe,
        private ubibotCommonConfig: UbibotCommonConfigService
    ) {
    }

    /**
     * Get my channels.
     * 任何时候remote service都只返回实体，不返回dao，由于要保证dao的稳定单一，dao应该交由resolver或其它处理器创建
     *
     * @returns {Observable<UbiChannel[]>}
     * @memberof RemoteChannelService
     */
    list(): Observable<UbiChannel[]> {
        let url = `${this.ubibotCommonConfig.EndPoint}/channels`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.channels)
        );//.subscribe(resp => resp)
    }

    /**
     * View Channels Shared to Me
     *
     * To view the list of channels shared to me, send an HTTP GET to http://api.datadudu.cn/share/channels/to-me
     *
     * Valid request parameters:
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     * username (string): (optional) if username is supplied, will only list the channels shared from selected username
     * user_id (string): (optional) if user_id is supplied, will only list the channels shared from selected user_id
     * channel_id (string): (optional) if channel_id is supplied, will list the records matching such channel_id
     *
     * @returns {Observable<UbiChannel[]>}
     * @memberof RemoteChannelService
     */
    listOthersToMe(): Observable<UbiChannel[]> {
        let url = `${this.ubibotCommonConfig.EndPoint}/share/channels/to-me`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.channels)
        );//.subscribe(resp => resp)
    }

    /**
     * View Channels Shared to Others
     *
     * To view the list of channels shared to others, send an HTTP GET to http://api.datadudu.cn/share/channels/to-others
     *
     * Valid request parameters:
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     * username (string): (optional) if username is supplied, will only list the channels shared to selected username
     * user_id (string): (optional) if user_id is supplied, will only list the channels shared to selected user_id
     * channel_id (string): (optional) if channel_id is supplied, will list the records matching such channel_id
     *
     * @param {string} [channelId] optional
     * @returns {Observable<UbiChannel[]>}
     * @memberof RemoteChannelService
     */
    listMeToOthers(channelId?: string): Observable<UbiChannel[]> {
        let url = `${this.ubibotCommonConfig.EndPoint}/share/channels/to-others`;

        const params: any = {};

        if (channelId) {
            params['channel_id'] = channelId;
        }

        return this.http.get(url, { params: params }).pipe(
            map((resp: any) => resp.channels),
        );//.subscribe(resp => resp)
    }

    /**
     * Get a channel.
     *
     * @param {string} channelId
     * @returns {Observable<UbiChannel>}
     * @memberof RemoteChannelService
     */
    get(channelId: string): Observable<UbiChannel> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');

        const url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}`;
        return this.http.get(url).pipe(
            map((resp: any) => {
                return new UbiChannelDAO(resp.channel);
            }),
        );
    }


    /**
     *  Clear channel
     *
     * id: CHANNEL_ID
     * account_key or token_id (string) - account_key  is User's account key; token_id  is obtained through login API (required).
     *
     * @param {string} channelId
     * @param {string} signature Signature = sha256( [sha256(password), token, channelId].join('') )
     * @returns {Observable<any>}
     * @memberof RemoteChannelService
     */
    clear(channelId: string, signature: string): Observable<any> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');
        if (!signature) throw new UbiError('Signature is required for this API!');

        const params = {
            hash_password: signature
        };

        const url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/feeds`;
        return this.http.delete(url, { params: params }).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }


    /**
     * Delete a Channel and Associated Device (若channel和device有关联，必须用这个删除)
     *
     * To delete a channel and clear all feed data from a channel, send an HTTP DELETE to http://api.ubibot.cn/channels/ CHANNEL_ID/device, replacing CHANNEL_ID with the ID of your channel
     * Valid request parameters:
     * account_key or token_id (string) - account_key  is User's account key; token_id  is obtained through login API (required).
     *
     * @param {string} channelId
     * @param {string} signature Signature = sha256( [sha256(password), token, channelId].join('') )
     * @returns {Observable<any>}
     * @memberof RemoteChannelService
     */
    remove(channelId: string, signature: string): Observable<any> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');
        if (!signature) throw new UbiError('Signature is required for this API!');

        const params = {
            hash_password: signature
        };

        const url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/device`;
        return this.http.delete(url, { params: params }).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }

    /**
     * Remove Sharing of Channels
     *
     * To remove a list of channels shared to others, send an HTTP DELETE to http://api.datadudu.cn/share/channels
     *
     * Valid request parameters:
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     * JSON Body FIELDS:
     * <> shared_ids (array): array of share_id that wish to remove
     *
     * @param {string} channelId
     * @returns {Observable<any>}
     * @memberof RemoteChannelService
     */
    removeShare(shareId: string): Observable<any> {
        if (!shareId) throw new UbiError('Share ID is required for this API!');

        const body: any = {
            shared_ids: [shareId],
        };

        const url = `${this.ubibotCommonConfig.EndPoint}/share/channels/delete`;
        return this.http.post(url, body).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }

    /**
     * Share Channels
     *
     * To share a list of channels to someone, send an HTTP POST of JSON to http://api.datadudu.cn/share/channels.
     *
     * Valid request parameters:
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     * JSON Body FIELDS:
     * <>·channels (array): array of channel_id that for sharing
     * <>·to (string): user_id of the user that channels are shared to
     *
     * @param {string} channelId
     * @param {string} userId
     * @returns {Observable<any>}
     * @memberof RemoteChannelService
     */
    shareChannelToUser(channelId: string, userId: string): Observable<any> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');
        if (!userId) throw new UbiError('User ID is required for this API!');

        const body: any = {
            channels: [channelId],
            share_to: userId,
        };

        const url = `${this.ubibotCommonConfig.EndPoint}/share/channels`;
        return this.http.post(url, body).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }


    /**
     * 用于校验服务器最近是否收到设备数据
     *
     * @param {string} channelId
     * @returns {Observable<UbiCheckDeviceReponse>}
     * @memberof RemoteChannelService
     */
    getDeviceStatus(channelId: string): Observable<UbiCheckDeviceReponse> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');

        const url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/device_status`;
        return this.http.get(url).pipe(
            map((resp: UbiCheckDeviceReponse) => resp)
        );
    }

    /**
     * 列出该channel的所有rules并attach相应的channel到extra信息
     *
     * List Channel Rules
     *
     * To add a channel rule, send an HTTP GET to http://api.datadudu.com/channels/CHANNEL_ID/rules
     * replacing CHANNEL_ID with the ID of your channel
     *
     * Valid request parameters:
     * api_key or token_id (string) – api_key is Read or Write key for this specific channel (no key required for public channels) or token_id for internal use, obtained through login API. (required)
     *
     * @returns {Observable<UbiRule[]>}
     * @memberof RemoteChannelService
     */
    listRules(channelId: string): Observable<UbiRule[]> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/rules`;
        return combineLatest(
            this.http.get(url),
            this.get(channelId),
        ).pipe(
            switchMap(([resp, channel]: any[]) => {
                const ret = _.map(resp.rules, (raw) => {
                    return new UbiRule(raw, channel);
                });
                return of(ret);
            }),
            // 根据文档, zipAll的source必须是一个observable of observables / ..., 所以map的时候必须通过of返回
            // ref: https://github.com/ReactiveX/rxjs/issues/1677
            // zipAll<UbiRule>(),
            // tap((x) => console.log(x)),
            // mergeAll(),
        );
    }

    /**
     * View a Channel Rule
     *
     * To add a channel rule, send an HTTP GET to http://api.ubibot.cn/channels/CHANNEL_ID/rules/RULE_ID
     * replacing CHANNEL_ID with the ID of your channel, and RULE_ID with ID of the rule.
     *
     * Valid request parameters:
     * account_key or token_id (string) –account_key  or token_id for internal use, obtained through login API. (required)
     *
     * @param {string} channelId
     * @param {string} ruleId
     * @returns {Observable<UbiRule>}
     * @memberof RemoteChannelService
     */
    getRule(channelId: string, ruleId: string): Observable<UbiRule> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');
        if (!ruleId) throw new UbiError('Rule ID is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/rules/${ruleId}`;
        return combineLatest(
            this.http.get(url),
            this.get(channelId),
        ).pipe(
            map(([resp, channel]: any[]) => {
                return new UbiRule(resp.rule, channel);
            })
        );
    }


    /**
     * 创建/更新一个rule对象
     *
     * @param {string} channelId
     * @param {string} ruleId
     * @param {*} data
     * @returns {Observable<any>} 只返回raw数据，由caller自行merge
     * @memberof RemoteChannelService
     */
    saveRule(channelId: string, ruleId: string, data: any): Observable<any> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');
        if (!data) throw new UbiError('Data to persist is required!');

        if (ruleId) { // update
            /*
             * Update a Channel Rule

            To add a channel rule, send an HTTP PUT to http://api.datadudu.com/channels/CHANNEL_ID/rules/RULE_ID
            replacing CHANNEL_ID with the ID of your channel, and RULE_ID with ID of the rule.

            Valid request parameters:
            api_key or token_id (string) – api_key is Read or Write key for this specific channel (no key required for public channels) or token_id for internal use, obtained through login API. (required)
            type  (string) – choose between [numeric, string, no_data_check] (required)
            field (string) – choose between [field1, field2, field3, field4, field5, field6, field7, field8, status] (required)
            action_frequency (string)- choose between [change_only, always] (required)
            criteria (string) –
            <>ofor type is “numeric”, choose between [>,>=,<,<=,==,!=]
            <>ofor type is “string”, choose between [contains, starts_with, ends_with, equal, not_equal, equal_ignore_case]
            <>ofor type is “no_data_check”, WILL ADD LATER
            <>·condition (string) – value for the criteria
            */
            const url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/rules/${ruleId}`;
            return combineLatest(
                this.http.put(url, data),
            ).pipe(
                map((resp: any) => {
                    return resp.rule;
                })
            );
        } else { // new
            /*
             * Add a Channel Rule

            To add a channel rule, send an HTTP POST to http://api.datadudu.com/channels/CHANNEL_ID/rules
            replacing CHANNEL_ID with the ID of your channel

            Valid request parameters:
            api_key or token_id (string) – api_key is Read or Write key for this specific channel (no key required for public channels) or token_id for internal use, obtained through login API. (required)
            type  (string) – choose between [numeric, string, no_data_check] (required)
            field (string) – choose between [field1, field2, field3, field4, field5, field6, field7, field8, status] (required)
            action_frequency (string)- choose between [change_only, always] (required)
            criteria (string) –
            <>ofor type is “numeric”, choose between [>,>=,<,<=,==,!=]
            <>ofor type is “string”, choose between [contains, starts_with, ends_with, equal, not_equal, equal_ignore_case]
            <>ofor type is “no_data_check”, WILL ADD LATER
            <>·condition (string) – value for the criteria
            */
            const url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/rules`;
            return combineLatest(
                this.http.post(url, data),
            ).pipe(
                map((resp: any) => {
                    return resp.rule;
                })
            );
        }
    }

    /**
     *
     * Update a Rule Status (enable or disable rule)
     *
     * To add a channel rule, send an HTTP PUT to http://api.datadudu.cn/channels/CHANNEL_ID/rules/RULE_ID/rule_status
     * replacing CHANNEL_ID with the ID of your channel, and RULE_ID with ID of the rule.
     *
     * Valid request parameters:
     * account_key or token_id (string) –account_key  or token_id for internal use, obtained through login API. (required)
     * JSON Body FIELDS:
     *
     * rule_status(string): “enabled” or “disabled”
     *
     * @param {*} channelId
     * @param {*} ruleId
     * @returns {Observable<any>} Raw data, your should merge it into UbiRule yourself.
     * @memberof RemoteChannelService
     */
    toggleRuleStatus(channelId: string, ruleId: string, status: UbiRuleStatus): Observable<any> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');
        if (!ruleId) throw new UbiError('Rule ID is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/rules/${ruleId}/rule_status`;
        return this.http.put(url, { 'rule_status': status }).pipe(
            map((x: any) => x.rule)
        );
    }


    /**
     * Delete a Channel Rule
     *
     * To delete a channel rule, send an HTTP DELETE to http://api.datadudu.com/channels/CHANNEL_ID/rules/RULE_ID
     * replacing CHANNEL_ID with the ID of your channel, RULE_ID with the ID of the rule.
     *
     * Valid request parameters:
     * api_key or token_id (string) – api_key is Read or Write key for this specific channel (no key required for public channels) or token_id for internal use, obtained through login API. (required)
     *
     * @param {*} channelId
     * @param {*} ruleId
     * @returns {Observable<any>} null, No result
     * @memberof RemoteChannelService
     */
    deleteRule(channelId: string, ruleId: string): Observable<any> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');
        if (!ruleId) throw new UbiError('Rule ID is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/rules/${ruleId}`;
        return this.http.delete(url).pipe(
            map((x: any) => null)
        );
    }


    /**
     * Fetch feesd.
     *
     * http://api.datadudu.com/channels/CHANNEL_ID/feeds
     *
     * api_key or token_id (string) – api_key is Read or Write key for this specific channel (no key required for public channels) or token_id for internal use, obtained through login API.
     * results (integer) Number of entries to retrieve, 8000 max (optional)
     * start (datetime) Start date in format YYYY-MM-DD%20HH:NN:SS (optional)
     * end (datetime) End date in format YYYY-MM-DD%20HH:NN:SS (optional)
     * status (true/false) Include status updates in feed by setting "status=true" (optional)
     * timezone (string) Identifier from Time Zones Reference for this request (optional)
     * min (decimal) Minimum value to include in response (optional)
     * max (decimal) Maximum value to include in response (optional)
     * sum (integer or string) Get sum of this many minutes, valid values: 10, 15, 20, 30, 60, 240, 720, 1440, "daily" (optional)
     * round (integer) Round to this many decimal places (optional)
     * average (integer or string) Get average of this many minutes, valid values: 10, 15, 20, 30, 60, 240, 720, 1440, "daily" (optional)
     * callback (string) Function name to be used for JSONP cross-domain requests (optional)
     *
     * @param {string} channelId
     * @returns {Observable<UbiFeedsResponse>}
     * @memberof RemoteChannelService
     */
    fetchFeeds(channelId: string, start?: Date, end?: Date, type: UbiFeedType = UbiFeedType.Sampling): Observable<UbiFeedsResponse> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/feeds`;
        const serverExpectedDateFormat = 'yyyy-MM-dd HH:mm:ss';
        const params: any = {};

        if (start) {
            params['start'] = this.datePipe.transform(start, serverExpectedDateFormat);
        }

        if (end) {
            params['end'] = this.datePipe.transform(end, serverExpectedDateFormat);
        }

        // 临时用于解决点过多的问题
        // if (!start && !end) {
        //     params['results'] = 500;
        // }

        if (type === UbiFeedType.Average) {
            params['average'] = 60;
        }

        return combineLatest(
            this.get(channelId),
            this.http.get(url, { params: params }),
        ).pipe(
            switchMap(([channel, resp]) => {
                const ret: UbiFeedsResponse = Object.assign({}, resp) as UbiFeedsResponse;
                ret.channel = channel;

                return of(ret);
            }),
        );
    }



    /**
     *
     * id: CHANNEL_ID
     * account_key or token_id (string) - account_key  is User's account key; token_id  is obtained through login API (required).
     * description (string) - Description of the Channel (optional)
     * elevation (integer) - Elevation in meters (optional)
     * field1 (string) - Field1 name (optional)
     * field2 (string) - Field2 name (optional)
     * field3 (string) - Field3 name (optional)
     * field4 (string) - Field4 name (optional)
     * field5 (string) - Field5 name (optional)
     * field6 (string) - Field6 name (optional)
     * field7 (string) - Field7 name (optional)
     * field8 (string) - Field8 name (optional)
     * latitude (decimal) - Latitude in degrees (optional)
     * longitude (decimal) - Longitude in degrees (optional)
     * metadata (text) - Metadata for the Channel, which can include JSON, XML, or any other data (optional)
     * name (string) - Name of the Channel (optional)
     * public_flag (true/false) - Whether the Channel should be public, default false (optional)
     * tags (string) - Comma-separated list of tags (optional)
     * url (string) - Webpage URL for the Channel (optional)
     *
     * @returns {Observable<any>}
     * @memberof RemoteChannelService
     */
    update(channelId: string, payload: any): Observable<any> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}`;
        return this.http.put(url, null, { params: payload }).pipe(
            map((x: any) => x)
        );
    }

    updateLatLng(channelId: string, lat: number, lng: number): Observable<any> {
        return this.update(channelId, { latitude: lat, longitude: lng });
    }

    updateMetadata(channelId: string, metadata: any): Observable<any> {
        return this.update(channelId, { metadata: metadata });
    }

    updateChannelName(channelId: string, name: string): Observable<any> {
        return this.update(channelId, { name: name });
    }
}
