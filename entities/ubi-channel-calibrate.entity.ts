
export class UbiChannelCalibrate {
    [fieldKey: string]: string;

    static FromString(rawStr: string): UbiChannelCalibrate {

        let ret = new UbiChannelCalibrate();

        // 尝试从string转换
        try {
            const parsed = JSON.parse(rawStr);

            // // 转换为number
            // Object.keys(parsed).forEach(key => {
            //     let v = parseFloat(parsed[key]);
            //     parsed[key] = v;
            // });

            Object.assign(ret, parsed);

        } catch (e) {
            // console.warn('VConfig parsing error.');
        }

        return ret;
    }
}
