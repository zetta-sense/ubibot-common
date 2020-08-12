import { UbiFeedsItem } from "../../remote/remote-channel.service";
import { TextEncoder, TextDecoder } from 'text-encoding';
import * as moment from "moment-timezone";
import { UbiChannelFieldDef } from "../../entities/ubi-channel-field-def.entity";

const PAGE_WIDTH: number = 48; // 80mm打印机能容纳的ascii字符数

const ESC_POS = {
    ESC_INIT: `@`,
    ESC_STYLE: `!`, // ESC ! n 设置打印字符格式

    LF: '\x0A', // 换行
}

// 初始化，追加esc前缀
Object.keys(ESC_POS).forEach((k) => {
    const ESC = '\x1B';
    if (k.indexOf('ESC_') == 0) {
        let cmd = ESC_POS[k];
        cmd = `${ESC}${cmd}`;
        ESC_POS[k] = cmd;
    }
});

class StringBuffer {
    private buffer: string[];
    constructor() {
        this.reset();
    }

    reset() {
        this.buffer = [];
        return this;
    }

    append(text: string) {
        this.buffer.push(text);
        return this;
    }

    toString(): string {
        return this.buffer.join('');
    }
}

export interface UbiPrintEncoderColumnDef {

    /**
     * field alias
     *
     * @type {string}
     * @memberof UbiPrintFeedsDef
     */
    header: string;

    scaleType: string;

    fieldKey: string;

    fieldDef: UbiChannelFieldDef;
}

interface LineStyleInterface { }

export class LineStylePair implements LineStyleInterface {
    label: string;
    value: string;

    constructor(label: string, value: string) {
        this.label = label;
        this.value = value;
    }
}

export class UbiPrinterEncoder {

    private title: string;

    private subtitles: string[];
    private footers: string[];

    private feedsDef: UbiPrintEncoderColumnDef[];
    private feeds: string[][]; // 每个元素应为每一行的数据

    constructor() {
        // console.log(ESC_POS);
    }

    init(title: string, feedsDef: UbiPrintEncoderColumnDef[], feeds: string[][]): void {
        this.title = title;
        this.feeds = feeds;
        this.feedsDef = feedsDef;

        this.resetSubtitles();
        this.resetFooters();
    }

    appendSubtitle(line: string): void {
        if (line != null) {
            this.subtitles.push(line);
        }
    }

    appendFooter(line: LineStyleInterface): void {
        if (line != null) {
            if (line instanceof LineStylePair) {
                const pair = line as LineStylePair;

                const labelMaxWidth = 16;
                let label = this.nomalize(pair.label);
                label = this.truncate(label, labelMaxWidth);

                const labelAsciiLen = this.calAsciiLength(label);
                label = `${label}${this.brewSpaces(labelMaxWidth - labelAsciiLen)}`;

                const valueMaxwidth = PAGE_WIDTH - labelMaxWidth;
                let value = this.nomalize(pair.value);
                value = this.truncate(value, valueMaxwidth);

                this.footers.push(`${label}${value}`);
            } else {
                this.footers.push('Unknown line style');
            }
        }
    }

    resetSubtitles(): void {
        this.subtitles = [];
    }

    resetFooters(): void {
        this.footers = [];
    }

    text(): string {
        let ret = [];
        ret.push(ESC_POS.ESC_INIT);

        const buffer = new StringBuffer();

        // channel alias
        if (this.title != null) {
            this.appendLineCenter(buffer, this.title);
        }

        // subtitles 如数据日期，时区
        if (this.subtitles.length > 0) {
            this.appendLineSplitter(buffer, '=');
        }

        this.subtitles.forEach((subtitle) => {
            this.appendLineCenter(buffer, subtitle);
        });

        this.appendLineSplitter(buffer, '=');

        // 打印colums header
        const headers = this.feedsDef.map((fd) => fd.header);
        this.appendColumnsData(buffer, headers);
        this.appendLineSplitter(buffer);

        // 打印数据
        for (let i = 0; i < this.feeds.length; i++) {
            const feedPack: string[] = this.feeds[i];
            this.appendColumnsData(buffer, feedPack);
        }

        if (!this.feeds.length) {
            this.appendLineCenter(buffer, 'No Data');
        }

        this.appendLineSplitter(buffer);

        // footers 如最大/最小/平均值
        this.footers.forEach((footer) => {
            this.appendLineLeft(buffer, footer);
        });

        this.appendLineSplitter(buffer);

        this.appendLineLeft(buffer, 'Signature:'); // 签名行
        this.appendEmptyLine(buffer, 5);

        return buffer.toString();
    }

    private isASCII(input: string): boolean {
        if (input != null && input.charCodeAt(0) > 0xff) {
            return false;
        }
        return true;
    }

    /**
     * 按ascii字符计算长度，非ascii如中文按2算
     *
     * @private
     * @param {string} text
     * @returns {number}
     * @memberof UbiPrinterEncoder
     */
    private calAsciiLength(text: string): number {
        const len = text.split('').reduce((accLen, c) => {
            return accLen + (this.isASCII(c) ? 1 : 2);
        }, 0);
        return len;
    }

