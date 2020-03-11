export class UbiChannelFieldViewOption {
    decimal: number;

    yAxisMax: number;
    yAxisMin: number;

    constructor(decimal: number, yAxisMax?: number, yAxisMin?: number) {
        this.decimal = decimal;
        this.yAxisMax = yAxisMax;
        this.yAxisMin = yAxisMin;
    }
}
