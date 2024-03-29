import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { DecimalPlaceType } from '../entities/ubi-channel-field-view-option.entity';
import { AppConfig } from '../../../environments/environment';

@Injectable()
export class UbibotCommonConfigService {

    public Private = AppConfig.Private == true;
    public DeployAgent = `${AppConfig.DeployAgent}`; // cn,io,putfarm
    public NoSVGLogoAnimation = false;

    public EnableServiceFCM = true;

    public LogoFile = 'assets/logo.png';
    public LogoFileLogin = 'assets/images/login-logo-ubibot.png';
    public LogoFileLoading = 'assets/images/loading-ubibot.gif';

    public readonly DatabaseVersion = 1;
    public readonly DatabaseName = 'UbiDatabase';
    public EndPoint = '';
    public _EndPoint = 'https://api-cdn.ubibot.cn'; // raw to copy and convert domain
    public WebLinkAboutUs = '';
    public _WebLinkAboutUs = 'https://www.ubibot.cn/aboutus/'; // raw to copy and convert domain
    // public readonly DownloadDriverCH341SER = 'https://www.ubibot.com/setup/';
    public DownloadDriverCH341SER = 'http://www.wch.cn/downloads/file/65.html';
    public TermsLink = '';
    public _TermsLink = 'https://www.ubibot.cn/service/'; // raw to copy and convert domain

    public readonly DefaultLanguage = 'en-GB'; // 基础语言模块文件,当其它文件无法找到匹配的value时使用此文件,正常情况下不需要修改此项
    public PreferredLanguage = 'en-GB'; // en-GB, zh-CN, ja-JP

    public DefaultDateTimeFormat = 'yyyy-MM-dd HH:mm:ss';
    public DefaultTempScale = 'celsius';
    public DefaultDecimalPlace = DecimalPlaceType.DEFAULT as number;

    public DefaultLocationFormat = '1.4-4'; // ref: https://angular.io/api/common/DecimalPipe

    public DefaultItemsPerPage = 10;

    // @deprecated - this will be removed in future version
    public readonly LastLoginUsernameKey = 'last_login_username';

    public readonly ServerAccessTimeout = 60 * 1000; // http请求timeout, 在cn访问io实在需要长时间
    public readonly ExternalLibAccessTimeout = 30 * 1000; // 外部js库请求timeout，如googlemap / amap
    public readonly GeoLocateTimeout = 10 * 1000; // 定位超时

    public readonly UsbReadMaxRetry = 30; // 重试次数
    public readonly UsbReadInterval = 500; // 30 * 0.5 s,稍微频发点读取加快响应时间
    public readonly UsbReadIntervalTimeout = 60 * 60 * 1000; // 每次on data的超时限制,一般只有read data时才需要限制,
    // 当然这个值必须大于 2*read interval + UsbReadOKMinInterval
    public readonly UsbReadDelay = 100;
    public readonly UsbSendCommandTimeout = 5 * 1000;
    public readonly UsbReadOKMinInterval = 1000; // 要判断为读取结束时最后输入离现在的最少间隔
    public readonly UsbMinCRCheck = 2; // 设备的返回最少需要带有多少个换行

    public readonly UsbChallengeReadInterval = 500;
    public readonly UsbChallengeReadDelay = 1000;
    public readonly UsbChallengeSendCommandTimeout = 5 * 1000; // 扫描每台usb设备的最大时间

    public readonly UsbCommandScanNetworkReadInterval = 1 * 1000;
    public readonly UsbCommandScanNetworkReadDelay = 5 * 1000; // scan网络因为不确定的返回个数,所以延迟一段时间
    public readonly UsbCommandScanNetworkSendCommandTimeout = 10 * 1000;

    public readonly UsbCommandReadDataReadMaxRetry = 1800;
    public readonly UsbCommandReadDataReadInterval = 2 * 1000;
    public readonly UsbCommandReadDataReadDelay = 5 * 1000;
    public readonly UsbCommandReadDataSendCommandTimeout = 60 * 60 * 1000;
    public readonly UsbCommandReadDataReadIntervalTimeout = 15 * 1000; // 当然这个值必须大于 2*read interval + UsbReadOKMinInterval

    public readonly UsbCommandSetupNetworkReadInterval = 2 * 1000; // *MaxRetry的次数应该大于timeout
    public readonly UsbCommandSetupNetworkSendCommandTimeout = 45 * 1000; // setupWifi配置网络需要等待的最大时间

    public readonly UsbCommandClearDataReadInterval = 5 * 1000; // *MaxRetry的次数应该大于timeout
    public readonly UsbCommandClearDataSendCommandTimeout = 90 * 1000; // clearData需要等待的最大时间

    public readonly UsbCommandCheckSensorsReadInterval = 5 * 1000; // *MaxRetry的次数应该大于timeout
    public readonly UsbCommandCheckSensorsSendCommandTimeout = 60 * 1000; // diagnose需要等待的最大时间

    public readonly UsbLibServiceTimeout = 5 * 1000;
    public readonly UsbWaitToChallenge = 2000;

    public readonly UsbScanInterval = 1000;

    public readonly CheckOnlineInterval = 500;
    public readonly CheckDriverInterval = 5000;

    public readonly CommonLoadingDelay = 300; // 只用于ui显示loading时的延迟,showLoading本身不带,由caller方取舍

    public readonly DRIVER_FILE_PATH_DARWIN = '/Library/Extensions/usbserial.kext';

