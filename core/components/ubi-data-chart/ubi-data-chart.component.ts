import { AfterViewInit, Component, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
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
import { take, delay } from 'rxjs/operators';
import { UbiFeedType } from 'src/modules/ubibot-common/remote/remote-channel.service';
import { UbiFeedsChartType } from '../../../services/base/ubi-feeds-converter.engine';
import { UbiExtraPreferenceSensorsSettings } from '../../../entities/ubi-extra-preference.entity';
import { UbiChannelFieldViewOption } from '../../../entities/ubi-channel-field-view-option.entity';

// ref: https://github.com/highcharts/highcharts-angular#theme
NoDataToDisplay(Highcharts);
HighchartsBoost(Highcharts);
HighchartsXRange(Highcharts);

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
@Component({
    selector: 'ubi-data-chart',
    templateUrl: './ubi-data-chart.component.html',
    styleUrls: ['./ubi-data-chart.component.scss']
})
export class UbiDataChartComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

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
            },
        },
        title: {},
        subtitle: {},
        credits: {
            enabled: false
        },
        xAxis: {
            crosshair: true,
            type: 'datetime',
            gridLineWidth: 1,
            // dateTimeLabelFormats: this.highchartsDateTimeLabelFormats
        },
        time: {
            timezone: undefined,
            timezoneOffset: new Date().getTimezoneOffset(), // 先给个默认的，当timezone更新后这个offset将被覆盖
        },
        yAxis: {
            crosshair: true,
            gridLineWidth: 1,
            title: {
                text: null,// remove side label - Values
            },
            labels: {},
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
    ) {
        // tag: 只能放在这个阶段，不能在初始化后
        this.updateTheme();

        // update i18n for highcharts options
        this.highchartsOptions.lang.noData = this.translate.instant('APP.COMMON.NO-DATA');
        // this.chart.set

        this.highchartsAfterInit$ = new Subject<Highcharts.Chart>();
        this.highchartsAfterInit$.subscribe((chart: Highcharts.Chart) => {
            this.chart = chart;

            this.updateData();
            this.updateExtra();
            this.updateTitle();
            this.updateTooltip();
            this.updateDateFormat();
            this.updateDecimalPlace();
            this.updateTimezone();
            // this.chart.update

            // FIXME: remove later
            // (<any>window).a = chart;
        });

    }

    ngOnInit() {
        const opts: any = this.highchartsOptions;
        const _self = this;

        if (this.chartType == UbiFeedsChartType.XRange || this.chartType == UbiFeedsChartType.XRangeReversedColor) {
            opts.chart.type = 'xrange';

            // ref: https://api.highcharts.com/highcharts/yAxis.labels.rotation
            opts.yAxis.categories = [`${this.translate.instant('APP.COMMON.STATE')}`]; // yAxis的label
            opts.yAxis.labels.rotation = -90;

            opts.yAxis.crosshair = false;
            opts.xAxis.crosshair = false;

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
            if (this.unit) {
                this.highchartsOptions.tooltip.valueSuffix = ` ${this.unit}`;
            } else {
                this.highchartsOptions.tooltip.valueSuffix = undefined;
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
                this.highchartsOptions.tooltip.xDateFormat = segs.join(' ');

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
                const _self = this;

                if (this.chartType === UbiFeedsChartType.XRange || this.chartType === UbiFeedsChartType.XRangeReversedColor) { // tag: XRange chart
                    this.chart.series.forEach((s) => s.remove());

                    this.data.forEach((serie: UbiDataChartSerie) => {
                        const newDataPoints: UbiDataChartPointForXRange[] = serie.data as UbiDataChartPointForXRange[];

                        let segmentData: any = {
                            name: this.translate.instant('APP.COMMON.STATE'),
                            borderColor: '#aaa',
                            borderWidth: 1,
                            borderRadius: 3,
                            tooltip: {
                                // ref: https://api.highcharts.com/highcharts/series.xrange.tooltip.pointFormatter
                                // ref: https://api.highcharts.com/class-reference/Highcharts
                                pointFormatter: function () {
                                    try {
                                        // console.log(this);
                                        const stateLabel = this.series.name;
                                        const yValue = this.custom.y;
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
                        };

                        // 数据分段
                        for (let i = 0; i < newDataPoints.length; i++) {
                            const segment: UbiDataChartPointForXRange = newDataPoints[i];
                            const yValue = segment.y;

                            // (this.highchartsOptions.yAxis as any).max = this.maxPoint.y + Math.abs((diff * upperLowerBoundScale || 1));

                            const greenStateValue = this.chartType == UbiFeedsChartType.XRange ? 1 : 0;

                            if (yValue != null) {
                                const segmentForHighchart = {
                                    x: segment.x,
                                    x2: segment.x2,
                                    y: 0,
                                    custom: segment, // 用custom保留segment数据供formatter使用
                                    color: yValue == greenStateValue ? 'rgba(170, 253, 179, 0.6)' : 'rgba(253, 192, 194, 0.6)', // 开/关, #ddfddb
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
                    });
                } else { // tag: Line chart
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
                                    }
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

                this.highchartsUpdateFlag = true;
            })
        }
    }

    private determineDecimalPlace(): number {
        // console.log(this.viewOption);
        if (this.viewOption == null || this.viewOption.decimal == null) return -2; // defualt auto
        // console.log('deterimine=', this.viewOption.decimal);
        return this.viewOption.decimal
    }

    private updateExtra() {
        this.ngZone.onStable.pipe(take(1)).subscribe(() => {
            const pointsToAdd = [];
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
    }

}
