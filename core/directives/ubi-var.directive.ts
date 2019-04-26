import { Directive, Input, ViewContainerRef, TemplateRef } from '@angular/core';


/**
 * 创建临时变量
 * 
 * ref: https://stackoverflow.com/questions/38582293/how-to-declare-a-variable-in-a-template-in-angular
 *
 * @export
 * @class UbiVarDirective
 */
@Directive({
    selector: '[ubiVar]',
    exportAs: 'ubiVar',
})
export class UbiVarDirective {
    @Input()
    ubiVar: any;

    get value(): string {
        return this.ubiVar;
    } 
}
