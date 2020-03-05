import { ValidatorFn, AbstractControl, FormArray } from "@angular/forms";
import { parsePhoneNumberFromString, PhoneNumber, parsePhoneNumber } from 'libphonenumber-js';

export const UbiValidators: { [key: string]: ValidatorFn } = {
    positiveInteger: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

        const pattern = /^[1-9]{1}[0-9]*$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidPositiveInteger': { value: control.value } };
    },
    integer: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

        const pattern = /^-{0,1}\d+$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidInteger': { value: control.value } };
    },
    /**
     * 数字，包括小数
     */
    number: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

        const pattern = /^-{0,1}\d+\.{0,1}\d*$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidNumber': { value: control.value } };
    },
    groupName: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

        const pattern = /^[^<|>]{1,20}$/i;
        let passed = pattern.test(control.value);
        return passed ? null : { 'invalidGroupName': { value: control.value } };
    },
    channelName: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

        const pattern = /^[^<|>]{1,20}$/i;
        let passed = pattern.test(control.value);
        return passed ? null : { 'invalidChannelName': { value: control.value } };
    },
    fieldName: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

        const pattern = /^[^<|>]{1,20}$/i;
        let passed = pattern.test(control.value);
        return passed ? null : { 'invalidFieldName': { value: control.value } };
    },
    email: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

        const pattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,10}$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidEmail': { value: control.value } };
    },
    username: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

        const pattern = /^[a-zA-Z][0-9a-zA-Z_]{5,14}$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidUsername': { value: control.value } };
    },
    password: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

        const pattern = /^[\x00-\xFF]{8,40}$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidPassword': { value: control.value } };
    },
    phoneCN: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

        const pattern = /^1\d{10}$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidPhoneCN': { value: control.value } };
    },
    phoneIO: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

        const pattern = /^[+]\d{6,}$/i;
        const passed = pattern.test(control.value);

        let passed2 = false;
        try { passed2 = !!parsePhoneNumber(control.value) } catch (e) { };

        return passed && passed2 ? null : { 'invalidPhoneIO': { value: control.value } };
    },
    ascii: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

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
        if (!control.value) return null;

        const passed = /^[\x00-\xFF]*$/.test(control.value);
        return passed ? null : { 'requireASCIIEx': { value: control.value } };
    },
    longitude: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

        const value = parseFloat(control.value);
        return value >= -180 && value <= 180 ? null : { 'invalidLongitude': { value: control.value } };
    },
    latitude: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

        const value = parseFloat(control.value);
        return value >= -90 && value <= 90 ? null : { 'invalidLatitude': { value: control.value } };
    },
    time: (control: AbstractControl): { [key: string]: any } | null => {
        if (!control.value) return null;

        try {
            const segs: string[] = control.value.split(':');
            if (segs.length === 2) {
                if (/^\d{1,2}$/.test(segs[0]) && /^\d{1,2}$/.test(segs[1])) {
                    const h = parseInt(segs[0], 10);
                    const m = parseInt(segs[1], 10);

                    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
                        return null;
                    }
                }
            }
        } catch (e) { }
        return { 'invalidTime': { value: control.value } };
    },
    formArrayDuplicated: (control: FormArray) => {
        const values: string[] = control.value;

        const vMap: { [key: string]: number } = {};
        values.forEach((v) => {
            if (v != null && v.trim() != '') {
                vMap[v] = vMap[v] + 1 || 1;
            }
        });

        const duplicatedArray = values.filter((v) => vMap[v] > 1);
        const duplicatedCount = duplicatedArray.length;

        return !duplicatedCount ? null : { 'duplicated': duplicatedArray };
    }
};