    // FIXME: process.env.PATH 会返回多个, 以后考虑怎么改进系统安装盘判断
    public readonly DRIVER_FILE_PATH_WINDOWS = 'Windows\\System32\\drivers\\CH341SER.SYS';
    public readonly DRIVER_FILE_PATH_WINDOWS_x64 = 'Windows\\System32\\drivers\\CH341S64.SYS';

    public readonly EXPORT_DEFAULT_FILE_NAME = 'ubibot-data.%T.csv';
    public readonly EXPORT_FILE_VAR_FORMAT = 'yyyy-MM-dd';

    public readonly MAX_LENGTH_NETWORK_SSID = 32;
    public readonly MAX_LENGTH_NETWORK_PASS = 63;

    public readonly MIN_URBAN_ORIENTATION = -180;
    public readonly MAX_URBAN_ORIENTATION = 180;

    // tag: 常用fields, 1-10
    public readonly UbiDataFields = [
        'field1',
        'field2',
        'field3',
        'field4',
        'field5',
        'field6',
        'field7',
        'field8',
        'field9',
        'field10'
    ];

    // tag: 用于csv headers
    public readonly UbiDataFieldsAndCreated = _.concat([
        'created_at',
    ], this.UbiDataFields);

    public readonly DeviceSerialPort = {
        'Family_WS1': {
            baudRate: 115200,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',

            encoding: 'utf-8',
        }
    };

    constructor() {
        console.log('Constructing config file...');

        this.update();
    }

    /**
     * If DeployAgent is modified, it must call update() to update config.
     *
     * @param {string} [customEndPoint] 公网时不填，私有化时填写目标host以更新endpoint相关
     * @memberof UbibotCommonConfigService
     */
    update(customEndPoint?: string) {

        // tag: 判断使用哪个server
        if (customEndPoint != null) { // 私有化
            if (/^(http|https):/.test(customEndPoint)) { // host with http/https protocol
                this.EndPoint = `${customEndPoint}`.replace(/[\/]+$/, '');
                this.WebLinkAboutUs = this._WebLinkAboutUs.replace(/\.cn/, '.com'); // 没必要处理, 以com作为默认
                this.TermsLink = this._TermsLink.replace(/\.cn/, '.com'); // 没必要处理, 以com作为默认
            } else { // host without http/https protocol, use http as default
                this.EndPoint = `http://${customEndPoint}`.replace(/[\/]+$/, '');
                // this.EndPoint = this._EndPoint.replace(/:\/\/.+\//, `://${customEndPoint}/`);//.replace(/^https:/, 'http:');
                this.WebLinkAboutUs = this._WebLinkAboutUs.replace(/\.cn/, '.com'); // 没必要处理, 以com作为默认
                this.TermsLink = this._TermsLink.replace(/\.cn/, '.com'); // 没必要处理, 以com作为默认
            }
        } else { // 公网ubibot
            let ioAgentList = [
                'io',
                'putfarm'
            ];

            if (ioAgentList.indexOf(this.DeployAgent) !== -1) { // io
                this.EndPoint = this._EndPoint.replace(/\.cn/, '.com');
                this.WebLinkAboutUs = this._WebLinkAboutUs.replace(/\.cn/, '.com');
                this.TermsLink = this._TermsLink.replace(/\.cn/, '.com');
            } else { // cn
                this.EndPoint = this._EndPoint;
                this.WebLinkAboutUs = this._WebLinkAboutUs;
                this.TermsLink = this._TermsLink;
            }

            // 目前target就两个 ubibot / iot-console
            if (AppConfig.Target == 'iot-console') {
                this.LogoFile = `assets/images/agent/iot/logo.png`;
                this.LogoFileLogin = `assets/images/agent/iot/login-logo.png`;
                this.LogoFileLoading = `assets/images/agent/iot/loading.gif`;
                this.NoSVGLogoAnimation = true;
            } else { // as 'ubibot'
                this.NoSVGLogoAnimation = false;
            }

            if (this.DeployAgent === 'cn') {
                this.PreferredLanguage = 'zh-CN';
                this.EnableServiceFCM = false;
                this.DefaultDateTimeFormat = 'yyyy-MM-dd HH:mm:ss';
                this.DefaultTempScale = 'celsius';
            } else {
                this.PreferredLanguage = 'en-GB';
                // tag: 一定要带有else，因为constructor的时候可能已经将它设置为false
                this.EnableServiceFCM = true;
                this.DefaultDateTimeFormat = 'MM/dd/yyyy HH:mm:ss';
                this.DefaultTempScale = 'fahrenheit';
            }

            if (this.DeployAgent === 'io') {
                this.PreferredLanguage = 'en-GB';
            }

            // tag: Deprecated
            if (this.DeployAgent === 'putfarm') {
                this.PreferredLanguage = 'ja-JP';
            }
        }



        // console.log('-------> ', this.DeployAgent, this.PreferredLanguage);
    }

    isPrivate() {
        return this.Private;
    }

    isServeCN() {
        return this.DeployAgent === 'cn';
    }

    isUbibotApp(): boolean {
        return AppConfig.Target == 'ubibot';
    }

    getMqttEndPoint(): string {
        if (this.isPrivate()) {
            return this.EndPoint.replace(/(https|http):\/\//, 'ws://') + ':8083/mqtt';
        } else {
            return this.EndPoint.replace(/(https|http):\/\/(api|api-cdn)\./, 'ws://mqtt.') + ':8083/mqtt';
        }
    }
}
