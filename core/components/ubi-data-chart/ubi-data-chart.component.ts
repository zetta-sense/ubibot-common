import { AfterContentInit, AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as _ from 'lodash';

// highcharts lib
import * as Highcharts from 'highcharts/highstock';
// import * as HighchartsThemeDarkUnica from 'highcharts/themes/dark-unica';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import HighchartsBoost from 'highcharts/modules/boost';
import HighchartsXRange from 'highcharts/modules/xrange';
import { TranslateService } from '@ngx-translate/core';
import { UbiUtilsService, _NF_ } from '../../../services/ubi-utils.service';
import { take, delay, auditTime } from 'rxjs/operators';
import { UbiFeedType } from 'src/modules/ubibot-common/remote/remote-channel.service';
import { UbiFeedsChartType } from '../../../services/base/ubi-feeds-converter.engine';
import { UbiExtraPreferenceSensorsSettings } from '../../../entities/ubi-extra-preference.entity';
import { UbiChannelFieldViewOption, DecimalPlaceType } from '../../../entities/ubi-channel-field-view-option.entity';
import { UbiBasePair } from '../../../../../app/base/ubi-base-pair.interface';
import { UbiClass, UbiSubscription } from '../../decorators/ubi-class.decorator';
import { EnumAppConstant } from '../../../enums/enum-app-constant.enum';
import { UbiDatePipe } from '../../../../../app/pipes/ubi-date.pipe';

// ref: https://github.com/highcharts/highcharts-angular#theme
NoDataToDisplay(Highcharts);
HighchartsBoost(Highcharts);
HighchartsXRange(Highcharts);


/**
 * Override the reset function, we don't need to hide the tooltips and
 * crosshairs.
 */
Highcharts.Pointer.prototype.reset = function () {
    return undefined;
};

/**
 * Highlight a point by showing tooltip, setting hover state and draw crosshair
 */
(<any>Highcharts.Point.prototype).highlight = function (event) {

    let chart: Highcharts.Chart = this.series.chart;

    event = chart.pointer.normalize(event);
    // this.onMouseOver(); // Show the hover marker
    // chart.tooltip.refresh(this); // Show the tooltip
    // chart.tooltip.update({ enabled: false });
    chart.xAxis[0].drawCrosshair(event, this); // Show the crosshair
    chart.yAxis[0].drawCrosshair(event, this); // Show the crosshair
};

// 由于highcharts的mouseover不带originalEvent，所以需要override
// ref: https://stackoverflow.com/questions/60700851/is-there-a-way-to-get-the-mouse-coordinates-with-respect-to-page-on-mouseover-of
(function (H) {
    H.wrap(
        H.Pointer.prototype,
        'getHoverData',
        <any>function (
            proceed,
            existingHoverPoint,
            existingHoverSeries,
            series,
            isDirectTouch,
            shared,
            e,
        ) {

            var result = proceed.apply(this, Array.prototype.slice.call(arguments, 1));

            if (result.hoverPoint) {
                result.hoverPoint.originalEvent = e;
            }

            return result;
        }
    );
}(Highcharts));

const MARKUP_FONT_SIZE = 14;

export interface UbiDataChartPoint {
    /**
     * 日期
     *
     * @type {*}
     * @memberof UbiDataChartPoint
     */
    x: number;

    y: any;
}

export interface UbiDataChartPointForXRange extends UbiDataChartPoint {
    x: number;
    x2: number;

    y: any;
}

/**
 * Use name to map existed serie.
 *
 * @export
 * @interface UbiDataChartSerie
 */
export interface UbiDataChartSerie {
    name: string;
    label: string;
    data: UbiDataChartPoint[];
    color?: string;
}

export type UbiDataChartValueFormatter = (value: any) => string;

type UbiHighchartsPoint = any[2];

class UbiDataChartInternalEvent {
    code: EnumAppConstant;
    param: any;

    constructor(code, param) {
        this.code = code;
        this.param = param;
    }
}

/**
 * All reference Highcharts official angular wrapper.
 * Wrap it for UbiBot usage.
 *
 * 因为Highcharts源代码太过庞大, 编辑此文件时要将右下角Highlighting level设为none, 否则容易爆webstorm
 *
 * doc
 * ref: https://github.com/highcharts/highcharts-angular
 *
 * demo
 * ref: https://github.com/highcharts/highcharts-angular/blob/master/src/app/app.component.ts
 */
@UbiClass()
@Component({
    selector: 'ubi-data-chart',
    templateUrl: './ubi-data-chart.component.html',
    styleUrls: ['./ubi-data-chart.component.scss']
})
export class UbiDataChartComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges, AfterContentInit {

    EnumSerieColors = ['#e00', '#0e0', '#00e', '#ee0', '#e0e', '#0ee', '#7e0', '#70e', '#07e', '#0e7', '#e07', '#e70'];

    currentCrosshairX: string;
    currentCrosshairY: string;

    @UbiSubscription()
    touchmove$ = new Subject<Event>();

    highcharts: typeof Highcharts = Highcharts; // required
    highchartsDateTimeLabelFormats: {} = {
        millisecond: '%H:%M:%S',//'%H:%M:%S.%L',
        second: '%H:%M:%S',
        minute: '%H:%M',
        hour: '%H:%M',
        day: '%Y-%m-%d',//'%e. %b',
        week: '%Y-%m-%d', //'%e. %b',
        month: '%Y-%m', //%b \'%y',
        year: '%Y'
    };

    highchartsOptions: Highcharts.Options = {
        boost: {
            debug: {
                timeSeriesProcessing: true,
                showSkipSummary: true,
            }
        },
        chart: {
            // type: 'line', // ngOnInit根据pack的chartType初始化此项
            animation: false,
            marginLeft: 48, // 左侧label预留足够的空间，保证各个图之间的x轴垂直对齐
            marginRight: 10,
            // events: {
            //     load: function () {
            //         let seriesGroup = (<any>this).seriesGroup;
            //         if (seriesGroup != null) {
            //             let innerRect = seriesGroup.element;

            //             ['touchmove', 'touchstart'].forEach((eventtype) => {
            //                 innerRect.addEventListener(eventtype, (e) => {
            //                     console.log(e);
            //                 });
            //             });
            //         }
            //         // console.log((<any>this).seriesGroup); // .element
            //     }
            // }
        },
        plotOptions: {
            series: {
                animation: false,
                // turboThreshold: 100,
                boostThreshold: 1,
                softThreshold: false,
                threshold: 0,
                // dataGrouping: {
                //     groupAll: true,
                //     groupPixelWidth: 10,
                // },

                point: { // tag: highcharts 动作事件
                    events: {
                        click: (e) => {
                            // console.log('e:', e);

                            // const target: Highcharts.Point = e.point;

                            // if (target.series.type == 'xrange') {
                            //     let customData = (<any>target).custom;

                            //     console.log(target, customData);
                            // }

                            // // if (target.series.type == 'xrange') {
                            // //     let originalEvent = e;

                            // //     let selfPointEvent = target.series.chart.pointer.normalize(originalEvent);
                            // //     let selfPoint = target.series.searchPoint(selfPointEvent, true);

                            // //     // (<Highcharts.Chart>target.series.chart).tooltip.refresh(selfPoint);
                            // //     (<Highcharts.Chart>target.series.chart).tooltip.update({
                            // //         enabled: true,
                            // //     });

                            // //     // highcharts的charts数组在chart dispose的时候会将其置为undefined，所以需要filter
                            // //     Highcharts.charts.filter(x => !!x).forEach((chart) => {
                            // //         let pointEvent = chart.pointer.normalize(originalEvent);
                            // //         let point = (<any>chart.series[0]).searchPoint(pointEvent, true);


                            // //         if (point && chart != target.series.chart) {
                            // //             point.highlight(pointEvent);

                            // //             // hoverTimeData.data.push(point);
                            // //         } else {
                            // //             // console.warn('Same chart. Ignored...!!!');
                            // //         }
                            // //     });
                            // // }
                        },
                        mouseOver: (e) => {
                            this.touchmove$.next(e);
                        },
                        mouseOut: function () {
                        }
                    },
                },
            },
        },
        title: {},
        subtitle: {},
        credits: {
            enabled: false
        },
        xAxis: {
            crosshair: {
                color: '#f09000',
            },
            type: 'datetime',
            gridLineWidth: 1,
            // dateTimeLabelFormats: this.highchartsDateTimeLabelFormats
        },
        time: {
            timezone: undefined,
            timezoneOffset: new Date().getTimezoneOffset(), // 先给个默认的，当timezone更新后这个offset将被覆盖
        },
        yAxis: {
            crosshair: {
                color: '#f09000',
            },
            gridLineWidth: 1,
            title: {
                text: null,// remove side label - Values
            },
            labels: {
            },
        },
        lang: {
            noData: "",
        },
        noData: {
            style: {
                fontWeight: 'bold',
                fontSize: '24px',
                color: '#444'
            }
        },
        tooltip: {
            enabled: false,
            animation: false,
            // useHTML: true,
            // xDateFormat: '%Y-%m-%d %H:%M:%S',
        },
        legend: {
            enabled: false,
        },
        series: [] // data to render
    };
    highchartsUpdateFlag = false;
    highchartsAfterInit$: Subject<Highcharts.Chart>;

    @Output('onTouchmove')
    onTouchmove = new EventEmitter<any>();

    /**
     * 要变更，必须传入新的ref
     *
     * @type {UbiDataChartSerie[]}
     * @memberof UbiDataChartComponent
     */
    @Input() data: UbiDataChartSerie[];


    /**
     * Send new ref to make effect.
     *
     * @type {string}
     * @memberof UbiDataChartComponent
     */
    @Input() title: string;

    @Input() subtitle: string;

    /**
     * Unit to append.
     *
     * @type {string}
     * @memberof UbiDataChartComponent
     */
    @Input() unit: string;


    /**
     * Feed type.
     *
     * @type {UbiFeedType}
     * @memberof UbiDataChartComponent
     */
    @Input() feedType: UbiFeedType;


    /**
     * Chart type.
     *
     * @type {UbiFeedsChartType}
     * @memberof UbiDataChartComponent
     */
    @Input() chartType: UbiFeedsChartType;

    /**
     * Paint max if not null.
     *
     * @type {UbiDataChartPoint}
     * @memberof UbiDataChartComponent
     */
    @Input() maxPoint: UbiDataChartPoint;


    /**
     * Paint min if not null.
     *
     * @type {UbiDataChartPoint}
     * @memberof UbiDataChartComponent
     */
    @Input() minPoint: UbiDataChartPoint;


    /**
     * Paint a average line.
     *
     * @type {number}
     * @memberof UbiDataChartComponent
     */
    @Input() average: number;

    @Input() dateFormat: string;

    @Input() hideMarkers: boolean;

    /**
     * Optional
     *
     * @deprecated
     *
     * @type {number}
     * @memberof UbiDataChartComponent
     */
    // @Input() decimalPlace: number;

    @Input() viewOption: UbiChannelFieldViewOption;


    @Input() valueFormatter: UbiDataChartValueFormatter;


    private customEmitter = new EventEmitter<UbiDataChartInternalEvent>(true);

    /**
     * Optional. Default to undefined.
     *
     * @type {string}
     * @memberof UbiDataChartComponent
     */
    @Input() timezone: string;

    // @Input() width = 480;
    // @Input() height = 288;

    protected chart: Highcharts.Chart;// tag: highcharts instance

    readonly containerId: string = this.ubiUtils.generateUuid();

    constructor(
        private ubiUtils: UbiUtilsService,
        private translate: TranslateService,
        private ngZone: NgZone,
        private elementRef: ElementRef,
        private ubiDatePipe: UbiDatePipe,
    ) {
        // tag: 只能放在这个阶段，不能在初始化后
        this.updateTheme();

        // update i18n for highcharts options
        this.highchartsOptions.lang.noData = this.translate.instant('APP.COMMON.NO-DATA');
        // this.chart.set

        this.highchartsAfterInit$ = new Subject<Highcharts.Chart>();
        this.highchartsAfterInit$.subscribe((chart: Highcharts.Chart) => {
            this.chart = chart;

            // tag: 为chart附加一个emitter用于其它component通过highchart触发事件
            (<any>this.chart).customEmitter = this.customEmitter;
            this.customEmitter.subscribe((e: UbiDataChartInternalEvent) => {
                // console.log('recv customEmitter event:', this.containerId);
                if (e.code == EnumAppConstant.EVENT_UBI_CHART_UPDATE_CURRENT_VALUE) {
                    this.ngZone.run(() => {
                        const point = e.param;

                        if (point != null) {
                            const x = point.x;
                            const y = point.y;

                            if (this.valueFormatter) {
                                const convertedValue = this.valueFormatter(y);
                                this.currentCrosshairY = `${convertedValue} ${this.unit}`;
                            } else {
                                this.currentCrosshairY = `${y} ${this.unit}`;
                            }

                            if (this.dateFormat) {
                                this.currentCrosshairX = this.ubiDatePipe.transform(x, 'time', null, this.timezone);
                            }
                        }
                    });
                }
            });

            this.updateData();
            this.updateExtra();
            this.updateTitle();
            this.updateTooltip();
            this.updateDateFormat();
            this.updateDecimalPlace();
            this.updateTimezone();
            // this.chart.update

        });

    }

    ngOnInit() {
        const opts: any = this.highchartsOptions;
        const _self = this;

        // tag: 尝试为highcharts extends valueFormatter，供touchmove event 使用
        try {
            opts.yAxis.labels.valueFormatter = _self.valueFormatter;
        } catch (e) {
            console.warn('Can not extends valueFormatter for Highcharts.');
        }

        // 根据不同的种类处理
        if (this.chartType == UbiFeedsChartType.XRange || this.chartType == UbiFeedsChartType.XRangeReversedColor) {
            opts.chart.type = 'xrange';

            // ref: https://api.highcharts.com/highcharts/yAxis.labels.rotation
            opts.yAxis.categories = [`${this.translate.instant('APP.COMMON.STATE')}`]; // yAxis的label
            opts.yAxis.labels.rotation = -90;

            // opts.yAxis.left = 300;

            opts.yAxis.crosshair = false;
            opts.xAxis.crosshair = false;
            // opts.xAxis.crosshair ={
            //     color: '#f09000',
            // };

        } else {
            opts.chart.type = 'line';

            opts.yAxis.labels.formatter = function () {
                // console.log(this);
                let convertedValue: any = this.value;
                if (_self.valueFormatter && typeof _self.valueFormatter === 'function') {
                    convertedValue = _self.valueFormatter(convertedValue);
                }
                return convertedValue;
            };
        }
    }

    ngAfterViewInit(): void {
        // setTimeout(() => {
        //     this.chart.reflow();
        // }, 2000);

        this.touchmove$.pipe(
            auditTime(25), // 设定一个audit阀值以减少连续移动时的cpu消耗
        ).subscribe((e) => {

            // console.log('e:', e);

            const target: any = e.target;

            // 令 xrange 不支持 touchmove
            if (target.series.type != 'xrange') {

                let originalEvent = (<any>e.target).originalEvent;

                let selfPointEvent = target.series.chart.pointer.normalize(originalEvent);
                let selfPoint = target.series.searchPoint(selfPointEvent, true);

                // (<Highcharts.Chart>target.series.chart).tooltip.refresh(selfPoint);
                // (<Highcharts.Chart>target.series.chart).tooltip.update({
                //     enabled: true,
                // });

                // let hoverTimeData: any = {
                //     time: target.x,
                //     data: [],
                // };

                // // opts.yAxis.labels.testExtend
                // try {
                //     const valueFormatter = (<Highcharts.Chart>target.series.chart).options.yAxis[0].labels.valueFormatter;

                //     let y = target.custom ? target.custom.y : target.y; // 仅xrange有custom
                //     const convertedValue = valueFormatter(y);

                //     let tmp: UbiBasePair = {
                //         key: `${convertedValue}`,
                //         label: `${target.series.name}`,
                //     };

                //     hoverTimeData.data.push(tmp);

                //     // console.log(valueFormatter);
                // } catch (e) { console.error(e); }


                // tag: highcharts的charts数组在chart dispose的时候会将其置为undefined，所以需要filter
                // ref: https://github.com/highcharts/highcharts/blob/master/ts/Core/Pointer.ts
                Highcharts.charts.filter(x => !!x).forEach((chart, index) => {

                    if (chart.series[0].type == 'xrange') {
                        // console.log('chart:', chart);
                        const foundSeg = chart.series[0].points.find(p => p.x < selfPoint.x && p.x2 >= selfPoint.x);
                        if (foundSeg) {
                            const customData = (<any>foundSeg).custom;
                            const stateY = customData.y;

                            // fixme: 暂时不处理 xrange 型

                            // console.warn('state:', stateY, foundSeg);
                        }
                    } else {
                        let pointEvent = chart.pointer.normalize(originalEvent);
                        let point = (<any>chart.series[0]).searchPoint(pointEvent, true);


                        if (point && chart != target.series.chart) {
                            point.highlight(pointEvent);

                            let customEmitter = (<any>chart).customEmitter as EventEmitter<UbiDataChartInternalEvent>;
                            if (customEmitter) {
                                const ev = new UbiDataChartInternalEvent(
                                    EnumAppConstant.EVENT_UBI_CHART_UPDATE_CURRENT_VALUE,
                                    {
                                        y: point.y,
                                        x: point.x,
                                    }
                                );

                                customEmitter.emit(ev);
                            }

                            // hoverTimeData.data.push(point);
                        } else {
                            // console.warn('Same chart. Ignored...!!!');
                        }
                    }
                });

                // 通知自己更新currentCrosshair value
                let customEmitter = (<any>target.series.chart).customEmitter as EventEmitter<UbiDataChartInternalEvent>;
                if (customEmitter) {
                    const ev = new UbiDataChartInternalEvent(
                        EnumAppConstant.EVENT_UBI_CHART_UPDATE_CURRENT_VALUE,
                        {
                            y: target.y,
                            x: target.x,
                        }
                    );
                    customEmitter.emit(ev);
                }

                // let pointEvent = this.series.chart.pointer.normalize(originalEvent);
                // let point = (<any>this.series).searchPoint(pointEvent, true);
                // this.series.chart.tooltip.update({
                //     enabled: true,
                // });
                // this.series.chart.tooltip.refresh(point);

                // this.onTouchmove.emit(hoverTimeData);
            }
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log(changes);
        if (this.chart) {
            if (changes.title || changes.unit || changes.subtitle) {
                this.updateTitle();
            }

            if (changes.data) {
                this.updateData();
            }

            if (changes.unit) {
                this.updateTooltip();
            }

            if (changes.maxPoint || changes.minPoint || changes.hideMarkers) {
                this.updateExtra();
            }

            if (changes.dateFormat) {
                this.updateDateFormat();
            }

            if (changes.decimalPlace) {
                this.updateDecimalPlace();
            }

            if (changes.timezone) {
                this.updateTimezone();
            }
        }

        // console.log('data changed', changes);
    }

    private updateTheme() {
        // HighchartsThemeDarkUnica(Highcharts);
    }

    private updateTooltip() {
        this.ngZone.onStable.pipe(take(1)).subscribe(() => {
            if (this.highchartsOptions.tooltip) {
                if (this.unit) {
                    this.highchartsOptions.tooltip.valueSuffix = ` ${this.unit}`;
                } else {
                    this.highchartsOptions.tooltip.valueSuffix = undefined;
                }
            }
        });
    }

    private updateTitle() {
        if (this.chart) {
            // tag: 避免changed after check
            this.ngZone.onStable.pipe(take(1)).subscribe(() => {
                // console.log('update title to:', this.title);
                let title = 'UbiBot';

                const feedType = this.feedType === UbiFeedType.Average ?
                    this.translate.instant('APP.COMMON.AVERAGE') : ''; // this.translate.instant('APP.COMMON.SAMPLING')

                if (this.title && this.unit) {
                    title = `${this.title} ${feedType} ${this.unit}`;
                } else if (this.title) {
                    title = `${this.title} ${feedType}`;
                }

                this.highchartsOptions.title.text = title;
                this.highchartsOptions.title.style = {
                    color: '#3880ff',
                    fontWeight: 'bold',
                };

                let subtitle = this.subtitle || undefined;
                this.highchartsOptions.subtitle.text = subtitle;
                this.highchartsOptions.subtitle.style = {
                    fontSize: '10px',
                };

                // 不能用Highcharts原生的api，会被ngx highcharts覆盖
                // this.chart.setTitle({
                //     text: this.title || ''
                // }, undefined, undefined);

                this.highchartsUpdateFlag = true;
            });
        }
    }

    private updateDecimalPlace() {
        // nothing to do currently
    }

    private updateTimezone() {
        if (this.chart) {
            this.ngZone.onStable.pipe(take(1)).subscribe(() => {
                // console.warn('update timezone', this.timezone);
                // @ts-ignore
                this.highchartsOptions.time.timezone = this.timezone;
                this.highchartsUpdateFlag = true;
            });
        }
    }

    private updateDateFormat() {
        if (this.chart) {
            this.ngZone.onStable.pipe(take(1)).subscribe(() => {

                let format = this.dateFormat;
                const segs = format.split(' '); // 0=date, 1=time

                // 先分开两段再替换，因此不用考虑大M小m类似的问题
                segs[0] = segs[0].replace(/y+/ig, '%Y');
                segs[0] = segs[0].replace(/M+/ig, '%m');
                segs[0] = segs[0].replace(/d+/ig, '%d');

                segs[1] = segs[1].replace(/H+/ig, '%H');
                segs[1] = segs[1].replace(/m+/ig, '%M');
                segs[1] = segs[1].replace(/s+/ig, '%S');

                const newFormat: {} = {
                    millisecond: segs[1],//'%H:%M:%S.%L',
                    second: segs[1],
                    minute: segs[1].replace(/:%S/ig, ''),
                    hour: segs[1].replace(/:%S/ig, ''),
                    // 一般跨度不应达到7天以上，因此不用考虑太复杂的情况
                    day: segs[0],
                    week: segs[0],
                    month: segs[0],
                    year: segs[0]
                };

                // console.log(newFormat);

                // @ts-ignore
                this.highchartsOptions.xAxis.dateTimeLabelFormats = newFormat;

                if (this.highchartsOptions.tooltip) {
                    this.highchartsOptions.tooltip.xDateFormat = segs.join(' ');
                }

                this.highchartsUpdateFlag = true;
            });
        }
    }

    private convertUbiDataToHighchartsData(rawData: UbiDataChartPoint[]): UbiHighchartsPoint[] {
        let ret: UbiHighchartsPoint[] = [];
        rawData.forEach((ubiPoint: UbiDataChartPoint) => {
            const xTime = new Date(ubiPoint.x).getTime();
            ret.push([xTime, ubiPoint.y]);
        });

        // 按时间排序asc
        ret.sort((a, b) => {
            return a[0] - b[0];
        });

        return ret;
    }

    private updateData() {
        if (this.chart && this.data) {
            // tag: 避免changed after check
            this.ngZone.onStable.pipe(
                take(1),
                // delay(5000),
            ).subscribe(() => {
                // console.log('data=', this.data);

                if (this.chartType === UbiFeedsChartType.XRange || this.chartType === UbiFeedsChartType.XRangeReversedColor) { // tag: XRange chart
                    this.updateDataForXRangeLike(this.chartType === UbiFeedsChartType.XRangeReversedColor);
                } else if (this.chartType === UbiFeedsChartType.Fusion) {
                    this.updateDataForFusionLike();
                } else { // tag: Line chart
                    this.updateDataForLineLike();
                }

                this.highchartsUpdateFlag = true;
            })
        }
    }

    private updateDataForFusionLike(): void {
        const _self = this;

        const yAxisDef: Highcharts.YAxisOptions = {
            crosshair: true,
            gridLineWidth: 1,
            title: {
                text: null,// remove side label - Values
            },
            labels: {},
        };
        this.highchartsOptions.yAxis = [];

        let tmp: Highcharts.SeriesOptionsType[] = [];

        this.data.forEach((serie: UbiDataChartSerie, si) => {
            let existedSerie: any = _.find(this.highchartsOptions.series, { name: serie.name });
            let color = this.EnumSerieColors[si % this.EnumSerieColors.length];

            if (!serie.data) {
                console.warn('Serie.data should not be null.');
            }

            let newDataPoints: UbiHighchartsPoint[] = this.convertUbiDataToHighchartsData(_.concat([], serie.data));

            if (existedSerie) {
                existedSerie.data = newDataPoints;
            } else {
                const maxPoint = _.maxBy(serie.data, (o: UbiDataChartPoint) => o.y);
                const minPoint = _.minBy(serie.data, (o: UbiDataChartPoint) => o.y);

                let yAxisOpt = Object.assign({}, yAxisDef);
                yAxisOpt = {
                    // labels: {
                    //     format: `{value} ${serie.label}`,
                    //     style: {
                    //         color: color,
                    //     }
                    // },
                    title: {
                        text: serie.label,
                        style: {
                            color: color,
                        }
                    },
                    max: maxPoint ? maxPoint.y : undefined,
                    min: minPoint ? minPoint.y : undefined,
                    visible: false,
                    // opposite: si != 0,
                };
                // yAxisOpt.title = {
                //     text: serie.label,
                //     style: {
                //         color: color,
                //     }
                // };
                // yAxisOpt.opposite = si != 0;
                (this.highchartsOptions.yAxis as Highcharts.YAxisOptions[]).push(yAxisOpt);
                // this.chart.update(Object.assign({}, this.highchartsOptions));
                console.log('adding serie:', serie);

                this.highchartsOptions.tooltip.shared = true;
                this.highchartsOptions.tooltip.borderColor = '#777';

                this.highchartsOptions.tooltip.formatter = function () {
                    // The first returned item is the header, subsequent items are the
                    // points
                    // return ['<b>' + this.x + '</b>'].concat(
                    //     this.points ?
                    //         this.points.map(function (point) {
                    //             return '<br>' + point.series.name + ': ' + point.y + 'm';
                    //         }) : []
                    // );

                    var s = '<b>' + Highcharts.dateFormat('%A, %b %e, %Y', this.x) + '</b>',
                        actTime = this.x;

                    // console.log(actTime);

                    this.points[0].series.chart.series.forEach((series, i) => {
                        // console.log(series);

                        var diff = 100 * 60 * 1000;//series.closestPointRange;
                        // var diff = (series as any).closestPointRange;
                        var delta = NaN;
                        var actPoint = null;

                        // console.log(series);
                        series.points.forEach((point, i) => {
                            // console.log(actTime - point.x);
                            let d = Math.abs(actTime - point.x);
                            if (d < diff && (isNaN(delta) || d < delta)) {
                                // console.log('found new: ', point);
                                actPoint = point;
                                delta = d;
                            }
                        });

                        if (actPoint != null) {
                            // s += `<br/>${series.name}: ` + actPoint.plotY + ' ';
                            s += `<br/>${series.name}: ` + (series as any).processedYData[actPoint.i] + ' ';
                        }
                    });

                    return s;
                };

                // console.log(newDataPoints.length);
                // @ts-ignore
                // this.chart.addSeries({
                //     // type: 'line', // line, area
                //     // fillColor: 'rgba(127,127,127,0.1)',  // When you set an explicit fillColor, the fillOpacity is not applied.
                //     id: serie.label,
                //     name: serie.label,
                //     // turboThreshold: 20,
                //     // softThreshold: true,
                //     data: newDataPoints,
                //     color: color, //serie.color || '#a1c2fc', // 连线
                //     // Instead, you should define the opacity in the fillColor with an rgba color definition.
                //     lineWidth: 1,// tag: 如果只显示点,则设为0
                //     // connectNulls: true,
                //     // marker: { // 有值的点
                //     //     fillColor: '#3880ff',
                //     //     enabled: true,
                //     //     radius: 1, // 点大小
                //     // },
                //     states: {
                //         hover: {
                //             lineWidthPlus: 0
                //         }
                //     },
                //     yAxis: 0,
                //     // yAxis: (this.highchartsOptions.yAxis as []).length - 1,
                //     tooltip: {
                //         // ref: https://api.highcharts.com/highcharts/series.line.tooltip.pointFormat
                //         pointFormatter: function () {
                //             try {
                //                 // console.log(this);
                //                 const stateLabel = this.series.name;
                //                 const yValue = this.y;
                //                 const color = this.color;

                //                 let convertedValue: any = yValue;
                //                 if (_self.valueFormatter && typeof _self.valueFormatter === 'function') {
                //                     convertedValue = _self.valueFormatter(yValue);
                //                 }

                //                 return `<span style="color:${color}">●</span> ${stateLabel}: <b>${convertedValue}</b><br/>`;
                //             } catch (e) { }
                //             return null;
                //         },
                //     },
                // }, false);

                tmp.push({
                    type: 'line', // line, area
                    // fillColor: 'rgba(127,127,127,0.1)',  // When you set an explicit fillColor, the fillOpacity is not applied.
                    id: serie.name,
                    name: serie.label,
                    // turboThreshold: 20,
                    // softThreshold: true,
                    data: newDataPoints,
                    color: color, //serie.color || '#a1c2fc', // 连线
                    // Instead, you should define the opacity in the fillColor with an rgba color definition.
                    lineWidth: 1,// tag: 如果只显示点,则设为0
                    // connectNulls: true,
                    // marker: { // 有值的点
                    //     fillColor: '#3880ff',
                    //     enabled: true,
                    //     radius: 1, // 点大小
                    // },
                    states: {
                        hover: {
                            lineWidthPlus: 0
                        }
                    },
                    yAxis: si,
                    // yAxis: (this.highchartsOptions.yAxis as []).length - 1,
                    tooltip: {
                        // // ref: https://api.highcharts.com/highcharts/series.line.tooltip.pointFormat
                        pointFormatter: function () {
                            try {
                                // console.log(this);
                                const stateLabel = this.series.name;
                                const yValue = this.y;
                                const color = this.color;

                                let convertedValue: any = yValue;
                                if (_self.valueFormatter && typeof _self.valueFormatter === 'function') {
                                    convertedValue = _self.valueFormatter(yValue);
                                }

                                return `<span style="color:${color}">●</span> ${stateLabel}: <b>${convertedValue}</b><br/>`;
                            } catch (e) { }
                            return null;
                        },
                    },
                });
            }
        });

        let newOpts = Object.assign({}, this.highchartsOptions);
        newOpts.series = tmp;
        // console.log(newOpts);
        this.chart.update(newOpts, false, true);
    }

    /**
     * 用于开关/人感状态的画图xrange/xrange2
     *
     * @private
     * @param {boolean} [reverseColor=false]
     * @memberof UbiDataChartComponent
     */
    private updateDataForXRangeLike(reverseColor: boolean = false): void {
        const _self = this;
        this.chart.series.forEach((s) => s.remove());

        this.data.forEach((serie: UbiDataChartSerie) => {
            let newDataPoints: UbiDataChartPointForXRange[] = serie.data as UbiDataChartPointForXRange[];

            let segmentData: any = {
                name: this.translate.instant('APP.COMMON.STATE'),
                borderColor: '#aaa',
                borderWidth: 1,
                borderRadius: 3,
                // linecap: 'square',
                step: 'center',
                tooltip: {
                    // enabled: true,
                    // ref: https://api.highcharts.com/highcharts/series.xrange.tooltip.pointFormatter
                    // ref: https://api.highcharts.com/class-reference/Highcharts
                    pointFormatter: function () {
                        try {
                            // console.log(this);
                            const stateLabel = this.series.name;
                            const yValue = (<any>this).custom.y;
                            const color = this.color;

                            let convertedValue: any = yValue;
                            if (_self.valueFormatter && typeof _self.valueFormatter === 'function') {
                                // console.log(yValue, _self.valueFormatter);
                                convertedValue = _self.valueFormatter(yValue);
                            }

                            return `<span style="color:${color}">●</span> ${stateLabel}: <b>${convertedValue}</b><br/>`;
                        } catch (e) { }
                        return null;
                    },
                },
                data: [],
                // events: {
                //     click: function (e) {
                //         console.log(e);
                //     }
                // }
            };

            // console.warn('newDataPoints:', newDataPoints);

            // newDataPoints = newDataPoints.splice(0, 20); // fixme: for debug, remove later

            // 数据分段
            for (let i = 0; i < newDataPoints.length; i++) {
                const segment: UbiDataChartPointForXRange = newDataPoints[i];
                const yValue = segment.y;

                // (this.highchartsOptions.yAxis as any).max = this.maxPoint.y + Math.abs((diff * upperLowerBoundScale || 1));

                const VALUE_FOR_GREEN = reverseColor ? 0 : 1;

                if (yValue != null) {
                    const segmentForHighchart = {
                        x: segment.x,
                        x2: segment.x2,
                        y: 0,
                        custom: segment, // 用custom保留segment数据供formatter使用
                        color: yValue == VALUE_FOR_GREEN ? 'rgba(170, 253, 179, 0.6)' : 'rgba(253, 192, 194, 0.6)', // 开/关, #ddfddb
                    };

                    segmentData.data.push(segmentForHighchart);
                }

                if (i == 0) {
                    (this.highchartsOptions.xAxis as any).min = segment.x;
                } else if (i == newDataPoints.length - 1) {
                    (this.highchartsOptions.xAxis as any).max = segment.x2;
                }
            }
            this.chart.addSeries(segmentData);

            // xrange 任何时候都支持tooltip，不显示crosshair
            this.chart.tooltip.update({ enabled: true });
        });
    }


    /**
     * 用于一般线段型单数据画图（温度等）
     *
     * @private
     * @memberof UbiDataChartComponent
     */
    private updateDataForLineLike(): void {
        const _self = this;

        this.data.forEach((serie: UbiDataChartSerie) => {
            let existedSerie: any = _.find(this.highchartsOptions.series, { name: serie.name });

            if (!serie.data) {
                console.warn('Serie.data should not be null.');
            }

            let newDataPoints: UbiHighchartsPoint[] = this.convertUbiDataToHighchartsData(_.concat([], serie.data));

            if (existedSerie) {
                existedSerie.data = newDataPoints;
            } else {
                // console.log(newDataPoints.length);
                // @ts-ignore
                this.chart.addSeries({
                    // type: 'line', // line, area
                    // fillColor: 'rgba(127,127,127,0.1)',  // When you set an explicit fillColor, the fillOpacity is not applied.
                    id: serie.label,
                    name: serie.label,
                    // turboThreshold: 20,
                    // softThreshold: true,
                    data: newDataPoints,
                    color: serie.color || '#a1c2fc', // 连线
                    // Instead, you should define the opacity in the fillColor with an rgba color definition.
                    lineWidth: 1,// tag: 如果只显示点,则设为0
                    // connectNulls: true,
                    // marker: { // 有值的点
                    //     fillColor: '#3880ff',
                    //     enabled: true,
                    //     radius: 1, // 点大小
                    // },
                    states: {
                        hover: {
                            lineWidthPlus: 0
                        },
                    },
                    tooltip: {
                        // ref: https://api.highcharts.com/highcharts/series.line.tooltip.pointFormat
                        pointFormatter: function () {
                            try {
                                // console.log(this);
                                const stateLabel = this.series.name;
                                const yValue = this.y;
                                const color = this.color;

                                let convertedValue: any = yValue;
                                if (_self.valueFormatter && typeof _self.valueFormatter === 'function') {
                                    convertedValue = _self.valueFormatter(yValue);
                                }

                                return `<span style="color:${color}">●</span> ${stateLabel}: <b>${convertedValue}</b><br/>`;
                            } catch (e) { }
                            return null;
                        },
                    },
                }, false);

            }
        });
    }

    private determineDecimalPlace(): number {
        // console.log(this.viewOption);
        if (this.viewOption == null || this.viewOption.decimal == null) return DecimalPlaceType.DEFAULT; // defualt auto
        // console.log('deterimine=', this.viewOption.decimal);
        return this.viewOption.decimal
    }

    private updateExtra() {
        this.ngZone.onStable.pipe(take(1)).subscribe(() => {

            if (this.chartType == UbiFeedsChartType.XRange || this.chartType == UbiFeedsChartType.XRangeReversedColor) {
                // 如果是xrange, do nothing
                return;
            }

            const pointsToAdd: Highcharts.SeriesFlagsDataOptions[] = [];
            const decimalPlace = this.determineDecimalPlace();
            const upperLowerBoundScale: number = 0.35;
            const diff = this.maxPoint ? this.maxPoint.y - this.minPoint.y : 0; // 有max就肯定有min，所以只要判断max

            if (this.minPoint) {
                const minPoint = {

                    x: this.minPoint.x,
                    y: this.minPoint.y,
                    color: '#0f0',
                    style: {
                        fontSize: `${MARKUP_FONT_SIZE}px`,
                    },
                    title: `${this.translate.instant('APP.COMMON.MIN')}: ${_NF_(this.minPoint.y, decimalPlace)} ${this.unit}`,
                };

                // 一般flags都在上方，不需要扩大y轴lower范围
                (this.highchartsOptions.yAxis as any).min = this.minPoint.y;

                pointsToAdd.push(minPoint);
            }

            if (this.maxPoint) {
                const maxPoint = {
                    x: this.maxPoint.x,
                    y: this.maxPoint.y,
                    color: '#f00',
                    style: {
                        fontSize: `${MARKUP_FONT_SIZE}px`,
                    },
                    title: `${this.translate.instant('APP.COMMON.MAX')}: ${_NF_(this.maxPoint.y, decimalPlace)} ${this.unit}`,
                };

                // 扩大y轴upper范围，如果min==max则取1，让y轴位于0-1
                (this.highchartsOptions.yAxis as any).max = this.maxPoint.y + Math.abs((diff * upperLowerBoundScale || 1));

                pointsToAdd.push(maxPoint);
            }

            // 画平均线
            if (this.average != null && !this.hideMarkers) {
                const avgLabelPrefix = this.translate.instant('APP.COMMON.AVERAGE');
                const unit = this.unit;

                (this.highchartsOptions.yAxis as any).plotLines = [{
                    label: {
                        // text: 'avg.',
                        x: -10,
                        formatter: function () {
                            try {
                                return `${avgLabelPrefix} ${_NF_(this.options.value, decimalPlace)} ${unit}`;
                            } catch (e) { }
                            return null;
                        },
                        style: {
                            color: '#7044ff',
                            fontSize: `${MARKUP_FONT_SIZE}px`,
                        },
                    },
                    color: '#7044ff',
                    value: this.average, // Insert your average here
                    width: '1',
                    dashStyle: 'longdashdot',
                    zIndex: 3, // 在一般line前，但应在tooltip后面
                }];
            } else {
                // clear avaerage
                (this.highchartsOptions.yAxis as any).plotLines = [];
            }

            const yAxisMax = this.viewOption && this.viewOption.yAxisMax;
            const yAxisMin = this.viewOption && this.viewOption.yAxisMin;
            // console.log(this.viewOption);
            if (yAxisMax != null) {
                (this.highchartsOptions.yAxis as any).max = yAxisMax;
            }
            if (yAxisMin != null) {
                (this.highchartsOptions.yAxis as any).min = yAxisMin;
            }
            // console.log(this.highchartsOptions);

            // 排序
            pointsToAdd.sort((a, b) => a.x - b.x);

            // clear max/min
            let flags = this.chart.series.filter(s => s.type == 'flags');
            flags.forEach(s => s.remove());

            // 画 max/min
            if (!this.hideMarkers) {
                this.chart.addSeries({
                    type: 'flags',
                    data: pointsToAdd,
                    enableMouseTracking: false,
                    fillColor: 'rgba(255,255,255,0.3)',
                    y: -35,
                    shape: 'flag',
                    stackDistance: 30, // 两个flags重叠时的间距
                    states: {
                        inactive: {
                            opacity: 1, // 取消hover chart时，最大最小flags的透明化
                        }
                    }
                    // stackDistance: 20,
                }, false);
            } else {
                // DO NOT show markers
            }

            this.highchartsUpdateFlag = true;
        });
    }

    highchartsAfterInit(chartInstance) {
        this.highchartsAfterInit$.next(chartInstance);
        this.highchartsAfterInit$.complete();
    }

    ngOnDestroy(): void {
        this.highchartsAfterInit$.unsubscribe();

        this.customEmitter.unsubscribe();
    }



    ngAfterContentInit(): void {
        // this.setupSharedMouseeEvent();
    }
}
