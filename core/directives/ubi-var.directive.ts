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
    selector: '[ubiVar]'
})
export class UbiVarDirective {
    @Input()
    set ubiVar(context: any) {
        this.context.$implicit = this.context.ubiVar = context;
        this.updateView();
    }

    context: any = {};

    constructor(private vcRef: ViewContainerRef, private templateRef: TemplateRef<any>) { }

    updateView() {
        this.vcRef.clear();
        this.vcRef.createEmbeddedView(this.templateRef, this.context);
    }
}
