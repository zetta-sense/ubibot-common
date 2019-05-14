import { Directive, Input, OnChanges, Renderer2, ElementRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NgControl, FormControl } from '@angular/forms';
import { ConvertValue, UbiValueOptions, ConvertValueReverse } from '../../entities/ubi-channel.entity';
import { UbiChannelFieldDef } from '../../entities/ubi-channel-field-def.entity';
import { UbiExtraPreferenceTempScale } from '../../entities/ubi-extra-preference.entity';


export interface UbiFieldValuePack {
    value: number;
    field: UbiChannelFieldDef;
    options: UbiValueOptions;
}

/**
 * 注意: 必须注意这个directive不支持中途的外部变更!!
 *
 * 因为如果要支持外部变更，必须要implement onChanges，意味这onChange之后必须改写view的值，
 * 但这会导致从view写入model的change也会触发model的onChange，这时虽然不会产生循环，但会产生非一对一的view与model
 * 例如 +2  和  2,  model中都是2，但本应要产生的view则不一样，而parse后导致view都会变为2，前者缺失了+号，
 * 同理，即此时如果用户在输入值的中途，则会因为parse，而导致缺失部分内容
 *
 * 因此只采用在onInit时根据model值更新view的值
 *
 * ref: https://blog.angularindepth.com/never-again-be-confused-when-implementing-controlvalueaccessor-in-angular-forms-93b9eee9ee83
 *
 * @export
 * @class UbiFieldValueDirective
 * @implements {OnInit}
 * @implements {OnChanges}
 */
@Directive({
    selector: '[ubiFieldValue]'
})
export class UbiFieldValueDirective implements OnInit, OnChanges {

    @Input('ubiFieldValue')
    ubiFieldValue: UbiFieldValuePack;

    constructor(
        private renderer: Renderer2,
        private el: ElementRef,
        private ngControl: NgControl,
    ) {
    }

    ngOnInit() {
        this.init();
    }

    ngOnChanges() {
        // console.log('----> onChanges:', this.ubiFieldValue);
    }

    private init() {
        // initialize view value
        const modelValue = this.ubiFieldValue.value;
        const viewValue = modelValue == null ? null : this.format(modelValue);
        this.ngControl.valueAccessor.writeValue(viewValue);

        // view changed callback
        this.ngControl.valueAccessor.registerOnChange((newValue: string) => {
            // this.formControl.setValue(newValue, { emitModelToViewChange: false });
            // console.log('registerOnChange:', newValue);
            const viewValue = newValue;
            const modelValue = this.parse(viewValue);

            // console.log('parsed model val:', modelValue);

            this.ngControl.control.setValue(modelValue, { emitModelToViewChange: false });
        });

        // model changed callback
        this.ngControl.control.valueChanges.subscribe(() => {
            // console.log('----> changed:', this.ngControl.value);
        });
    }

    private parse(raw: string): number | string {
        const value = parseFloat(raw);
        const ret = ConvertValueReverse(value, this.ubiFieldValue.field, this.ubiFieldValue.options);
        return isNaN(ret) ? raw : ret;
    }

    private format(raw: number): string {
        const ret = ConvertValue(raw, this.ubiFieldValue.field, this.ubiFieldValue.options);
        return `${ret}`;
    }

}
