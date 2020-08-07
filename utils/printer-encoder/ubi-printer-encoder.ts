import { UbiFeedsItem } from "../../remote/remote-channel.service";
import { TextEncoder, TextDecoder } from 'text-encoding';


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

export class UbiPrinterEncoder {

    private feeds: UbiFeedsItem[];

    constructor() {
        // console.log(ESC_POS);
    }

    initWithFeeds(feeds: UbiFeedsItem[]): void {
        this.feeds = feeds;
    }

    text(): string {
        let ret = [];
        ret.push(ESC_POS.ESC_INIT);

        // header
        ret.push(['Time', '数据1', '数据f2'].join('    '));
        ret.push(ESC_POS.LF);
        ret.push('----------------'); // 16b
        ret.push(ESC_POS.LF);

        // 数据
        if (this.feeds != null) {
            const lines = this.feeds.filter((a) => a.created_at_long != null && a.field1 != null && a.field2 != null).map((item) => {
                return [item.created_at_long, item.field1, item.field2].join('    ');
            });

            lines.forEach((line) => {
                ret.push(line);
                ret.push(ESC_POS.LF);
            });
        }
        return ret.join('');
    }

    encode(text: string, charset: string = 'utf-8'): Uint8Array {
        console.log(`UbiPrinterEncoder encoding with ${charset}...`);

        const charsetEncoder = new TextEncoder(charset, { NONSTANDARD_allowLegacyEncoding: true });
        const ret = charsetEncoder.encode(text);

        return ret;
    }


}
