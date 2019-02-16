import {AfterViewInit, Component, Input, NgZone, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {UbiUtilsService} from '../../services/ubi-utils.service';
import {Observable, Subject} from 'rxjs';
import * as _ from 'lodash';

// highcharts lib
import * as Highcharts from 'highcharts/highstock';
import * as HighchartsThemeDarkUnica from 'highcharts/themes/dark-unica';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import {TranslateService} from '@ngx-translate/core';

// ref: https://github.com/highcharts/highcharts-angular#theme
HighchartsThemeDarkUnica(Highcharts);
NoDataToDisplay(Highcharts);

export interface UbiDataChartPoint {
    x: any;
    y: any;
}

export interface UbiDataChartSerie {
    name: string;
    data: UbiDataChartPoint[],

    // other options
    [key: string]: any;
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
    highchartsDateTimeLabelFormats = {
        millisecond: '%H:%M:%S',//'%H:%M:%S.%L',
        second: '%H:%M:%S',
        minute: '%H:%M',
        hour: '%H:%M',
        day: '%Y-%m-%d',//'%e. %b',
        week: '%Y-%m-%d', //'%e. %b',
        month: '%Y-%m', //%b \'%y',
        year: '%Y'
    };

    highchartsOptions = {
        chart: {
            type: 'line'
        },
        title: {
            text: 'UbiBot'
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
        yAxis: {
            crosshair: true,
            gridLineWidth: 1,
            title: {
                text: null,// remove side label - Values
            }
        },
        lang: {
            noData: "No data"
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

    @Input() data: UbiDataChartSerie[];
    @Input() title: string;

    @Input() width = 480;
    @Input() height = 288;

    protected chart: Highcharts.Chart;// tag: highcharts instance

    readonly containerId: string;

    constructor(private ubiUtils: UbiUtilsService,
                private translate: TranslateService,
                private ngZone: NgZone) {
        this.containerId = ubiUtils.generateUuid();

        // update i18n for highcharts options
        this.highchartsOptions.lang.noData = this.translate.instant('APP.COMMON.NO-DATA');

        this.highchartsAfterInit$ = new Subject<Highcharts.Chart>();
        this.highchartsAfterInit$.subscribe((chart: Highcharts.Chart) => {
            this.chart = chart;

            this.updateData();
            this.updateTitle();
        });
    }

    ngOnInit() {
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.chart) {
            if (changes.title) {
                this.updateTitle();
            }

            if (changes.data) {
                this.updateData();
            }
        }

        // console.log('data changed', changes);
    }

    updateTitle() {
        if (this.chart) {
            // tag: 避免changed after check
            setTimeout(() => {
                // console.log('update title to:', this.title);
                this.chart.setTitle({
                    text: this.title || ''
                }, {}, false);
                this.highchartsUpdateFlag = true;
            });
        }
    }
h
    private convertUbiDataToHighchartsData(rawData: UbiDataChartPoint[]): UbiHighchartsPoint[] {
        let ret: UbiHighchartsPoint[] = [];
        rawData.forEach((ubiPoint: UbiDataChartPoint) => {
            let xTime = new Date(ubiPoint.x).getTime();
            ret.push([xTime, ubiPoint.y]);
        });

        // 按时间排序asc
        ret.sort((a, b) => {
            return a[0] - b[0];
        });

        return ret;
    }

    updateData() {
        if (this.chart) {
            // tag: 避免changed after check
            setTimeout(() => {
                // console.log('data=', this.data);
                this.data.forEach((serie: UbiDataChartSerie) => {
                    let existedSerie = _.find(this.highchartsOptions.series, {name: serie.name});

                    if(!serie.data) {
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
                                radius: 2
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
            });
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
