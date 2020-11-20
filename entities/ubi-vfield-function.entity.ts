export class UbiVFieldFunction {

    raw: string;

    funcName: string;
    funcParams: string[];

    constructor(raw: string, appendPrefix: boolean = true) {
        this.raw = raw.trim();

        this.convertRaw(appendPrefix ? `func_cal_` : '');
    }

    private convertRaw(funcPrefix: string): void {
        const bracketLeftIdx = this.raw.indexOf('(');
        const bracketRightIdx = this.raw.indexOf(')');


        const funcName = `${funcPrefix}` + this.raw.slice(0, bracketLeftIdx);
        const paramsPart = this.raw.slice(bracketLeftIdx + 1, bracketRightIdx);

        const params: string[] = paramsPart.split(',').map(x => x.trim()).filter(x => x != '');

        this.funcName = funcName;
        this.funcParams = params;
    }

    public static FromCombined(combinedRaw: string): UbiVFieldFunction {
        let ret = new UbiVFieldFunction(combinedRaw, false);
        return ret;
    }

    equalsTo(b: UbiVFieldFunction): boolean {
        if (this.funcName == b.funcName && this.funcParams.length == b.funcParams.length) {
            return true;
        }
        return false;
    }

    clone(): UbiVFieldFunction {
        return new UbiVFieldFunction(this.raw);
    }

    public replaceParam(key: string, val: string): void {
        const foundIdx = this.funcParams.findIndex(x => x == key);
        if (foundIdx != -1) {
            this.funcParams[foundIdx] = val;
        }
    }


    toString(): string {
        const params = this.funcParams.join(',');
        return `${this.funcName}(${params})`;
    }
}