    /**
     * 若是null, 则返回空串
     * 移除换行 0x0a, 0x0c
     *
     * @private
     * @param {string} text
     * @returns {string}
     * @memberof UbiPrinterEncoder
     */
    private nomalize(text: string): string {
        return text == null ? '' : text.replace(/\n/ig, '');
    }

    /**
     * 追加一行，并居中
     *
     * @private
     * @param {string} input
     * @param {StringBuffer} buffer
     * @returns {StringBuffer}
     * @memberof UbiPrinterEncoder
     */
    private appendLineCenter(buffer: StringBuffer, input: string): StringBuffer {
        let text = this.nomalize(input);
        text = this.truncate(text, PAGE_WIDTH);

        const textAsciiLen = this.calAsciiLength(text);

        const remain = PAGE_WIDTH - textAsciiLen;
        if (remain > 0) {
            const indent = Math.floor(remain / 2);
            text = this.brewSpaces(indent) + text;
        }

        // console.log(`appendLineCenter: input = ${input}, buffer=${buffer.toString()}`);

        return buffer.append(text).append(ESC_POS.LF);
    }

    /**
     * 追加一行，左对齐
     *
     * @private
     * @param {StringBuffer} buffer
     * @param {string} input
     * @returns {StringBuffer}
     * @memberof UbiPrinterEncoder
     */
    private appendLineLeft(buffer: StringBuffer, input: string): StringBuffer {
        let text = this.nomalize(input);
        text = this.truncate(text, PAGE_WIDTH);
        return buffer.append(text).append(ESC_POS.LF);
    }

    private appendEmptyLine(buffer: StringBuffer, n: number): StringBuffer {
        while (n-- > 0) {
            buffer.append(ESC_POS.LF);
        }
        return buffer;
    }

    /**
     * 追加一行分隔符
     *
     * @private
     * @param {string} [c='-']
     * @param {StringBuffer} buffer
     * @returns {StringBuffer}
     * @memberof UbiPrinterEncoder
     */
    private appendLineSplitter(buffer: StringBuffer, c: string = '-'): StringBuffer {
        let ret: string[] = [];
        const cAsciiLen = this.calAsciiLength(c);
        let repeat = Math.floor(PAGE_WIDTH / cAsciiLen);
        while (repeat-- > 0) {
            ret.push(c);
        }
        const line = ret.join('');
        return buffer.append(line).append(ESC_POS.LF);
    }

    private brewSpaces(n: number): string {
        let ret = [];
        while (n-- > 0) ret.push(' ');
        return ret.join('');
    }

    /**
     * 如果超过预想length则截断，接省略号
     *
     * @private
     * @param {string} text
     * @param {number} maxAsciiLength
     * @returns {string}
     * @memberof UbiPrinterEncoder
     */
    private truncate(text: string, maxAsciiLength: number): string {
        // return text;

        let ellipsis = '...';
        let ret: string[] = [];
        const textAsciiLen = this.calAsciiLength(text);
        if (textAsciiLen > maxAsciiLength) {
            text.split('').reduce((cArr, c) => {
                const futureAsciiLen = this.calAsciiLength(cArr.join('')) + this.calAsciiLength(c);
                if (futureAsciiLen > maxAsciiLength - this.calAsciiLength(ellipsis)) {
                    return cArr;
                } else {
                    cArr.push(c);
                    return cArr;
                }
            }, ret);

            ret.push(ellipsis);
        } else {
            ret.push(text);
        }
        return ret.join('');
    }

    private appendColumnsData(buffer: StringBuffer, cols: string[]): StringBuffer {
        const colMaxWidth = Math.floor(PAGE_WIDTH / cols.length);

        cols.forEach((text: string, index: number) => {
            text = this.nomalize(text);
            text = this.truncate(text, colMaxWidth);

            const colAsciiLen = this.calAsciiLength(text);
            const spaces = this.brewSpaces(colMaxWidth - colAsciiLen);

            // 除第一列左对齐，其它列右对齐
            if (index == 0) {
                buffer.append(`${text}${spaces}`);
            } else {
                buffer.append(`${spaces}${text}`);
            }
        });

        return buffer.append(ESC_POS.LF);
    }

    encode(text: string, charset: string = 'utf-8'): Uint8Array {
        console.log(`UbiPrinterEncoder encoding with ${charset}...`);

        const charsetEncoder = new TextEncoder(charset, { NONSTANDARD_allowLegacyEncoding: true });
        const ret = charsetEncoder.encode(text);

        return ret;
    }

    enodeDebugText(text: string, charset = 'gb18030'): Uint8Array {
        const charsetEncoder = new TextEncoder(charset, { NONSTANDARD_allowLegacyEncoding: true });
        const ret = charsetEncoder.encode(text);
        return ret;
    }

}
