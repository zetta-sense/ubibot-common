import { ValidatorFn, AbstractControl } from "@angular/forms";

export const UbiValidators: { [key: string]: ValidatorFn } = {
    positiveInteger: (control: AbstractControl): { [key: string]: any } | null => {
        const pattern = /^[1-9]{1}[0-9]*$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidPositiveInteger': { value: control.value } };
    },
    integer: (control: AbstractControl): { [key: string]: any } | null => {
        const pattern = /^-{0,1}\d+$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidInteger': { value: control.value } };
    },
    /**
     * 数字，包括小数
     */
    number: (control: AbstractControl): { [key: string]: any } | null => {
        const pattern = /^-{0,1}\d+\.{0,1}\d*$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidNumber': { value: control.value } };
    },
    groupName: (control: AbstractControl): { [key: string]: any } | null => {
        const pattern = /^[^<|>]{1,20}$/i;
        let passed = pattern.test(control.value);
        return passed ? null : { 'invalidGroupName': { value: control.value } };
    },
    channelName: (control: AbstractControl): { [key: string]: any } | null => {
        const pattern = /^[^<|>]{1,20}$/i;
        let passed = pattern.test(control.value);
        return passed ? null : { 'invalidChannelName': { value: control.value } };
    },
    email: (control: AbstractControl): { [key: string]: any } | null => {
        const pattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,10}$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidEmail': { value: control.value } };
    },
    username: (control: AbstractControl): { [key: string]: any } | null => {
        const pattern = /^[a-zA-Z][0-9a-zA-Z_]{5,14}$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidUsername': { value: control.value } };
    },
    password: (control: AbstractControl): { [key: string]: any } | null => {
        const pattern = /^[\x00-\xFF]{8,40}$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidPassword': { value: control.value } };
    },
    phoneCN: (control: AbstractControl): { [key: string]: any } | null => {
        const pattern = /^1\d{10}$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidPhoneCN': { value: control.value } };
    },
    phoneIO: (control: AbstractControl): { [key: string]: any } | null => {
        const pattern = /^[+]\d{6,}$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidPhoneIO': { value: control.value } };
    },
    ascii: (control: AbstractControl): { [key: string]: any } | null => {
        const passed = /^[\x00-\x7F]*$/.test(control.value);
        return passed ? null : { 'requireASCII': { value: control.value } };
    },
    ipv4: (control: AbstractControl): { [key: string]: any } | null => {
        if (control.value) {
            const seg4check = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(control.value);

            let valueCheck = true;
            try {
                const segs: string[] = control.value.split('.');
                for (let i = 0; i < 4; i++) {
                    const v = parseInt(segs[i], 10);
                    if (v >= 0 && v <= 255) {
                        // do nothing
                    } else {
                        valueCheck = false;
                        break;
                    }
                }
            } catch (e) {
                valueCheck = false;
            }

            return seg4check && valueCheck ? null : { 'invalidIPv4': { value: control.value } };
        }

        return null;
    },
    // ASCII 拓展
    asciiEx: (control: AbstractControl): { [key: string]: any } | null => {
        const passed = /^[\x00-\xFF]*$/.test(control.value);
        return passed ? null : { 'requireASCIIEx': { value: control.value } };
    },
};
