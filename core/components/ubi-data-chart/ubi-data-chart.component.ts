import { AfterViewInit, Component, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as _ from 'lodash';

// highcharts lib
import * as Highcharts from 'highcharts/highstock';
import * as HighchartsThemeDarkUnica from 'highcharts/themes/dark-unica';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import { TranslateService } from '@ngx-translate/core';
import { UbiUtilsService } from '../../../services/ubi-utils.service';
import { take } from 'rxjs/operators';

// ref: https://github.com/highcharts/highcharts-angular#theme
NoDataToDisplay(Highcharts);

export interface UbiDataChartPoint {
    x: any;
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
            type: 'line'
        },
        title: {
            text: null
        },
        credits: {
            enabled: false
        },
        xAxis: {
            crosshair: true,
            type: 'datetime',
            gridLineWidth: 1,
            dateTimeLabelFormats: this.highchartsDateTimeLabelFormats
        },
        time: {
            timezoneOffset: new Date().getTimezoneOffset(),
        },
        yAxis: {
            crosshair: true,
            gridLineWidth: 1,
            title: {
                text: null,// remove side label - Values
            }
        },
        lang: {
            noData: "",
        },
        noData: {
            style: {
                fontWeight: 'bold',
                fontSize: '24px',
                color: '#ffffff'
            }
        },
        tooltip: {
            xDateFormat: '%Y-%m-%d %H:%M:%S',
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

    /**
     * Unit to append.
     *
     * @type {string}
     * @memberof UbiDataChartComponent
     */
    @Input() unit: string;

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
            this.updateTitle();
            // this.chart.update

            (<any>window).a = chart;
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
            if (changes.title || changes.unit) {
                this.updateTitle();
            }

            if (changes.data) {
                this.updateData();
            }
        }

        // console.log('data changed', changes);
    }

    private updateTheme() {
        HighchartsThemeDarkUnica(Highcharts);
    }

    private updateTitle() {
        if (this.chart) {
            // tag: 避免changed after check
            this.ngZone.onStable.pipe(take(1)).subscribe(() => {
                // console.log('update title to:', this.title);
                let title = 'UbiBot';
                if (this.title && this.unit) {
                    title = `${this.title} ${this.unit}`;
                } else if (this.title) {
                    title = `${this.title}`;
                }

                this.highchartsOptions.title.text = title;

                // 不能用Highcharts原生的api，会被ngx highcharts覆盖
                // this.chart.setTitle({
                //     text: this.title || ''
                // }, undefined, undefined);

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
            this.ngZone.onStable.pipe(take(1)).subscribe(() => {
                // console.log('data=', this.data);
                this.data.forEach((serie: UbiDataChartSerie) => {
                    let existedSerie = _.find(this.highchartsOptions.series, { name: serie.name });

                    if (!serie.data) {
                        console.warn('Serie.data should not be null.');
                    }

                    let newDataPoints: UbiHighchartsPoint[] = this.convertUbiDataToHighchartsData(_.concat([], serie.data));

                    if (existedSerie) {
                        existedSerie.data = newDataPoints;
                    } else {
                        // @ts-ignore
                        this.chart.addSeries({
                            name: serie.name,
                            data: newDataPoints,
                            lineWidth: 1,// tag: 如果只显示点,则设为0
                            // connectNulls: true,
                            marker: {
                                fillColor: '#FFFFFF',
                                enabled: true,
                                radius: 1, // 点大小
                            },
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

    highchartsAfterInit(chartInstance) {
        this.highchartsAfterInit$.next(chartInstance);
        this.highchartsAfterInit$.complete();
    }

    ngOnDestroy(): void {
        this.highchartsAfterInit$.unsubscribe();
    }

}
