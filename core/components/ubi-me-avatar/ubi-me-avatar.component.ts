import { Component, Input, OnInit, HostBinding, OnChanges } from '@angular/core';
import { UbiAuthService } from '../../../services/ubi-auth.service';

/**
 * Generated class for the MeAvatarComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
    selector: 'ubi-me-avatar',
    templateUrl: 'ubi-me-avatar.component.html',
    styleUrls: ['ubi-me-avatar.component.scss']
})
export class UbiMeAvatarComponent implements OnInit, OnChanges {

    @Input()
    size = 32;

    @Input()
    logoForEmpty = false;

    @Input()
    rounded = false;

    @HostBinding('style.width') componentWidth;
    @HostBinding('style.height') componentHeight;

    me: any;

    constructor(private authService: UbiAuthService) {
        this.me = authService.me();
    }


    ngOnInit() {
        // console.log('ngOnInit MeAvatarComponent');
        //
        // console.log(`logoForEmpty=${this.logoForEmpty}`);
    }

    ngOnChanges() {
        this.componentWidth = `${this.size}px`;
        this.componentHeight = `${this.size}px`;
    }
}
