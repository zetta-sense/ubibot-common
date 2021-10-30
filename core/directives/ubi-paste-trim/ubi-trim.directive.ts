import {
    Directive,
    ElementRef,
    HostListener,
    Inject,
    Input,
    Optional,
    Renderer2,
    NgZone
} from "@angular/core";
import {
    COMPOSITION_BUFFER_MODE,
    ControlValueAccessor,
    NG_VALUE_ACCESSOR,
    NgControl,
} from "@angular/forms";

/**
 * 用于对特定event进行trim input
 *
 * 注意必须要用formControl
 *
 * Ref: https://github.com/anein/angular2-trim-directive
 *
 * @export
 * @class UbiTrimDirective
 * @implements {ControlValueAccessor}
 */
@Directive({
    selector: "input[ubi-trim], textarea[ubi-trim]",
    // providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: UbiTrimDirective, multi: true }]
})
export class UbiTrimDirective {

    @Input()
    set type(value: string) {
        this._type = value || "text";
    }

    /**
     * Get a value of the trim attribute if it was set.
     * 可选指定事件，多事件时用,分隔，目前支持input/blur，未指定时为全部事件
     *
     * @type {string}
     * @memberof UbiPasteTrimDirective
     */
    @Input('ubi-trim') ubiTrim: string;

    /**
     * Keep the type of input element in a cache.
     *
     * @type {string}
     * @private
     */
    private _type: string = "text";

    /**
     * Keep the value of input element in a cache.
     *
     * @type {string}
     * @private
     */
    private _value: string;

    // Source services to modify elements.
    private _sourceRenderer: Renderer2;
    private _sourceElementRef: ElementRef;
    private _sourceControl: NgControl;

    /**
     * Updates the value on the blur event.
     */
    @HostListener("change", ["$event.type", "$event.target.value"])
    onBlur(event: string, value: string): void {
        // console.log('it change...');

        // console.log(this);

        // (this._sourceElementRef.nativeElement as HTMLInputElement).value = value.trim();

        // this.updateValue(event, value);

        // console.log(this._sourceControl);
        // (this._sourceElementRef.nativeElement as HTMLInputElement).value = value.trim();
        this._sourceControl.control.setValue(value.trim());
        this._sourceControl.control.updateValueAndValidity();

        this.onTouched();
    }

    // tag: paste event的target value有延迟问题，目前不能实现
    @HostListener("paste", ["$event.type", "$event.target.value", "$event"])
    onPaste(event: string, value: string, e): void {
        // let content = e.clipboardData.getData('text/plain');
        // console.log('it paste...', content);

        // this._sourceControl.control.setValue(content.trim());
        // this._sourceControl.control.markAsDirty();
        // this._sourceControl.control.updateValueAndValidity();


        // this.onTouched();

        setTimeout(() => { // 必须用setTimeout, ngZone都不行
            let v = this._sourceControl.value;
            console.log('it paste...');

            this._sourceControl.control.setValue(v.trim());
            this._sourceControl.control.updateValueAndValidity();

            this.onTouched();
        });
    }

    /**
     * Updates the value on the input event.
     * 于ios使用中文ime时有bug
     */
    // @HostListener("input", ["$event.type", "$event.target.value"])
    // onInput(event: string, value: string): void {
    //     this.updateValue(event, value);
    // }

    onChange = (_: any) => { };

    onTouched = () => { };

    constructor(
        @Inject(Renderer2) renderer: Renderer2,
        @Inject(ElementRef) elementRef: ElementRef,
        @Inject(NgControl) control: NgControl,
        private ngZone: NgZone,
        @Optional() @Inject(COMPOSITION_BUFFER_MODE) compositionMode: boolean
    ) {
        this._sourceRenderer = renderer;
        this._sourceElementRef = elementRef;
        this._sourceControl = control;
    }

    registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }

    registerOnTouched(fn: () => void): void { this.onTouched = fn; }

    /**
     * Writes a new value to the element based on the type of input element.
     *
     * @param {any} value - new value
     */
    public writeValue(value: any): void {
        //
        // The Template Driven Form doesn't automatically convert undefined values to null. We will do,
        // keeping an empty string as string because the condition `'' || null` returns null what
        // could change the initial state of a model.
        // The Reactive Form does it automatically during initialization.
        //
        // SEE: https://github.com/anein/angular2-trim-directive/issues/18
        //
        this._value = value === "" ? "" : value || null;

        this._sourceRenderer.setProperty(this._sourceElementRef.nativeElement, "value", this._value);

        // a dirty trick (or magic) goes here:
        // it updates the element value if `setProperty` doesn't set a new value for some reason.
        //
        // SEE: https://github.com/anein/angular2-trim-directive/issues/9
        //
        if (this._type !== "text") {
            this._sourceRenderer.setAttribute(this._sourceElementRef.nativeElement, "value", this._value);
        }
    }

    setDisabledState(isDisabled: boolean): void {
        this._sourceRenderer.setProperty(this._sourceElementRef.nativeElement, 'disabled', isDisabled);
    }

    /**
     * Writes the cursor position in safari
     *
     * @param cursorPosition - the cursor current position
     * @param hasTypedSymbol
     */
    private setCursorPointer(cursorPosition: any, hasTypedSymbol: boolean): void {
        // move the cursor to the stored position (Safari usually moves the cursor to the end)
        if (hasTypedSymbol) {
            // For now just works in inputs of type text, in others cause an error
            if (["text", "search", "url", "tel", "password"].indexOf(this._type) >= 0) {
                // Ok, for some reason in the tests the type changed is not being catch and because of that
                // this line is executed and causes an error of DOMException, it pass the text without problem
                // But it should be a better way to validate that type change
                this._sourceElementRef.nativeElement.setSelectionRange(cursorPosition, cursorPosition);
            }
        }
    }

    /**
     * Trims an input value, and sets it to the model and element.
     *
     * @param {string} value - input value
     * @param {string} event - input event
     */
    private updateValue(event: string, value: string): void {
        // console.log(this.ubiPasteTrim, event, value);

        let events: string[] = [];
        if (this.ubiTrim != null) {
            events = this.ubiTrim.split(',').map((x) => x.trim());
        }

        if (this.ubiTrim == null || events.indexOf(event) != -1) {
            // console.log(this.ubiTrim, events, value);
            value = value.trim();
        }

        // // check if the user has set an optional attribute, and Trimmmm!!! Uhahahaha!
        // value = this.trim != null && event !== this.trim ? value : value.trim();

        const previous = this._value;

        // store the cursor position
        const cursorPosition = this._sourceElementRef.nativeElement.selectionStart;

        // write value to the element.
        this.writeValue(value);

        // Update the model only on getting new value, and prevent firing
        // the `dirty` state when click on empty fields.
        //
        // SEE:
        //    https://github.com/anein/angular2-trim-directive/issues/17
        //    https://github.com/anein/angular2-trim-directive/issues/35
        //    https://github.com/anein/angular2-trim-directive/issues/39
        //
        if ((this._value || previous) && this._value.trim() !== previous) {
            this.onChange(this._value);
        }

        // check that non-null value is being changed
        const hasTypedSymbol = value && previous && value !== previous;

        // write the cursor position
        this.setCursorPointer(cursorPosition, hasTypedSymbol);


        // this._sourceControl.control.markAsDirty();
        this._sourceControl.control.updateValueAndValidity();
    }
}
