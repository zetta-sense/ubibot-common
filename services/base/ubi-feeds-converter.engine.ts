import { UbiFeedsResponse, UbiFeedType } from "../../remote/remote-channel.service";
import { UbiValueOptions, UbiChannelDAO, ConvertValue } from "../../entities/ubi-channel.entity";
import { UbiChannelFieldDef, UbiChannelFieldDefScaleType } from "../../entities/ubi-channel-field-def.entity";
import { UbiDataChartSerie, UbiDataChartPoint, UbiDataChartPointForXRange } from "../../core/components/ubi-data-chart/ubi-data-chart.component";
import * as _ from 'lodash';

export interface UbiFeedPack {
    index?: number; // 仅用于排序
    visible?: boolean;

    key: string, // field1, ...
    title: string,
    field: UbiChannelFieldDef,
    series: UbiDataChartSerie[],

    feedType: UbiFeedType,

    maxPoint?: UbiDataChartPoint,
    minPoint?: UbiDataChartPoint,

    avg?: number,
    sum?: number,

    start: Date, // 整个resp数据的开始日期
    end: Date,  // 整个resp数据的结束日期

    chartType?: UbiFeedsChartType,
}

export enum UbiFeedsChartType {
    Line = 'line',
    XRange = 'xrange',
}

export class UbiFeedsConverterEngine {
    constructor() {

    }

    /**
     * 单serie解包
     *
     * @param {UbiFeedsResponse} resp
     * @param {UbiValueOptions} [opts]
     * @param {UbiFeedType} [type]
     * @returns {UbiFeedPack[]}
     * @memberof UbiFeedsConverterEngine
     */
    extractFeeds(resp: UbiFeedsResponse, opts?: UbiValueOptions, type?: UbiFeedType): UbiFeedPack[] {
        const channel: UbiChannelDAO = new UbiChannelDAO(resp.channel);
        const fields: UbiChannelFieldDef[] = channel.getFields().getEnabledFieldDefs()

        // 追加头尾两端的端点
        // tag: 必须要转换为number, 如果是string, 可能由于带有zone time的关系导致比较错误
        const start: number = new Date(resp.start).getTime();
        const end: number = new Date(resp.end).getTime();

        const map: { [key: string]: UbiFeedPack } = {};

        // 构建每个field的pack
        for (let i = 0; i < fields.length; i++) {
            const field: UbiChannelFieldDef = fields[i];
            const fieldKey = field.key;
            const fieldName = field.label;
            const fieldScaleType = field.scaleType;

            const data: UbiDataChartPoint[] = [];

            // tag: mock data to debug
            // resp.feeds = [
            //     { created_at: '2019-05-22T21:30:39+08:00', field1: 1 },
            //     { created_at: '2019-05-22T21:30:39+08:05', field1: 2.1 },
            //     { created_at: '2019-05-22T21:30:39+08:09', field1: 1.4 },
            //     { created_at: '2019-05-22T21:30:39+08:15', field1: 1.8 },
            // ];

            const serie_1: UbiDataChartSerie = {
                name: fieldKey,
                label: fieldName,
                data: data,
            };

            // feet pack init
            map[fieldKey] = {
                index: i,
                visible: true,

                key: fieldKey,
                field: field,
                title: fieldName,
                series: [serie_1],
                start: new Date(start), // 注意，这里是Date类型，feeds里面是number
                end: new Date(end), // 注意，这里是Date类型，feeds里面是number

                // 采样/平均
                feedType: type || UbiFeedType.Sampling,

                // 决定chart类型
                chartType: fieldScaleType == UbiChannelFieldDefScaleType.SWITCH_STATE ? UbiFeedsChartType.XRange : UbiFeedsChartType.Line,
            };
        }

        // 归纳数据
        // let tmpA = Date.now();
        for (let i = 0; i < resp.feeds.length; i++) {
            const feed = resp.feeds[i];
            // const createdAt: string = feed.created_at;
            const createdAtTimestamp: number = feed.created_at_long;

            for (let j = 0; j < fields.length; j++) {
                const field = fields[j];
                const k = field.key;
                const v = feed[k];

                const pack: UbiFeedPack = map[k];
                // 不使用正则尽量提高performance
                if (pack && v != null) {
                    const value = ConvertValue(v, pack.field, opts);

                    // const point: UbiDataChartPoint = { x: new Date(createdAt).getTime(), y: value };
                    const point: UbiDataChartPoint = { x: createdAtTimestamp, y: value };
                    pack.series[0].data.push(point);
                }
            }
        }
        // let elapsed = Date.now() - tmpA;
        // console.log(`elapsed: ${elapsed} ms`);

        // 排序 / 找出最大最小值 / 计算平均值
        const ret: UbiFeedPack[] = _.values(map);
        for (let i = 0; i < ret.length; i++) {
            const pack = ret[i];
            const data = pack.series[0].data;

            // asc sort
            data.sort((a, b) => a.x - b.x);

            const first = _.first(data);
            // console.log(!!start, !_.find(data, { x: start }), (!first || first.x > start));
            // tag: 插入开始点
            if (!isNaN(start) && !_.find(data, { x: start }) && (!first || first.x > start) && data.length) {
                // console.log('adding first point');
                data.unshift({ x: start, y: null });
            }

            const last = _.last(data);
            // tag: 插入结束点
            if (!isNaN(end) && !_.find(data, { x: end }) && (!last || last.x < end) && data.length) {
                // console.log('adding last point');
                data.push({ x: end, y: null });
            }


            const dataFiltered = _.filter(data, (o: UbiDataChartPoint) => o.y != null); // 去除y空值点
            const maxPoint = _.maxBy(dataFiltered, (o: UbiDataChartPoint) => o.y);
            const minPoint = _.minBy(dataFiltered, (o: UbiDataChartPoint) => o.y);
            pack.maxPoint = maxPoint;
            pack.minPoint = minPoint;
            const sum = dataFiltered.length ? _.reduce(dataFiltered, (sum: number, o: UbiDataChartPoint) => sum + o.y, 0) : null;
            const avg = dataFiltered.length ? sum / dataFiltered.length : null;
            pack.sum = sum;
            pack.avg = avg;
        }

        // 根据chartType对data进行再整理，之前已经已经进行sort，因此这里可以保证顺序
        for (let i = 0; i < ret.length; i++) {
            const pack = ret[i];
            const data = pack.series[0].data;
            const chartType = pack.chartType;

            // console.log(data);

            const dataConverted: UbiDataChartPoint[] = [];
            let lastPointXRange: UbiDataChartPointForXRange;
            if (chartType === UbiFeedsChartType.XRange) {
                let pointXRange: UbiDataChartPointForXRange;
                for (let j = 0; j < data.length; j++) {
                    const point: UbiDataChartPoint = data[j];

                    if (lastPointXRange && point.y == lastPointXRange.y) {
                        pointXRange.x2 = point.x;
                    } else {
                        pointXRange = {
                            // x: lastPoint ? lastPoint.x : point.x,
                            x: point.x,
                            x2: point.x,
                            y: point.y,
                        };
                        dataConverted.push(pointXRange);
                        lastPointXRange = pointXRange;

                        // 最后一点的y延续到当前突变点
                        if (lastPointXRange) {
                            lastPointXRange.x2 = point.x;
                        }
                    }
                }

                // replace with converted data
                pack.series[0].data = dataConverted;

                pack.sum = undefined;
                pack.avg = undefined;
                pack.maxPoint = undefined;
                pack.minPoint = undefined;

                // console.log(dataConverted);
            }
        }

        return ret;
    }
}
