import { Component, OnInit, ViewChild, ElementRef, forwardRef, OnChanges, SimpleChanges, Input, AfterViewInit } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';

export const UBI_IPV4_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UbiIpv4InputComponent),
    multi: true
};



/**
 * Not completely implement yet.
 *
 * ref: https://stackoverflow.com/questions/39661430/angular-2-formcontrolname-inside-component
 *
 * @export
 * @class UbiIpv4InputComponent
 * @implements {ControlValueAccessor}
 * @implements {OnInit}
 * @implements {OnChanges}
 * @implements {AfterViewInit}
 */
@Component({
    selector: 'ubi-ipv4-input',
    templateUrl: './ubi-ipv4-input.component.html',
    styleUrls: ['./ubi-ipv4-input.component.scss'],
    providers: [UBI_IPV4_INPUT_CONTROL_VALUE_ACCESSOR],
})
export class UbiIpv4InputComponent implements ControlValueAccessor, OnInit, OnChanges, AfterViewInit {

    private innerValue: string = '';
    private propagateChange: (__: any) => {};

    // errors for the form control will be stored in this array
    errors: Array<any> = [];

    //current form control input. helpful in validating and accessing form control
    @Input() formControl: FormControl;

    // get accessor
    get value(): any {
        return this.innerValue;
    };

    // set accessor including call the onchange callback
    set value(v: any) {
        if (v !== this.innerValue) {
            this.innerValue = v;
        }
    }

    @ViewChild('input1', { static: true }) inputRef1: ElementRef;
    @ViewChild('input2', { static: true }) inputRef2: ElementRef;
    @ViewChild('input3', { static: true }) inputRef3: ElementRef;
    @ViewChild('input4', { static: true }) inputRef4: ElementRef;

    constructor() { }

    private updateView() {
        const value = this.innerValue;

        const segs: string[] =value.split('.');
        this.inputRef1.nativeElement.value = segs[0] || '0';
        this.inputRef2.nativeElement.value = segs[1] || '0';
        this.inputRef3.nativeElement.value = segs[2] || '0';
        this.inputRef4.nativeElement.value = segs[3] || '0';
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
        //Add '${implements OnChanges}' to the class.

        // console.log('c valueChanges:', this.formControl.value);
        // console.log('form init value:', this.formControl.value);

        this.innerValue = this.formControl.value;
        this.updateView();
    }

    ngAfterViewInit(): void {
        //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
        //Add 'implements AfterViewInit' to the class.

        // RESET the custom input form control UI when the form control is RESET
        this.formControl.valueChanges.subscribe(() => {

            // check condition if the form control is RESET
            if (this.formControl.value == '' || this.formControl.value == null || this.formControl.value == undefined) {
                this.innerValue = '';
                this.updateView();
            }
        });
    }

    onInputChange(event, value) {

        const seg1 = this.inputRef1.nativeElement.value;
        const seg2 = this.inputRef2.nativeElement.value;
        const seg3 = this.inputRef3.nativeElement.value;
        const seg4 = this.inputRef4.nativeElement.value;

        //set changed value
        this.innerValue = [seg1, seg2, seg3, seg4].join('.');
        // propagate value into form control using control value accessor interface
        this.propagateChange(this.innerValue);

        //reset errors
        this.errors = [];
        //setting, resetting error messages into an array (to loop) and adding the validation messages to show below the field area
        for (let key in this.formControl.errors) {
            if (this.formControl.errors.hasOwnProperty(key)) {
                this.errors.push(this.formControl.errors[key]);
            }
        }
    }



    writeValue(value: string): void {
        this.innerValue = value;
    }
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    registerOnTouched(fn: any): void {
        // throw new Error("Method not implemented.");
    }
    // setDisabledState?(isDisabled: boolean): void {
    //     throw new Error("Method not implemented.");
    // }
}
