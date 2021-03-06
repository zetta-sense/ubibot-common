export enum DecimalPlaceType {
    DEFAULT = -2,
    ALL = -1,
}

export interface UbiChannelFieldViewOptionInterface {
    decimal: number;

    yAxisMax: number;
    yAxisMin: number;
}

export class UbiChannelFieldViewOption implements UbiChannelFieldViewOptionInterface {
    decimal: number;

    yAxisMax: number;
    yAxisMin: number;


    constructor(decimal: number, yAxisMax?: number, yAxisMin?: number) {
        this.decimal = decimal;
        this.yAxisMax = yAxisMax;
        this.yAxisMin = yAxisMin;
    }

    isEmpty() {
        return this.decimal == DecimalPlaceType.DEFAULT && this.yAxisMax == null && this.yAxisMin == null;
    }
}
