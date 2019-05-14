import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, from, combineLatest } from 'rxjs';
import { map, switchMap, mergeAll, combineAll, concatMap, tap, zipAll, withLatestFrom, take, takeLast } from 'rxjs/operators';
import { UbiChannelDAO, UbiChannel } from '../entities/ubi-channel.entity';
import { UbiError } from '../errors/UbiError';
import { UbiRule, UbiRuleStatus } from '../entities/ubi-rule.entity';
import * as _ from 'lodash';

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
     * Get a channel.
     * 任何时候remote service都只返回实体，不返回dao，由于要保证dao的稳定单一，dao应该交由resolver或其它处理器创建
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
            })
        );
    }


    /**
     *  Clear channel
     *
     * id: CHANNEL_ID
     * account_key or token_id (string) - account_key  is User's account key; token_id  is obtained through login API (required).
     *
     * @param {string} channelId
     * @returns {Observable<any>}
     * @memberof RemoteChannelService
     */
    clear(channelId: string): Observable<any> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');

        const url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/feeds`;
        return this.http.delete(url).pipe(
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
     * @returns {Observable<any>}
     * @memberof RemoteChannelService
     */
    remove(channelId: string): Observable<any> {
        if (!channelId) throw new UbiError('Channel ID is required for this API!');

        const url = `${this.ubibotCommonConfig.EndPoint}/channels/${channelId}/device`;
        return this.http.delete(url).pipe(
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
}
