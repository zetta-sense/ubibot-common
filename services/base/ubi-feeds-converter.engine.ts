import { UbiFeedsResponse, UbiFeedType } from "../../remote/remote-channel.service";
import { UbiValueOptions, UbiChannelDAO, ConvertValue } from "../../entities/ubi-channel.entity";
import { UbiChannelFieldDef, UbiChannelFieldDefScaleType } from "../../entities/ubi-channel-field-def.entity";
import { UbiDataChartSerie, UbiDataChartPoint, UbiDataChartPointForXRange, UbiDataChartValueFormatter } from "../../core/components/ubi-data-chart/ubi-data-chart.component";
import * as _ from 'lodash';

export interface UbiFeedPack {
    index?: number; // 仅用于排序
    visible?: boolean;

    truncated?: boolean;

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

    valueFormatter?: UbiDataChartValueFormatter;
}

export enum UbiFeedsChartType {
    Line = 'line',

    /**
     * 一般用于开关，1显绿色
     */
    XRange = 'xrange',

    /**
     * 一般用于人感，0显绿色
     */
    XRangeReversedColor = 'xrange2',

    Fusion = 'fusion',
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
        const fields: UbiChannelFieldDef[] = channel.getFields().getEnabledFieldDefs();

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

            // determine chart type
            let chartType;
            switch (fieldScaleType) {
                case UbiChannelFieldDefScaleType.SWITCH_STATE:
                    chartType = UbiFeedsChartType.XRange;
                    break;
                case UbiChannelFieldDefScaleType.HUMAN_DETECTION:
                    chartType = UbiFeedsChartType.XRangeReversedColor;
                    break;
                default:
                    chartType = UbiFeedsChartType.Line;
                    break;
            }


            // feet pack init
            map[fieldKey] = {
                index: i,
                visible: true,

                truncated: resp.is_truncated,

                key: fieldKey,
                field: field,
                title: fieldName,
                series: [serie_1],
                start: new Date(start), // 注意，这里是Date类型，feeds里面是number
                end: new Date(end), // 注意，这里是Date类型，feeds里面是number

                // 采样/平均
                feedType: type || UbiFeedType.Sampling,

                // 决定chart类型
                chartType: chartType,
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

            // tag: Deprecated
            // const first: UbiDataChartPoint = _.first(data);
            // // console.log(!!start, !_.find(data, { x: start }), (!first || first.x > start));
            // // tag: 插入开始点，即根据查询时的starttime插入对应时间的开始点 (以确保轴跨度的一致)
            // if (!isNaN(start) && !_.find(data, { x: start }) && (!first || first.x > start) && data.length) {
            //     // console.log('adding first point');
            //     data.unshift({ x: start, y: null });
            // }

            // tag: 如果数据截断，插入截断点 (用于标记截断位置)
            if (pack.truncated) {
                let lastTruncatedPoint: UbiDataChartPoint = _.last(data);
                if (lastTruncatedPoint && lastTruncatedPoint.x < end) { // 最后一个点小于查询的endtime时添加截断点，让截断点到endtime部分显示为空数据段
                    data.push({ x: lastTruncatedPoint.x + 1, y: null });
                }
            }

            // tag: Deprecated
            // const last: UbiDataChartPoint = _.last(data);
            // // tag: 插入结束点，即根据查询时的endtime插入对应时间的结束点 (以确保轴跨度的一致)
            // if (!isNaN(end) && !_.find(data, { x: end }) && (!last || last.x < end) && data.length) {
            //     // console.log('adding last point');
            //     data.push({ x: end, y: null });
            // }


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
            if (chartType === UbiFeedsChartType.XRange || chartType === UbiFeedsChartType.XRangeReversedColor) {
                let lastPointXRange: UbiDataChartPointForXRange;
                let pointXRange: UbiDataChartPointForXRange;

                let lastX = null;

                for (let j = 0; j < data.length; j++) {
                    const point: UbiDataChartPoint = data[j];

                    // tag: debug, 前null值测试 -->
                    // if (j == 0) {
                    //     let tmp = {
                    //         x: point.x - 1000 * 60 * 60 * 6,
                    //         x2: point.x,
                    //         y: null,
                    //     };
                    //     dataConverted.push(tmp);
                    // }
                    // tag-end

                    // if (lastX != null) {
                    //     let segOfXRange = {
                    //         x: lastX,
                    //         x2: point.x,
                    //         y: point.y,
                    //     }

                    //     dataConverted.push(segOfXRange);
                    // }

                    // lastX = point.x;



                    if (lastPointXRange && point.y == lastPointXRange.y) {
                        pointXRange.x2 = point.x;
                    } else {
                        let x2 = end; // 初始化segment时，默认延续到查询的endtime，在读取下一个point时再更新这个x2

                        pointXRange = {
                            // x: lastPoint ? lastPoint.x : point.x,
                            x: point.x,
                            x2: x2,
                            y: point.y,
                        };
                        dataConverted.push(pointXRange);

                        // 最后一点的y延续到当前突变点
                        if (lastPointXRange) {
                            lastPointXRange.x2 = point.x;
                        }

                        // 必须在更新lastPointXRange之后
                        lastPointXRange = pointXRange;
                    }





                    // tag: debug, 后null值测试 -->
                    // if (j == data.length - 1) {
                    //     let tmp = {
                    //         x: point.x,
                    //         x2: point.x + 1000 * 60 * 60 * 6,
                    //         y: null,
                    //     };
                    //     dataConverted.push(tmp);
                    // }
                    // tag-end
                }

                // replace with converted data
                pack.series[0].data = dataConverted;
                // console.warn('converted:', dataConverted);

                // 因为xrange没有下述属性，reset to undefined
                pack.sum = undefined;
                pack.avg = undefined;
                pack.maxPoint = undefined;
                pack.minPoint = undefined;

                // tag: debug, 中间null值测试 -->
                // if (dataConverted.length > 3) {
                //     dataConverted[2].y = null;
                // }
                // tag-end

                // console.log(dataConverted);
            }
        }

        return ret;
    }
}
