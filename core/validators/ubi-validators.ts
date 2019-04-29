import { ValidatorFn, AbstractControl } from "@angular/forms";

export const UbiValidators: { [key: string]: ValidatorFn } = {
    number: (control: AbstractControl): { [key: string]: any } | null => {
        const pattern = /^-{0,1}\d+\.{0,1}\d*$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidNumber': { value: control.value } };
    },
    username: (control: AbstractControl): { [key: string]: any } | null => {
        const pattern = /^[a-zA-Z][0-9a-zA-Z_]{5,14}$/i;
        const passed = pattern.test(control.value);
        return passed ? null : { 'invalidUsername': { value: control.value } };
    },
};
