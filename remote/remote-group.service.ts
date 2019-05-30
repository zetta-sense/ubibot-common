import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { UbibotCommonConfigService } from '../providers/ubibot-common-config.service';
import { Observable, of, from, combineLatest, race } from 'rxjs';
import { map, switchMap, mergeAll, combineAll, concatMap, tap, zipAll, withLatestFrom, take, takeLast } from 'rxjs/operators';
import { UbiChannelDAO, UbiChannel } from '../entities/ubi-channel.entity';
import { UbiError } from '../errors/UbiError';
import { UbiRule, UbiRuleStatus } from '../entities/ubi-rule.entity';
import * as _ from 'lodash';
import { DatePipe } from '@angular/common';
import { UbiGroup } from '../entities/ubi-group.entity';

/**
 * A client service for remote gorup service.
 *
 * @export
 * @class RemoteGroupService
 * @author gorebill
 */
@Injectable()
export class RemoteGroupService {

    constructor(
        private http: HttpClient,
        private datePipe: DatePipe,
        private ubibotCommonConfig: UbibotCommonConfigService
    ) {
    }

    /**
     * List Channel Groups 存储空间组列表
     *
     * send an HTTP GET/POST to http://api.ubibot.cn/groups/channels/list_groups
     *
     * Valid request parameters:
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     *
     * @returns {Observable<UbiGroup[]>}
     * @memberof RemoteGroupService
     */
    list(): Observable<UbiGroup[]> {
        let url = `${this.ubibotCommonConfig.EndPoint}/groups/channels/list_groups`;
        return this.http.get(url).pipe(
            map((resp: any) => resp.channel_groups)
        );
    }



    /**
     * Create Group 创建分组
     *
     * send an HTTP GET/POST to http://api.ubibot.cn/groups/channels/create_group
     *
     * Valid request parameters:
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     * JSON Body FIELDS:
     * group_name
     *
     * @param {UbiGroup} group
     * @returns {Observable<UbiGroup>}
     * @memberof RemoteGroupService
     */
    create(group: UbiGroup): Observable<UbiGroup> {
        if (!group) throw new UbiError('Group is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/groups/channels/create_group`;

        const params = {};
        params['group_name'] = group.group_name;

        return this.http.post(url, params).pipe(
            map((resp: any) => resp.group)
        );
    }


    /**
     * Update Group 更新分组
     *
     * send an HTTP GET/POST to http://api.ubibot.cn/groups/channels/update_group
     *
     * Valid request parameters:
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     * JSON Body FIELDS:
     * group_name
     *
     * @param {UbiGroup} group
     * @returns {Observable<UbiGroup>}
     * @memberof RemoteGroupService
     */
    update(group: UbiGroup): Observable<UbiGroup> {
        if (!group) throw new UbiError('Group is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/groups/channels/update_group`;

        const params = {};
        params['group_name'] = group.group_name;

        return this.http.post(url, params).pipe(
            map((resp: any) => resp.group)
        );
    }

    /**
     * Delete Channel Group 删除分组
     *
     * send an HTTP GET/POST to http://api.ubibot.cn/groups/channels/delete_group
     *
     * Valid request parameters:
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     * group_id
     *
     * @param {UbiGroup} group
     * @returns {Observable<any>}
     * @memberof RemoteGroupService
     */
    remove(group: UbiGroup): Observable<any> {
        if (!group) throw new UbiError('Group is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/groups/channels/delete_group`;

        const params = {};
        params['group_id'] = group.group_id;

        return this.http.post(url, params).pipe(
            map((resp: any) => resp)
        );
    }

    /**
     * List Group Channels 查看组中存储空间列表
     *
     * send an HTTP GET/POST to http://api.ubibot.cn/groups/channels/list_channels
     *
     * Valid request parameters:
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     * group_id
     *
     * @param {UbiGroup} group
     * @returns {Observable<UbiChannel[]>}
     * @memberof RemoteGroupService
     */
    listChannels(group: UbiGroup): Observable<UbiChannel[]> {
        if (!group) throw new UbiError('Group is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/groups/channels/list_channels`;

        const params = {};
        params['group_id'] = group.group_id;

        return this.http.get(url, { params: params }).pipe(
            map((resp: any) => resp.channels)
        );
    }


    /**
     * Add Channels To Group 将存储空间添加到分组中
     *
     * send an HTTP GET/POST to http://api.ubibot.cn/groups/channels/add_channels
     *
     * Valid request parameters:
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     * JSON Body FIELDS:
     * group_id
     * channels: 为channel_id列表，例如channels: [171,172]
     *
     * @param {UbiGroup} group
     * @param {UbiChannel} channel
     * @returns {Observable<any>}
     * @memberof RemoteGroupService
     */
    addChannel(group: UbiGroup, channel: UbiChannel): Observable<any> {
        if (!group) throw new UbiError('Group is required for this API!');
        if (!channel) throw new UbiError('Channel is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/groups/channels/list_channels`;

        const params = {};
        params['group_id'] = group.group_id;
        params['channels'] = [channel.channel_id];

        return this.http.get(url, { params: params }).pipe(
            map((resp: any) => resp)
        );
    }


    /**
     * Remove Channels From Group 将存储空间从分组中删除
     *
     * send an HTTP GET/POST to http://api.ubibot.cn/groups/channels/remove_channels
     *
     * Valid request parameters:
     * account_key or token_id (string) – account_key  or token_id for internal use, obtained through login API. (required)
     * JSON Body FIELDS:
     * group_id
     * channels: 为channel_id列表，例如channels: [171,172]
     *
     * @param {UbiGroup} group
     * @param {UbiChannel} channel
     * @returns {Observable<any>}
     * @memberof RemoteGroupService
     */
    removeChannel(group: UbiGroup, channel: UbiChannel): Observable<any> {
        if (!group) throw new UbiError('Group is required for this API!');
        if (!channel) throw new UbiError('Channel is required for this API!');

        let url = `${this.ubibotCommonConfig.EndPoint}/groups/channels/remove_channels`;

        const params = {};
        params['group_id'] = group.group_id;
        params['channels'] = [channel.channel_id];

        return this.http.get(url, { params: params }).pipe(
            map((resp: any) => resp)
        );
    }
}
