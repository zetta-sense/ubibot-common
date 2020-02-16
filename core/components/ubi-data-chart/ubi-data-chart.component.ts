import { AfterViewInit, Component, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as _ from 'lodash';

// highcharts lib
import * as Highcharts from 'highcharts/highstock';
import * as HighchartsThemeDarkUnica from 'highcharts/themes/dark-unica';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import { TranslateService } from '@ngx-translate/core';
import { UbiUtilsService, _NF_ } from '../../../services/ubi-utils.service';
import { take, delay } from 'rxjs/operators';
import { UbiFeedType } from 'src/modules/ubibot-common/remote/remote-channel.service';

// ref: https://github.com/highcharts/highcharts-angular#theme
NoDataToDisplay(Highcharts);

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

/**
 * Use name to map existed serie.
 *
 * @export
 * @interface UbiDataChartSerie
 */
export interface UbiDataChartSerie {
    name: string;
    label: string;
    data: UbiDataChartPoint[],
}

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
        chart: {
            type: 'line',
            animation: false,
        },
        plotOptions: {
            series: {
                animation: false,
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


    /**
     * Optional
     *
     * @type {number}
     * @memberof UbiDataChartComponent
     */
    @Input() decimalPlace: number;


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

            if (changes.maxPoint || changes.minPoint) {
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
                this.data.forEach((serie: UbiDataChartSerie) => {
                    let existedSerie: any = _.find(this.highchartsOptions.series, { name: serie.name });

                    if (!serie.data) {
                        console.warn('Serie.data should not be null.');
                    }

                    let newDataPoints: UbiHighchartsPoint[] = this.convertUbiDataToHighchartsData(_.concat([], serie.data));

                    if (existedSerie) {
                        existedSerie.data = newDataPoints;
                    } else {
                        // console.log(newDataPoints);
                        // @ts-ignore
                        this.chart.addSeries({
                            type: 'line', // line, area
                            // fillColor: 'rgba(127,127,127,0.1)',  // When you set an explicit fillColor, the fillOpacity is not applied.
                            id: serie.label,
                            name: serie.label,
                            turboThreshold: 100,
                            data: newDataPoints,
                            color: '#a1c2fc', // 连线
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
                            }
                        }, false);

                    }
                });

                this.highchartsUpdateFlag = true;
            })
        }
    }

    private updateExtra() {
        this.ngZone.onStable.pipe(take(1)).subscribe(() => {
            const pointsToAdd = [];
            const decimalPlace = this.decimalPlace;
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

                // 扩大y轴upper范围
                (this.highchartsOptions.yAxis as any).max = this.maxPoint.y + Math.abs(diff * upperLowerBoundScale);

                pointsToAdd.push(maxPoint);
            }

            // 画平均线
            if (this.average != null) {
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
            }

            // 排序
            pointsToAdd.sort((a, b) => a.x - b.x);

            this.chart.addSeries({
                type: 'flags',
                data: pointsToAdd,
            }, false);

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
